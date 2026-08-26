/**
 * Phase 5: Batch Import Service
 * Orchestrates importing metrics from various data sources
 */

import { submitDimensionMetrics } from './metricsService';
import { GoogleClassroomConnector, processLMSDataToMetrics } from './lmsConnectors';
import { METRICS_DEFINITIONS } from './metricsDefinitions';

// ============================================================================
// TYPES
// ============================================================================

export interface BatchImportJob {
  id: string;
  schoolId: string;
  cycleId: string;
  source: 'EXCEL' | 'LMS' | 'API';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startTime: Date;
  endTime?: Date;
  totalMetrics: number;
  importedMetrics: number;
  failedMetrics: number;
  errors: string[];
}

export interface ImportMetricData {
  metricId: string;
  value: number | string;
  dataSource: string;
  sourceDetails?: string;
  notes?: string;
}

// ============================================================================
// BATCH IMPORT ORCHESTRATOR
// ============================================================================

export class BatchImportService {
  private jobs: Map<string, BatchImportJob> = new Map();

  /**
   * Create a new import job
   */
  createJob(
    schoolId: string,
    cycleId: string,
    source: 'EXCEL' | 'LMS' | 'API'
  ): BatchImportJob {
    const job: BatchImportJob = {
      id: `job-${Date.now()}`,
      schoolId,
      cycleId,
      source,
      status: 'PENDING',
      startTime: new Date(),
      totalMetrics: 0,
      importedMetrics: 0,
      failedMetrics: 0,
      errors: [],
    };

    this.jobs.set(job.id, job);
    return job;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): BatchImportJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Import metrics from Excel data
   */
  async importFromExcel(
    schoolId: string,
    cycleId: string,
    excelMetrics: Record<string, ImportMetricData[]>
  ): Promise<BatchImportJob> {
    const job = this.createJob(schoolId, cycleId, 'EXCEL');
    job.status = 'IN_PROGRESS';

    try {
      let totalImported = 0;
      let totalFailed = 0;

      // Import each dimension
      for (const [dimensionStr, metrics] of Object.entries(excelMetrics)) {
        const dimensionId = parseInt(dimensionStr);
        job.totalMetrics += metrics.length;

        try {
          const metricsToSubmit: Record<string, any> = {};

          for (const metric of metrics) {
            // Validate metric
            const definition = METRICS_DEFINITIONS.find((m) => m.id === metric.metricId);
            if (!definition) {
              job.errors.push(`Metric ${metric.metricId} not found in definitions`);
              totalFailed++;
              continue;
            }

            metricsToSubmit[metric.metricId] = {
              value: metric.value,
              dataSource: metric.dataSource,
              sourceDetails: metric.sourceDetails,
              notes: metric.notes,
              isVerified: false,
            };

            totalImported++;
          }

          // Submit dimension metrics
          if (Object.keys(metricsToSubmit).length > 0) {
            await submitDimensionMetrics(
              schoolId,
              cycleId,
              dimensionId,
              metricsToSubmit,
              'batch-import'
            );
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          job.errors.push(`Dimension ${dimensionId}: ${errorMsg}`);
          totalFailed += metrics.length;
        }
      }

      job.status = 'COMPLETED';
      job.importedMetrics = totalImported;
      job.failedMetrics = totalFailed;
      job.endTime = new Date();
    } catch (error) {
      job.status = 'FAILED';
      job.errors.push(error instanceof Error ? error.message : 'Unknown error');
      job.endTime = new Date();
    }

    return job;
  }

  /**
   * Import metrics from LMS (Google Classroom)
   */
  async importFromGoogleClassroom(
    schoolId: string,
    cycleId: string,
    accessToken: string,
    courseIds: string[]
  ): Promise<BatchImportJob> {
    const job = this.createJob(schoolId, cycleId, 'LMS');
    job.status = 'IN_PROGRESS';

    try {
      const connector = new GoogleClassroomConnector(accessToken);
      let totalImported = 0;

      // Process each course
      for (const courseId of courseIds) {
        try {
          const courses = await connector.getCourses();
          const course = courses.find((c) => c.id === courseId);

          if (!course) {
            job.errors.push(`Course ${courseId} not found`);
            continue;
          }

          // Get grades and convert to metrics
          const grades = await connector.getStudentGrades(courseId);
          const metrics = processLMSDataToMetrics('GOOGLE_CLASSROOM', course, grades);

          if (metrics.length > 0) {
            // Group by dimension
            const metricsToSubmit: Record<string, any> = {};

            for (const metric of metrics) {
              metricsToSubmit[metric.metricId] = {
                value: metric.value,
                dataSource: metric.dataSource,
                sourceDetails: metric.sourceDetails,
                isVerified: true, // LMS data is verified
              };
            }

            // Determine dimension from first metric
            const firstMetricDimension = parseInt(metrics[0].metricId.charAt(0));

            await submitDimensionMetrics(
              schoolId,
              cycleId,
              firstMetricDimension,
              metricsToSubmit,
              'batch-import-lms'
            );

            totalImported += metrics.length;
            job.totalMetrics += metrics.length;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          job.errors.push(`Course ${courseId}: ${errorMsg}`);
        }
      }

      job.status = 'COMPLETED';
      job.importedMetrics = totalImported;
      job.endTime = new Date();
    } catch (error) {
      job.status = 'FAILED';
      job.errors.push(error instanceof Error ? error.message : 'Unknown error');
      job.endTime = new Date();
    }

    return job;
  }

  /**
   * Generate import report
   */
  generateReport(job: BatchImportJob): string {
    const duration = job.endTime
      ? Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)
      : 0;

    const report = `
Batch Import Report
===================
Job ID: ${job.id}
Status: ${job.status}
Source: ${job.source}
Duration: ${duration}s

Metrics:
- Total: ${job.totalMetrics}
- Imported: ${job.importedMetrics}
- Failed: ${job.failedMetrics}
- Success Rate: ${job.totalMetrics > 0 ? Math.round((job.importedMetrics / job.totalMetrics) * 100) : 0}%

${job.errors.length > 0 ? `Errors:\n${job.errors.map((e) => `- ${e}`).join('\n')}` : 'No errors'}
    `.trim();

    return report;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): BatchImportJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: BatchImportJob['status']): BatchImportJob[] {
    return Array.from(this.jobs.values()).filter((j) => j.status === status);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const batchImportService = new BatchImportService();
