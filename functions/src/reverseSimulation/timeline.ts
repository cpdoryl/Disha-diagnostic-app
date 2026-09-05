import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getDb } from '../lib/db';
import { CalculationEngine } from './calculationEngine';

const db = getDb();
const logger = functions.logger;
const engine = new CalculationEngine();

/**
 * Generate 12-Month Timeline with Milestones
 * HTTP Callable Cloud Function
 *
 * Input:
 * - simulationId: string
 * - actionPlan: [{ dimensionId, totalEstimatedCost, implementationWeeks }]
 * - currentDimensions: { D01: number, ... }
 * - targetDimensions: { D01: number, ... }
 * - timelineMonths: number
 *
 * Output:
 * - success: boolean
 * - timeline: {
 *     phases: [{ month, name, deliverables, kpis }],
 *     milestones: [{ month, name, description }],
 *     riskFactors: [],
 *     contingencyPlan: []
 *   }
 */
export const generateTimeline = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    try {
      // 1. Verify authentication
      if (!context.auth) {
        logger.warn('Unauthenticated generateTimeline call');
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        );
      }

      const userId = context.auth.uid;
      logger.info('generateTimeline called', {
        userId,
        simulationId: data.simulationId,
      });

      // 2. Validate required fields
      const requiredFields = [
        'simulationId',
        'actionPlan',
        'currentDimensions',
        'targetDimensions',
        'timelineMonths',
      ];

      for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
          logger.error('Missing required field', { field });
          throw new functions.https.HttpsError(
            'invalid-argument',
            `Missing required field: ${field}`
          );
        }
      }

      // 3. Validate actionPlan array
      if (!Array.isArray(data.actionPlan) || data.actionPlan.length === 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'actionPlan must be a non-empty array'
        );
      }

      // 4. Validate timeline
      if (typeof data.timelineMonths !== 'number' || data.timelineMonths < 3 || data.timelineMonths > 24) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'timelineMonths must be between 3 and 24'
        );
      }

      logger.info('Generating 12-month timeline', {
        actionPlanItems: data.actionPlan.length,
        timelineMonths: data.timelineMonths,
      });

      // 5. Use CalculationEngine to generate base timeline
      const baseTimeline = engine.generateTimeline(
        data.targetDimensions,
        data.currentDimensions,
        data.timelineMonths
      );

      // 6. Create detailed phases
      const phases = [
        {
          phase: 1,
          name: 'Foundation: Quick Wins & Setup',
          startMonth: 0,
          endMonth: 3,
          duration: 3,
          description: 'Quick wins, team alignment, process setup',
          deliverables: [
            'Kick-off workshop completed',
            'Core team identified and trained',
            'Project management system set up',
            'Quick win initiatives launched (2-3)',
          ],
          activities: data.actionPlan.slice(0, 3).map((action) => ({
            activity: action.interventions?.[0]?.activity || `${action.dimensionId} initiative`,
            owner: 'TBD',
            deadline: '6 weeks',
            status: 'planned',
          })),
          targetImprovementPoints: Math.round(
            Object.values(data.targetDimensions).reduce(
              (a, b) => a + (b as number),
              0
            ) / 14 * 0.25
          ),
          kpis: [
            { metric: 'Quick wins delivered', target: '2-3' },
            { metric: 'Team alignment score', target: '>80%' },
            { metric: 'Implementation progress', target: '25% complete' },
          ],
        },
        {
          phase: 2,
          name: 'Build: Major Implementations',
          startMonth: 3,
          endMonth: 9,
          duration: 6,
          description: 'Major initiatives, sustained effort, midcourse corrections',
          deliverables: [
            'Core improvement initiatives on track',
            'Quarterly review completed',
            '50% of annual targets achieved',
            'Team morale and engagement high',
          ],
          activities: data.actionPlan.slice(0, 6).map((action, idx) => ({
            activity: action.interventions?.[0]?.activity || `${action.dimensionId} implementation`,
            owner: 'TBD',
            deadline: `Month ${3 + idx}`,
            status: 'planned',
          })),
          targetImprovementPoints: Math.round(
            Object.values(data.targetDimensions).reduce(
              (a, b) => a + (b as number),
              0
            ) / 14 * 0.50
          ),
          kpis: [
            { metric: 'Initiatives on track', target: '>90%' },
            { metric: 'Budget adherence', target: '±5%' },
            { metric: 'Implementation progress', target: '75% complete' },
            { metric: 'Quality of implementation', target: '>80%' },
          ],
        },
        {
          phase: 3,
          name: 'Optimize: Fine-Tuning & Assessment',
          startMonth: 9,
          endMonth: data.timelineMonths,
          duration: Math.max(3, data.timelineMonths - 9),
          description: 'Refinements, final push, sustainability planning',
          deliverables: [
            'All planned initiatives completed',
            'Target health score achieved',
            'Sustainability plan documented',
            'Success stories documented',
          ],
          activities: [
            {
              activity: 'Fine-tuning and optimization',
              owner: 'Leadership',
              deadline: 'Month 10-11',
              status: 'planned',
            },
            {
              activity: 'Final assessment and evaluation',
              owner: 'Assessment team',
              deadline: `Month ${data.timelineMonths}`,
              status: 'planned',
            },
            {
              activity: 'Sustainability plan finalization',
              owner: 'Leadership',
              deadline: 'Month 12',
              status: 'planned',
            },
          ],
          targetImprovementPoints: Math.round(
            Object.values(data.targetDimensions).reduce(
              (a, b) => a + (b as number),
              0
            ) / 14
          ),
          kpis: [
            { metric: 'Target achievement', target: '100%' },
            { metric: 'Sustainability readiness', target: '>85%' },
            { metric: 'Stakeholder satisfaction', target: '>90%' },
          ],
        },
      ];

      // 7. Create detailed milestones
      const milestones = [
        {
          month: 0,
          name: '🎯 Kickoff',
          description: 'Project approved, goals aligned, team mobilized',
          deliverables: ['Kick-off meeting', 'Resource allocation confirmed'],
          dependencies: [],
        },
        {
          month: 1,
          name: '⚡ Quick Wins Visible',
          description: 'First quick win initiatives showing results',
          deliverables: ['2-3 quick wins completed', 'Team confidence high'],
          dependencies: ['Phase 1 initiation'],
        },
        {
          month: 3,
          name: '✅ Phase 1 Complete',
          description: 'Foundation phase complete, ready to scale',
          deliverables: ['Phase 1 review', 'Budget and timeline confirmed'],
          dependencies: ['All Phase 1 activities'],
          targetScore: Math.round(
            (Object.values(data.currentDimensions).reduce((a, b) => a + (b as number), 0) / 14) * 1.03
          ),
        },
        {
          month: 6,
          name: '📊 Mid-Year Review',
          description: 'Halfway through - major initiatives 50% complete',
          deliverables: ['Progress review', 'Midcourse corrections identified'],
          dependencies: ['Phase 2 execution'],
          targetScore: Math.round(
            (Object.values(data.currentDimensions).reduce((a, b) => a + (b as number), 0) / 14) * 1.06
          ),
        },
        {
          month: 9,
          name: '🏆 Phase 2 Complete',
          description: 'Major improvements realized, 75% targets achieved',
          deliverables: ['Phase 2 review', 'Optimization planning'],
          dependencies: ['All Phase 2 initiatives'],
          targetScore: Math.round(
            (Object.values(data.currentDimensions).reduce((a, b) => a + (b as number), 0) / 14) * 1.09
          ),
        },
        {
          month: data.timelineMonths,
          name: '🎊 Target Achieved',
          description: 'Final assessment complete, goals achieved, plan sustained',
          deliverables: [
            'Final assessment report',
            'Sustainability plan active',
            'Success documented',
          ],
          dependencies: ['Phase 3 completion'],
          targetScore: Math.round(
            Object.values(data.targetDimensions).reduce((a, b) => a + (b as number), 0) /
              14
          ),
        },
      ];

      // 8. Identify risk factors and contingencies
      const riskFactors = [
        {
          risk: 'Key personnel turnover',
          probability: 'Medium',
          impact: 'High',
          mitigation: 'Succession planning, cross-training',
        },
        {
          risk: 'Budget overrun',
          probability: 'Low',
          impact: 'Medium',
          mitigation: '10% contingency buffer allocated',
        },
        {
          risk: 'Resistance to change',
          probability: 'Medium',
          impact: 'High',
          mitigation: 'Stakeholder engagement, clear communication',
        },
        {
          risk: 'Scope creep',
          probability: 'High',
          impact: 'Medium',
          mitigation: 'Change control process, scope lock at Phase 1',
        },
      ];

      const contingencyPlan = [
        {
          trigger: 'Milestone health < 80% on track',
          response: 'Emergency review, resource reallocation',
          owner: 'Leadership',
          timeToRespond: '1 week',
        },
        {
          trigger: 'Budget overrun > 10%',
          response: 'Review activities, identify optimizations',
          owner: 'Finance',
          timeToRespond: '2 weeks',
        },
        {
          trigger: 'Key personnel departure',
          response: 'Activate succession plan, communicate changes',
          owner: 'HR',
          timeToRespond: 'Immediate',
        },
        {
          trigger: 'External market changes',
          response: 'Reassess priorities, adjust plan',
          owner: 'Leadership',
          timeToRespond: '3 weeks',
        },
      ];

      // 9. Prepare timeline object for storage
      const schoolId = data.schoolId || userId;
      const timelineData = {
        simulationId: data.simulationId,
        totalMonths: data.timelineMonths,
        startDate: new Date().toISOString().split('T')[0],
        targetEndDate: new Date(Date.now() + data.timelineMonths * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        phases: phases,
        milestones: milestones,
        riskFactors: riskFactors,
        contingencyPlan: contingencyPlan,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'planned',
      };

      // 10. Save timeline to Firestore
      await db
        .collection('schools')
        .doc(schoolId)
        .collection('reverseSimulations')
        .doc(data.simulationId)
        .collection('timeline')
        .doc('current')
        .set(timelineData);

      logger.info('Timeline generated and saved successfully', {
        userId,
        simulationId: data.simulationId,
        months: data.timelineMonths,
      });

      // 11. Return response
      return {
        success: true,
        message: '12-month timeline generated successfully',
        timeline: {
          totalMonths: data.timelineMonths,
          phases: phases.map((p) => ({
            phase: p.phase,
            name: p.name,
            duration: p.duration,
            description: p.description,
            deliverables: p.deliverables,
            kpis: p.kpis,
          })),
          milestones: milestones.map((m) => ({
            month: m.month,
            name: m.name,
            description: m.description,
            deliverables: m.deliverables,
          })),
          riskFactors: riskFactors,
          summary: {
            totalPhases: phases.length,
            totalMilestones: milestones.length,
            keyDeliverables: milestones.flatMap((m) => m.deliverables).length,
            riskCount: riskFactors.length,
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error in generateTimeline', error);
      throw error;
    }
  });
