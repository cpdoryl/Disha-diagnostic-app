/**
 * Challenge Data Requirements System
 * Defines required metrics for objective analysis of each challenge
 * Used to validate uploaded data completeness
 */

export interface MetricRequirement {
  fieldName: string;
  displayName: string;
  description: string;
  unit: string;
  example: string;
  mandatory: boolean;
  dataType: 'number' | 'percentage' | 'count' | 'hours' | 'ratio';
}

export interface ChallengeDataRequirement {
  challengeId: string;
  challengeName: string;
  category: string;
  requiredMetrics: MetricRequirement[];
  optionalMetrics: MetricRequirement[];
  sampleDataFile: string;
}

// ============================================================================
// 15 CHALLENGES DATA REQUIREMENTS
// ============================================================================

export const CHALLENGE_DATA_REQUIREMENTS: Record<string, ChallengeDataRequirement> = {
  // GROWTH & ENROLLMENT CHALLENGES
  C1_ENROLLMENT_DECLINE: {
    challengeId: 'C1',
    challengeName: 'Enrollment Decline',
    category: 'Growth & Enrollment',
    requiredMetrics: [
      {
        fieldName: 'new_enrollment_rate',
        displayName: 'New Enrollment Rate',
        description: 'Year-over-year enrollment growth percentage',
        unit: 'percentage',
        example: '15% (or -10% for decline)',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'total_current_students',
        displayName: 'Total Current Students',
        description: 'Total enrolled students this year',
        unit: 'count',
        example: '1260',
        mandatory: true,
        dataType: 'count'
      },
      {
        fieldName: 'retention_rate_pct',
        displayName: 'Student Retention Rate',
        description: 'Grade 1 to Grade 12 retention percentage',
        unit: 'percentage',
        example: '82%',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'enrollment_trend_3yr',
        displayName: '3-Year Enrollment Trend',
        description: 'Student count trend over 3 years',
        unit: 'count',
        example: '1350, 1300, 1260',
        mandatory: false,
        dataType: 'count'
      },
      {
        fieldName: 'competitive_positioning',
        displayName: 'Competitive Positioning Score',
        description: 'How school ranks vs competitors',
        unit: 'percentage',
        example: '65%',
        mandatory: false,
        dataType: 'percentage'
      }
    ],
    sampleDataFile: 'Enrollment_Data.csv'
  },

  C2_STUDENT_ATTRITION: {
    challengeId: 'C2',
    challengeName: 'Student Attrition',
    category: 'Growth & Enrollment',
    requiredMetrics: [
      {
        fieldName: 'midyear_dropout_rate_pct',
        displayName: 'Mid-Year Dropout Rate',
        description: 'Percentage of students leaving mid-year',
        unit: 'percentage',
        example: '5%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'outflow_to_competitors_pct',
        displayName: 'Outflow to Competitors',
        description: 'Students leaving to competitor schools',
        unit: 'percentage',
        example: '3%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'primary_attrition_reasons',
        displayName: 'Primary Attrition Reasons',
        description: 'Main reasons for student exit (affordability, safety, quality)',
        unit: 'text',
        example: 'Affordability: 45%, Quality: 30%, Safety: 25%',
        mandatory: true,
        dataType: 'count'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'student_satisfaction_score',
        displayName: 'Student Satisfaction',
        description: 'Student NPS or satisfaction score',
        unit: 'score',
        example: '7.2/10',
        mandatory: false,
        dataType: 'number'
      },
      {
        fieldName: 'parent_satisfaction_score',
        displayName: 'Parent Satisfaction',
        description: 'Parent NPS or satisfaction score',
        unit: 'score',
        example: '7.5/10',
        mandatory: false,
        dataType: 'number'
      }
    ],
    sampleDataFile: 'Attrition_Data.csv'
  },

  C3_STAFF_TURNOVER: {
    challengeId: 'C3',
    challengeName: 'Staff Turnover',
    category: 'People & Staffing',
    requiredMetrics: [
      {
        fieldName: 'teacher_turnover_rate_pct',
        displayName: 'Teacher Turnover Rate',
        description: 'Annual teacher attrition rate',
        unit: 'percentage',
        example: '18%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'admin_turnover_rate_pct',
        displayName: 'Admin Staff Turnover',
        description: 'Annual admin staff attrition rate',
        unit: 'percentage',
        example: '12%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'average_teacher_tenure_yrs',
        displayName: 'Average Teacher Tenure',
        description: 'Average years of service for teachers',
        unit: 'years',
        example: '6.5',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'teacher_burnout_score',
        displayName: 'Teacher Burnout Score',
        description: 'Burnout index (0-100, higher = more burnout)',
        unit: 'score',
        example: '62',
        mandatory: true,
        dataType: 'number'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'salary_competitiveness_percentile',
        displayName: 'Salary Competitiveness',
        description: 'How salaries rank vs regional average',
        unit: 'percentile',
        example: '45th percentile',
        mandatory: false,
        dataType: 'percentage'
      },
      {
        fieldName: 'job_satisfaction_score',
        displayName: 'Job Satisfaction',
        description: 'Teacher job satisfaction rating',
        unit: 'score',
        example: '6.8/10',
        mandatory: false,
        dataType: 'number'
      }
    ],
    sampleDataFile: 'Staff_Turnover_Data.csv'
  },

  C4_ACADEMIC_PERFORMANCE: {
    challengeId: 'C4',
    challengeName: 'Academic Performance Gap',
    category: 'Academic & Student Wellbeing',
    requiredMetrics: [
      {
        fieldName: 'board_exam_pass_rate_pct',
        displayName: 'Board Exam Pass Rate',
        description: 'Percentage of students passing board exams',
        unit: 'percentage',
        example: '82%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'average_exam_score',
        displayName: 'Average Exam Score',
        description: 'Average score out of 100',
        unit: 'score',
        example: '76',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'curriculum_coverage_pct',
        displayName: 'Curriculum Coverage',
        description: 'Percentage of curriculum completed',
        unit: 'percentage',
        example: '88%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'subject_wise_performance',
        displayName: 'Subject-wise Performance',
        description: 'Performance by subject (Math, Science, English)',
        unit: 'score',
        example: 'Math: 78, Science: 80, English: 75',
        mandatory: true,
        dataType: 'number'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'remedial_program_coverage_pct',
        displayName: 'Remedial Program Coverage',
        description: 'Percentage of struggling students in remedial programs',
        unit: 'percentage',
        example: '32%',
        mandatory: false,
        dataType: 'percentage'
      },
      {
        fieldName: 'learning_outcome_assessment',
        displayName: 'Learning Outcome Assessment',
        description: 'Internal assessment scores vs board performance',
        unit: 'score',
        example: '84 internal vs 76 board',
        mandatory: false,
        dataType: 'number'
      }
    ],
    sampleDataFile: 'Academic_Performance_Data.csv'
  },

  C5_STUDENT_WELLBEING: {
    challengeId: 'C5',
    challengeName: 'Student Wellbeing Issues',
    category: 'Academic & Student Wellbeing',
    requiredMetrics: [
      {
        fieldName: 'student_attendance_rate_pct',
        displayName: 'Student Attendance Rate',
        description: 'Daily attendance percentage',
        unit: 'percentage',
        example: '91%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'dropout_rate_pct',
        displayName: 'Dropout Rate',
        description: 'Annual student dropout percentage',
        unit: 'percentage',
        example: '3%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'mental_health_support_available',
        displayName: 'Mental Health Support',
        description: 'Number of counselors/mental health professionals',
        unit: 'count',
        example: '2',
        mandatory: true,
        dataType: 'count'
      },
      {
        fieldName: 'bullying_complaint_rate',
        displayName: 'Bullying Complaint Rate',
        description: 'Number of bullying complaints per 100 students',
        unit: 'ratio',
        example: '2.5',
        mandatory: true,
        dataType: 'ratio'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'school_safety_rating',
        displayName: 'School Safety Rating',
        description: 'Student perception of safety (1-10)',
        unit: 'score',
        example: '8.2/10',
        mandatory: false,
        dataType: 'number'
      },
      {
        fieldName: 'student_wellness_program_participation',
        displayName: 'Wellness Program Participation',
        description: 'Percentage of students in wellness programs',
        unit: 'percentage',
        example: '65%',
        mandatory: false,
        dataType: 'percentage'
      }
    ],
    sampleDataFile: 'Wellbeing_Data.csv'
  },

  C6_INFRASTRUCTURE: {
    challengeId: 'C6',
    challengeName: 'Infrastructure Gaps',
    category: 'Operations & Finance',
    requiredMetrics: [
      {
        fieldName: 'students_per_classroom',
        displayName: 'Student-Teacher Ratio',
        description: 'Average students per classroom',
        unit: 'ratio',
        example: '28',
        mandatory: true,
        dataType: 'ratio'
      },
      {
        fieldName: 'sanitation_facilities_per_100_students',
        displayName: 'Sanitation Facilities',
        description: 'Number of toilets per 100 students',
        unit: 'ratio',
        example: '3',
        mandatory: true,
        dataType: 'ratio'
      },
      {
        fieldName: 'classroom_quality_index',
        displayName: 'Classroom Quality Index',
        description: 'Infrastructure quality score (0-100)',
        unit: 'score',
        example: '72',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'digital_infrastructure_status',
        displayName: 'Digital Infrastructure',
        description: 'Internet bandwidth, lab computers, smart boards count',
        unit: 'mixed',
        example: '50Mbps, 40 computers, 15 smart boards',
        mandatory: true,
        dataType: 'count'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'maintenance_backlog_months',
        displayName: 'Maintenance Backlog',
        description: 'Months of pending maintenance work',
        unit: 'months',
        example: '6',
        mandatory: false,
        dataType: 'number'
      },
      {
        fieldName: 'building_safety_compliance_pct',
        displayName: 'Building Safety Compliance',
        description: 'Percentage of safety standards met',
        unit: 'percentage',
        example: '85%',
        mandatory: false,
        dataType: 'percentage'
      }
    ],
    sampleDataFile: 'Infrastructure_Data.csv'
  },

  C7_TEACHER_DEVELOPMENT: {
    challengeId: 'C7',
    challengeName: 'Inadequate Teacher Development',
    category: 'People & Staffing',
    requiredMetrics: [
      {
        fieldName: 'annual_training_hours',
        displayName: 'Annual Training Hours',
        description: 'CPD hours per teacher per year',
        unit: 'hours',
        example: '20',
        mandatory: true,
        dataType: 'hours'
      },
      {
        fieldName: 'certified_teachers_pct',
        displayName: 'Certified Teachers',
        description: 'Percentage of teachers with formal certifications',
        unit: 'percentage',
        example: '85%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'weekly_planning_hours',
        displayName: 'Weekly Planning Hours',
        description: 'Hours per week for lesson planning',
        unit: 'hours',
        example: '4',
        mandatory: true,
        dataType: 'hours'
      },
      {
        fieldName: 'pedagogical_training_coverage_pct',
        displayName: 'Pedagogical Training Coverage',
        description: 'Percentage of teachers trained in modern pedagogy',
        unit: 'percentage',
        example: '62%',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'teacher_tech_literacy_pct',
        displayName: 'Digital Literacy',
        description: 'Percentage of teachers proficient in digital tools',
        unit: 'percentage',
        example: '58%',
        mandatory: false,
        dataType: 'percentage'
      },
      {
        fieldName: 'mentorship_program_active',
        displayName: 'Mentorship Program',
        description: 'Whether peer/senior mentorship exists (Yes/No)',
        unit: 'boolean',
        example: 'Yes',
        mandatory: false,
        dataType: 'count'
      }
    ],
    sampleDataFile: 'Teacher_Development_Data.csv'
  },

  C8_PARENT_ENGAGEMENT: {
    challengeId: 'C8',
    challengeName: 'Low Parent Engagement',
    category: 'Reputation & Competition',
    requiredMetrics: [
      {
        fieldName: 'parent_query_response_sla_hours',
        displayName: 'Parent Query Response SLA',
        description: 'Average response time to parent queries (hours)',
        unit: 'hours',
        example: '24',
        mandatory: true,
        dataType: 'hours'
      },
      {
        fieldName: 'parent_meeting_attendance_pct',
        displayName: 'Parent Meeting Attendance',
        description: 'Percentage of parents attending school events',
        unit: 'percentage',
        example: '42%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'parent_satisfaction_nps',
        displayName: 'Parent NPS Score',
        description: 'Net Promoter Score from parent survey',
        unit: 'score',
        example: '35',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'parent_volunteer_participation_pct',
        displayName: 'Parent Volunteer Participation',
        description: 'Percentage of parents volunteering',
        unit: 'percentage',
        example: '28%',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'parent_portal_usage_pct',
        displayName: 'Parent Portal Usage',
        description: 'Percentage of parents using digital portal',
        unit: 'percentage',
        example: '55%',
        mandatory: false,
        dataType: 'percentage'
      },
      {
        fieldName: 'communication_channels_available',
        displayName: 'Communication Channels',
        description: 'Number of communication methods (email, WhatsApp, SMS, etc)',
        unit: 'count',
        example: '4',
        mandatory: false,
        dataType: 'count'
      }
    ],
    sampleDataFile: 'Parent_Engagement_Data.csv'
  },

  C9_FINANCIAL_HEALTH: {
    challengeId: 'C9',
    challengeName: 'Financial Sustainability',
    category: 'Operations & Finance',
    requiredMetrics: [
      {
        fieldName: 'fee_collection_rate_pct',
        displayName: 'Fee Collection Rate',
        description: 'Percentage of fees collected',
        unit: 'percentage',
        example: '88%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'budget_execution_pct',
        displayName: 'Budget Execution',
        description: 'Percentage of budget spent',
        unit: 'percentage',
        example: '92%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'fee_default_rate_pct',
        displayName: 'Fee Default Rate',
        description: 'Percentage of fees not collected',
        unit: 'percentage',
        example: '12%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'operational_cost_per_student',
        displayName: 'Operational Cost per Student',
        description: 'Annual operational cost per student',
        unit: 'amount',
        example: '15000',
        mandatory: true,
        dataType: 'number'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'revenue_diversification_sources',
        displayName: 'Revenue Diversification',
        description: 'Number of revenue sources',
        unit: 'count',
        example: '4',
        mandatory: false,
        dataType: 'count'
      },
      {
        fieldName: 'financial_reserves_months',
        displayName: 'Financial Reserves',
        description: 'Months of operating expense in reserves',
        unit: 'months',
        example: '3',
        mandatory: false,
        dataType: 'number'
      }
    ],
    sampleDataFile: 'Financial_Data.csv'
  },

  C10_DIGITAL_READINESS: {
    challengeId: 'C10',
    challengeName: 'Digital Transformation Lag',
    category: 'Operations & Finance',
    requiredMetrics: [
      {
        fieldName: 'smart_classroom_coverage_pct',
        displayName: 'Smart Classroom Coverage',
        description: 'Percentage of classrooms with digital infrastructure',
        unit: 'percentage',
        example: '45%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'learning_management_system_active',
        displayName: 'LMS Active',
        description: 'Whether LMS is actively used (Yes/No)',
        unit: 'boolean',
        example: 'No',
        mandatory: true,
        dataType: 'count'
      },
      {
        fieldName: 'teacher_digital_literacy_pct',
        displayName: 'Teacher Digital Literacy',
        description: 'Percentage of teachers comfortable with digital tools',
        unit: 'percentage',
        example: '58%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'internet_bandwidth_mbps',
        displayName: 'Internet Bandwidth',
        description: 'Available internet bandwidth in Mbps',
        unit: 'mbps',
        example: '50',
        mandatory: true,
        dataType: 'number'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'student_device_access_pct',
        displayName: 'Student Device Access',
        description: 'Percentage of students with device access',
        unit: 'percentage',
        example: '72%',
        mandatory: false,
        dataType: 'percentage'
      },
      {
        fieldName: 'cybersecurity_training_completed',
        displayName: 'Cybersecurity Training',
        description: 'Percentage of staff trained in cybersecurity',
        unit: 'percentage',
        example: '35%',
        mandatory: false,
        dataType: 'percentage'
      }
    ],
    sampleDataFile: 'Digital_Readiness_Data.csv'
  },

  C11_COMPLIANCE_GOVERNANCE: {
    challengeId: 'C11',
    challengeName: 'Compliance & Governance Gaps',
    category: 'Operations & Finance',
    requiredMetrics: [
      {
        fieldName: 'sqaaf_compliance_pct',
        displayName: 'SQAAF Compliance',
        description: 'Percentage of SQAAF standards met',
        unit: 'percentage',
        example: '76%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'audit_findings_count',
        displayName: 'Audit Findings',
        description: 'Number of audit findings pending resolution',
        unit: 'count',
        example: '8',
        mandatory: true,
        dataType: 'count'
      },
      {
        fieldName: 'regulation_compliance_audit_rating',
        displayName: 'Regulation Compliance Rating',
        description: 'Overall compliance rating (1-10)',
        unit: 'score',
        example: '6.5',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'policy_documentation_completeness_pct',
        displayName: 'Policy Documentation',
        description: 'Percentage of required policies documented',
        unit: 'percentage',
        example: '82%',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'internal_audit_frequency_months',
        displayName: 'Internal Audit Frequency',
        description: 'Months between internal audits',
        unit: 'months',
        example: '12',
        mandatory: false,
        dataType: 'number'
      },
      {
        fieldName: 'governance_training_pct',
        displayName: 'Governance Training',
        description: 'Percentage of governing body trained',
        unit: 'percentage',
        example: '90%',
        mandatory: false,
        dataType: 'percentage'
      }
    ],
    sampleDataFile: 'Compliance_Data.csv'
  },

  C12_REPUTATION_MANAGEMENT: {
    challengeId: 'C12',
    challengeName: 'Reputation & Brand Issues',
    category: 'Reputation & Competition',
    requiredMetrics: [
      {
        fieldName: 'school_reputation_score',
        displayName: 'School Reputation Score',
        description: 'Perception score among parents/community (1-10)',
        unit: 'score',
        example: '6.8',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'online_review_rating_avg',
        displayName: 'Online Review Rating',
        description: 'Average rating on review platforms',
        unit: 'score',
        example: '3.8/5',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'negative_press_incidents_yoy',
        displayName: 'Negative Press Incidents',
        description: 'Number of negative press mentions in past year',
        unit: 'count',
        example: '3',
        mandatory: true,
        dataType: 'count'
      },
      {
        fieldName: 'social_media_sentiment_score',
        displayName: 'Social Media Sentiment',
        description: 'Sentiment analysis score (-100 to +100)',
        unit: 'score',
        example: '35',
        mandatory: true,
        dataType: 'number'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'alumni_engagement_pct',
        displayName: 'Alumni Engagement',
        description: 'Percentage of alumni engaged with school',
        unit: 'percentage',
        example: '42%',
        mandatory: false,
        dataType: 'percentage'
      },
      {
        fieldName: 'pr_coverage_frequency_monthly',
        displayName: 'PR Coverage',
        description: 'Number of positive PR mentions per month',
        unit: 'count',
        example: '2',
        mandatory: false,
        dataType: 'count'
      }
    ],
    sampleDataFile: 'Reputation_Data.csv'
  },

  C13_COMPETITIVE_POSITIONING: {
    challengeId: 'C13',
    challengeName: 'Competitive Positioning',
    category: 'Reputation & Competition',
    requiredMetrics: [
      {
        fieldName: 'market_share_percentage',
        displayName: 'Market Share',
        description: 'Percentage of local school-age market',
        unit: 'percentage',
        example: '12%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'competitor_comparison_score',
        displayName: 'Competitor Comparison',
        description: 'Performance vs competitors (1-10, 10=best)',
        unit: 'score',
        example: '6',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'unique_value_proposition_strength',
        displayName: 'Value Proposition Strength',
        description: 'Uniqueness score (1-10)',
        unit: 'score',
        example: '5.5',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'price_competitiveness_percentile',
        displayName: 'Price Competitiveness',
        description: 'Where fees rank among competitors (percentile)',
        unit: 'percentile',
        example: '45th',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'differentiation_factors_count',
        displayName: 'Differentiation Factors',
        description: 'Number of unique differentiators',
        unit: 'count',
        example: '4',
        mandatory: false,
        dataType: 'count'
      },
      {
        fieldName: 'competitive_threat_level',
        displayName: 'Competitive Threat Level',
        description: 'Perceived threat from competitors (1-10)',
        unit: 'score',
        example: '7',
        mandatory: false,
        dataType: 'number'
      }
    ],
    sampleDataFile: 'Competitive_Data.csv'
  },

  C14_STUDENT_SAFETY: {
    challengeId: 'C14',
    challengeName: 'Student Safety & DPDP Compliance',
    category: 'Academic & Student Wellbeing',
    requiredMetrics: [
      {
        fieldName: 'dpdp_compliance_pct',
        displayName: 'DPDP Compliance',
        description: 'Percentage of DPDP Act 2023 requirements met',
        unit: 'percentage',
        example: '68%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'data_breach_incidents_yoy',
        displayName: 'Data Breach Incidents',
        description: 'Number of data breaches in past year',
        unit: 'count',
        example: '0',
        mandatory: true,
        dataType: 'count'
      },
      {
        fieldName: 'cybersecurity_audit_rating',
        displayName: 'Cybersecurity Rating',
        description: 'Annual cybersecurity assessment rating (1-10)',
        unit: 'score',
        example: '4.2',
        mandatory: true,
        dataType: 'number'
      },
      {
        fieldName: 'physical_safety_incidents_yoy',
        displayName: 'Physical Safety Incidents',
        description: 'Number of reported safety incidents',
        unit: 'count',
        example: '2',
        mandatory: true,
        dataType: 'count'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'staff_safety_training_pct',
        displayName: 'Staff Safety Training',
        description: 'Percentage of staff trained in safety protocols',
        unit: 'percentage',
        example: '92%',
        mandatory: false,
        dataType: 'percentage'
      },
      {
        fieldName: 'student_safety_awareness_pct',
        displayName: 'Student Safety Awareness',
        description: 'Percentage of students trained in safety',
        unit: 'percentage',
        example: '85%',
        mandatory: false,
        dataType: 'percentage'
      }
    ],
    sampleDataFile: 'Safety_Data.csv'
  },

  C15_INNOVATION_ADOPTION: {
    challengeId: 'C15',
    challengeName: 'Innovation & Continuous Improvement',
    category: 'Academic & Student Wellbeing',
    requiredMetrics: [
      {
        fieldName: 'innovation_initiatives_active',
        displayName: 'Active Innovation Initiatives',
        description: 'Number of active innovation/improvement projects',
        unit: 'count',
        example: '5',
        mandatory: true,
        dataType: 'count'
      },
      {
        fieldName: 'research_based_pedagogy_adoption_pct',
        displayName: 'Research-Based Pedagogy',
        description: 'Percentage of teachers using evidence-based methods',
        unit: 'percentage',
        example: '52%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'innovation_investment_percentage',
        displayName: 'Innovation Investment',
        description: 'Percentage of budget allocated to innovation',
        unit: 'percentage',
        example: '8%',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'success_rate_of_initiatives_pct',
        displayName: 'Initiative Success Rate',
        description: 'Percentage of initiatives meeting goals',
        unit: 'percentage',
        example: '65%',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [
      {
        fieldName: 'partnerships_with_universities',
        displayName: 'University Partnerships',
        description: 'Number of active university partnerships',
        unit: 'count',
        example: '3',
        mandatory: false,
        dataType: 'count'
      },
      {
        fieldName: 'innovation_culture_score',
        displayName: 'Innovation Culture',
        description: 'Staff perception of innovation culture (1-10)',
        unit: 'score',
        example: '6.2',
        mandatory: false,
        dataType: 'number'
      }
    ],
    sampleDataFile: 'Innovation_Data.csv'
  }
};

/**
 * Get data requirements for selected challenges
 */
export function getDataRequirementsForChallenges(
  challengeIds: string[]
): ChallengeDataRequirement[] {
  return challengeIds
    .map(id => CHALLENGE_DATA_REQUIREMENTS[id])
    .filter(Boolean);
}

/**
 * Get all required metrics for selected challenges
 */
export function getRequiredMetricsForChallenges(
  challengeIds: string[]
): MetricRequirement[] {
  const requirements = getDataRequirementsForChallenges(challengeIds);
  const metrics: MetricRequirement[] = [];

  requirements.forEach(req => {
    metrics.push(...req.requiredMetrics);
  });

  return metrics;
}

/**
 * Validate uploaded data against selected challenges
 */
export function validateDataForChallenges(
  uploadedMetrics: Record<string, any>,
  challengeIds: string[]
): {
  isValid: boolean;
  missingMetrics: string[];
  foundMetrics: string[];
  completeness: number;
  recommendations: string[];
} {
  const requiredMetrics = getRequiredMetricsForChallenges(challengeIds);
  const missingMetrics: string[] = [];
  const foundMetrics: string[] = [];

  requiredMetrics.forEach(metric => {
    if (uploadedMetrics[metric.fieldName] !== undefined && uploadedMetrics[metric.fieldName] !== null) {
      foundMetrics.push(`✅ ${metric.displayName}`);
    } else {
      missingMetrics.push(`❌ ${metric.displayName} (${metric.fieldName})`);
    }
  });

  const completeness = requiredMetrics.length > 0
    ? Math.round((foundMetrics.length / requiredMetrics.length) * 100)
    : 0;

  const isValid = missingMetrics.length === 0;

  const recommendations: string[] = [];
  if (!isValid) {
    recommendations.push(`Missing ${missingMetrics.length} required metrics`);
    recommendations.push('Upload file must include all required fields for selected challenges');
    recommendations.push('Check sample data files for correct format and field names');
  }

  if (isValid && completeness < 100) {
    recommendations.push('Consider adding optional metrics for more comprehensive analysis');
  }

  return {
    isValid,
    missingMetrics,
    foundMetrics,
    completeness,
    recommendations
  };
}

export default CHALLENGE_DATA_REQUIREMENTS;
