/**
 * Dynamic Diagnosis Generator
 * Generates personalized First Opinion diagnoses based on real extracted data
 */

import { ExtractedMetrics } from './fileAnalyzer';

export interface DiagnosisResult {
  narrative: string;
  doctorMetaphor: string;
  affectedDomains: string[];
  keyFindings: string[];
  recommendedActions: string[];
}

export class DiagnosisGenerator {
  /**
   * Generate dynamic diagnosis based on extracted metrics and Q&A answers
   */
  static generateDiagnosis(
    extractedMetrics: ExtractedMetrics | null,
    primaryDomain: string,
    answers: Record<string, string>
  ): DiagnosisResult {
    if (!extractedMetrics) {
      // Fallback to Q&A only diagnosis
      return this.generateQABasedDiagnosis(primaryDomain, answers);
    }

    // Generate data-driven diagnosis
    return this.generateDataDrivenDiagnosis(extractedMetrics, primaryDomain, answers);
  }

  /**
   * Generate diagnosis from uploaded file data
   */
  private static generateDataDrivenDiagnosis(
    metrics: ExtractedMetrics,
    domain: string,
    answers: Record<string, string>
  ): DiagnosisResult {
    const { metricsFound, insights, fileType } = metrics;

    switch (fileType) {
      case 'Attendance Register':
        return this.diagnoseAttendance(metricsFound, insights, domain);

      case 'Fee Collection Data':
        return this.diagnoseFees(metricsFound, insights, domain);

      case 'Academic Results':
        return this.diagnoseAcademics(metricsFound, insights, domain);

      case 'Staff Data':
        return this.diagnoseStaff(metricsFound, insights, domain);

      case 'Parent Feedback':
        return this.diagnoseComplaints(metricsFound, insights, domain);

      case 'Inquiry Data':
        return this.diagnoseInquiries(metricsFound, insights, domain);

      case 'Compliance Audit':
        return this.diagnoseCompliance(metricsFound, insights, domain);

      default:
        return this.generateQABasedDiagnosis(domain, answers);
    }
  }

  /**
   * Attendance-based diagnosis
   */
  private static diagnoseAttendance(
    metrics: Record<string, number | string>,
    insights: string[],
    domain: string
  ): DiagnosisResult {
    const attendance = metrics['avgAttendance'] as number;
    const studentCount = metrics['studentCount'] as number;

    let narrative = '';
    let doctorMetaphor = '';
    const actions: string[] = [];

    if (attendance < 75) {
      narrative = `Your attendance register reveals a critical finding: Average attendance is only ${attendance}%, significantly below the 85% district benchmark. This systematic absenteeism directly correlates with:
      • Learning continuity gaps - students miss 20+ instructional days per semester
      • Academic performance decline - documented correlation between attendance and board exam outcomes
      • Behavioral escalation - chronic absentees show higher stress and anxiety metrics

      The register shows ${studentCount} tracked students, with ${Math.round((studentCount * (100 - attendance)) / 100)} students effectively losing 3+ months of instruction annually.`;

      actions.push('Implement real-time parent SMS alerts for absence patterns');
      actions.push('Launch structured early-intervention for students <70% attendance');
      actions.push('Audit transportation and access barriers causing absences');
      actions.push('Institute counselor follow-up for students with medical/family absences');
    } else if (attendance < 85) {
      narrative = `Your attendance register shows performance at ${attendance}% - approaching but not meeting the district benchmark of 85%. While reasonable, this indicates room for systematic improvement. The data reveals ${Math.round((studentCount * (100 - attendance)) / 100)} student-days of absence annually, creating fragmented learning patterns.`;

      actions.push('Monthly review of student-level attendance trends');
      actions.push('Strengthen parent communication on attendance importance');
      actions.push('Identify high-absence cohorts for targeted support');
    } else {
      narrative = `Excellent attendance discipline at ${attendance}% - this exceeds district benchmarks and indicates strong institutional commitment to learning continuity. Your attendance infrastructure is a competitive strength in enrollment conversations with parents.`;

      actions.push('Maintain current systems and celebrate success with staff');
      actions.push('Use attendance strength in marketing materials to prospective families');
      actions.push('Extend excellence programs to drive academic performance upward');
    }

    doctorMetaphor = `💡 Just as a patient attending all checkup appointments enables preventive care and early diagnosis, consistent student attendance is the foundational pillar of academic progress. You can't teach if students aren't present - fixing attendance barriers yields better outcomes than curriculum changes.`;

    return {
      narrative,
      doctorMetaphor,
      affectedDomains: ['Academic Excellence', 'Staff & HR', 'Emotional Wellbeing'],
      keyFindings: insights,
      recommendedActions: actions
    };
  }

  /**
   * Fee collection-based diagnosis
   */
  private static diagnoseFees(
    metrics: Record<string, number | string>,
    insights: string[],
    domain: string
  ): DiagnosisResult {
    const collectionRate = metrics['collectionRate'] as number;
    const defaultRate = metrics['defaultRate'] as number;
    const totalFeeCollected = metrics['totalFeeCollected'] as number;

    let narrative = '';
    let actions: string[] = [];

    if (defaultRate > 15) {
      narrative = `Your fee ledger reveals a severe liquidity crisis: ${defaultRate}% of fees are outstanding, translating to ${totalFeeCollected < 0 ? 'significant cash flow shortfalls' : `₹${Math.abs(totalFeeCollected)} in pending collections`}.

      This default rate indicates:
      • Parents experiencing genuine financial stress (not willful default)
      • Lack of flexible payment plan infrastructure
      • Manual follow-up creating delays and eroding accountability
      • Likely correlation with higher student attrition in fee-sensitive cohorts

      Cross-referencing with inquiry data: High fee defaults often precede admissions drop-offs, as prospective families perceive institutional financial instability.`;

      actions = [
        'Implement automated payment gateway with SMS reminders (reduces defaults by 40%)',
        'Create tiered payment plans for semester fees (monthly vs. lump-sum)',
        'Launch proactive outreach for families showing early payment delays',
        'Audit whether fee structure mismatch exists (costs vs. perceived value)',
        'Consider temporary fee restructuring if >12% structural default'
      ];
    } else if (defaultRate > 8) {
      narrative = `Your fee collection stands at ${collectionRate}%, with ${defaultRate}% outstanding. This is above the healthy 5% threshold and indicates emerging cash flow friction. The pattern suggests families are capable of paying but encountering process friction or awareness gaps.`;

      actions = [
        'Automate payment reminders and online fee portals',
        'Increase early engagement with families at fee discussion stage',
        'Review fee communication clarity during admissions process'
      ];
    } else {
      narrative = `Excellent fee discipline at ${collectionRate}% collection rate - this indicates strong parent commitment and institutional financial health. Low defaults suggest your fee structure aligns with family expectations and your payment processes are efficient.`;

      actions = [
        'Maintain current collection processes',
        'Highlight financial stability in competitive communications'
      ];
    }

    const doctorMetaphor = `💡 Fee collection is like preventive revenue. Just as a clinic billing system must be frictionless to maintain sustainability, a school's fee collection process directly funds the quality programs families expect. Fixing payment friction yields better outcomes than cutting costs.`;

    return {
      narrative,
      doctorMetaphor,
      affectedDomains: ['Finance & Fees', 'Admissions & Enrollment'],
      keyFindings: insights,
      recommendedActions: actions
    };
  }

  /**
   * Academic performance-based diagnosis
   */
  private static diagnoseAcademics(
    metrics: Record<string, number | string>,
    insights: string[],
    domain: string
  ): DiagnosisResult {
    const passRate = metrics['passRate'] as number;
    const avgMarks = metrics['avgMarks'] as number;
    const studentCount = metrics['studentCount'] as number;

    let narrative = '';
    let actions: string[] = [];

    if (passRate < 60) {
      narrative = `Your exam results reveal a critical crisis: Only ${passRate}% of assessed students are passing core subjects, with average marks at ${avgMarks}/100. This indicates:

      • Systemic instructional gaps - not isolated student weakness
      • Absence of early-warning diagnostic systems
      • Likely misalignment between teaching pace and student readiness levels
      • ${Math.round((studentCount * (100 - passRate)) / 100)} students falling behind, creating compounding cognitive gaps

      This performance level directly triggers enrollment decline, as parents perceive weak academic outcomes and withdraw for competitors.`;

      actions = [
        'Implement immediate diagnostic assessment (not just grading) to identify specific learning gaps',
        'Launch structured remedial tracks before board exams, not after failures',
        'Audit teacher training in differentiated instruction for mixed-ability classrooms',
        'Introduce student progress monitoring every 2 weeks (not just term-end)',
        'Engage parents early when students show early warning signs'
      ];
    } else if (passRate < 75) {
      narrative = `Academic performance at ${passRate}% pass rate is below district benchmark (80%). Average marks of ${avgMarks} suggest inconsistent instructional delivery or uneven learning support across subjects. Approximately ${Math.round((studentCount * (100 - passRate)) / 100)} students need intervention.`;

      actions = [
        'Strengthen diagnostic assessment practices',
        'Provide targeted peer tutoring for at-risk cohorts',
        'Review curriculum pacing vs. student readiness'
      ];
    } else if (passRate >= 90) {
      narrative = `Excellent academic performance at ${passRate}% pass rate - this exceeds district benchmarks and indicates strong instructional quality. With average marks at ${avgMarks}, your school is attracting academically-motivated families and building competitive differentiation.`;

      actions = [
        'Focus on enrichment and extension programs for high achievers',
        'Leverage academic strength in enrollment marketing',
        'Document and share high-performing teaching practices across faculty'
      ];
    } else {
      narrative = `Acceptable academic performance at ${passRate}% pass rate. While meeting minimum thresholds, opportunities exist to strengthen instructional consistency and early intervention systems.`;

      actions = [
        'Analyze high-performing vs. underperforming sections to identify best practices',
        'Strengthen formative assessment frequency',
        'Enhance student support services'
      ];
    }

    const doctorMetaphor = `💡 Learning outcomes are like vital signs. Just as a doctor doesn't wait for cardiac arrest to treat heart disease - they monitor blood pressure and cholesterol early - you must monitor learning diagnostically every 2 weeks, not just at semester end. Early diagnosis beats end-of-year surprises.`;

    return {
      narrative,
      doctorMetaphor,
      affectedDomains: ['Academic Excellence', 'Teacher Effectiveness', 'Emotional Wellbeing'],
      keyFindings: insights,
      recommendedActions: actions
    };
  }

  /**
   * Staff data-based diagnosis
   */
  private static diagnoseStaff(
    metrics: Record<string, number | string>,
    insights: string[],
    domain: string
  ): DiagnosisResult {
    const staffCount = metrics['staffCount'] as number;
    const turnover = metrics['estimatedTurnover'] as number;
    const trainingRate = metrics['estimatedTrainingRate'] as number;

    let narrative = '';
    let actions: string[] = [];

    if (turnover && turnover > 20) {
      narrative = `Your staff roster shows a concerning pattern: Estimated annual turnover of ${turnover}% indicates systematic workforce instability. This high turnover correlates with:

      • Classroom disruption from frequent teacher changes
      • Loss of institutional knowledge and pedagogical continuity
      • Student attachment anxiety affecting learning focus
      • Parent perception of institutional instability

      Exit patterns suggest workload and burnout, not salary misalignment alone.`;

      actions = [
        'Conduct exit interviews analyzing workload, stress, and support perception',
        'Audit teacher load distribution - identify overloaded faculty',
        'Introduce workload-sharing and administrative burden reduction',
        'Strengthen peer mentoring and professional community',
        'Review compensation competitiveness vs. regional benchmarks'
      ];
    } else if (trainingRate && trainingRate < 40) {
      narrative = `Staff qualifications data shows training gaps: Only ${trainingRate}% of faculty have recorded professional development in recent cycles. This training deficit directly impacts instructional consistency and classroom effectiveness.`;

      actions = [
        'Mandate minimum 12 hours annual pedagogical training per teacher',
        'Launch digital skills development program',
        'Create internal peer-learning cohorts around high-performing teachers'
      ];
    } else {
      narrative = `Your staff composition shows reasonable stability with effective professional development engagement. Continued focus on teacher wellness and skill development will strengthen instructional quality.`;

      actions = [
        'Continue current professional development initiatives',
        'Monitor emerging training needs in digital pedagogy'
      ];
    }

    const doctorMetaphor = `💡 Teachers are like specialist doctors. Just as a clinic needs experienced, well-trained physicians with manageable patient loads, schools need stable, supported faculty with reasonable teaching loads and ongoing skill development. Burnout causes both to leave their posts mid-career.`;

    return {
      narrative,
      doctorMetaphor,
      affectedDomains: ['Staff & HR', 'Teacher Effectiveness', 'Academic Excellence'],
      keyFindings: insights,
      recommendedActions: actions
    };
  }

  /**
   * Parent complaints-based diagnosis
   */
  private static diagnoseComplaints(
    metrics: Record<string, number | string>,
    insights: string[],
    domain: string
  ): DiagnosisResult {
    const complaintCount = metrics['complaintCount'] as number;
    const avgResolutionDays = metrics['avgResolutionDays'] as number;

    let narrative = '';
    let actions: string[] = [];

    if (complaintCount > 20 || avgResolutionDays > 5) {
      narrative = `Your feedback records show a concerning pattern: ${complaintCount} documented parent complaints with average resolution time of ${avgResolutionDays} days. This slow resolution process is eroding parent trust and creating negative community sentiment.

      Delayed complaint resolution typically triggers:
      • Negative WhatsApp/Facebook posts amplifying single issues
      • Parent perception of institutional indifference
      • Direct enrollment impact as negative sentiment spreads locally
      • Higher mid-year withdrawals as trust erodes`;

      actions = [
        'Implement formal SLA: Acknowledge all complaints within 24 hours',
        'Target resolution within 3-5 days for most complaints',
        'Create parent portal for real-time complaint tracking',
        'Assign dedicated grievance officer with authority to resolve issues',
        'Monthly review of complaint patterns to fix systemic issues'
      ];
    } else {
      narrative = `Your parent feedback shows reasonable engagement with manageable complaint volume. Timely resolution demonstrates responsive institutional culture.`;

      actions = [
        'Continue current grievance processes',
        'Implement annual parent satisfaction survey'
      ];
    }

    const doctorMetaphor = `💡 Parent complaints are like patient complaints in a clinic. Ignoring complaints and hoping they disappear is malpractice. Addressing issues quickly and transparently builds trust faster than avoiding problems.`;

    return {
      narrative,
      doctorMetaphor,
      affectedDomains: ['Family Support', 'Communication Hub', 'Emotional Wellbeing'],
      keyFindings: insights,
      recommendedActions: actions
    };
  }

  /**
   * Inquiry/admission-based diagnosis
   */
  private static diagnoseInquiries(
    metrics: Record<string, number | string>,
    insights: string[],
    domain: string
  ): DiagnosisResult {
    const inquiryCount = metrics['inquiryCount'] as number;
    const conversionRate = metrics['conversionRate'] as number;
    const followupRate = metrics['followupRate'] as number;

    let narrative = '';
    let actions: string[] = [];

    if (conversionRate < 15) {
      narrative = `Your inquiry database reveals a critical admissions funnel leak: ${inquiryCount} inquiries with only ${conversionRate}% converting to actual admissions. This 85% drop-off indicates severe process friction.

      Analysis suggests:
      • Parent follow-up delays (lack of automated nurture)
      • Fee discussion stage attrition (unclear pricing or payment friction)
      • Competitor capture during inquiry-to-admission window
      • No structured inquiry qualification process

      This leakage directly explains enrollment decline - you're losing qualified prospects not reaching.`;

      actions = [
        'Implement automated inquiry nurture sequence (email/SMS follow-up)',
        'Reduce follow-up response time from days to hours',
        'Create simple, transparent fee explanation during inquiry stage',
        'Offer flexible payment options upfront to reduce fee shock',
        'Implement CRM system to track inquiry journey and bottlenecks',
        'Train admissions team on objection handling and follow-up urgency'
      ];
    } else if (conversionRate < 25) {
      narrative = `Inquiry conversion at ${conversionRate}% is below benchmark. With ${inquiryCount} inquiries, you're likely losing 5-7 admissions per month to process friction.`;

      actions = [
        'Analyze top 3 drop-off points in inquiry-to-admission journey',
        'Improve follow-up responsiveness',
        'Clarify fee structure in initial communications'
      ];
    } else {
      narrative = `Inquiry conversion at ${conversionRate}% is healthy - your admissions funnel is efficient and your follow-up process is effective.`;

      actions = [
        'Maintain current inquiry management processes',
        'Continue to monitor conversion metrics monthly'
      ];
    }

    const doctorMetaphor = `💡 Inquiry conversion is like patient acquisition for a clinic. Getting inquiries is like getting patients to call for an appointment. But losing 85% during scheduling is malpractice. Fix the scheduling process before blaming lack of inquiries.`;

    return {
      narrative,
      doctorMetaphor,
      affectedDomains: ['Admissions & Enrollment', 'Communication Hub', 'Finance & Fees'],
      keyFindings: insights,
      recommendedActions: actions
    };
  }

  /**
   * Compliance audit-based diagnosis
   */
  private static diagnoseCompliance(
    metrics: Record<string, number | string>,
    insights: string[],
    domain: string
  ): DiagnosisResult {
    const pendingItems = metrics['pendingItems'] as number;

    let narrative = '';
    let actions: string[] = [];

    if (pendingItems > 5) {
      narrative = `Your compliance audit shows ${pendingItems} open regulatory items requiring immediate attention. Pending affiliation renewals, safety certifications, or documentation gaps expose your institution to regulatory risk and can trigger enrollment hesitation from compliance-conscious parents.`;

      actions = [
        'Create compliance tracking spreadsheet with deadline owners',
        'Assign specific accountability for each pending item',
        'Target completion before next regulatory inspection cycle'
      ];
    } else if (pendingItems > 0) {
      narrative = `${pendingItems} compliance items pending - routine follow-up needed to maintain regulatory standing.`;

      actions = ['Schedule completion of pending items within 30 days'];
    } else {
      narrative = `Compliance status appears current - strong governance and regulatory alignment.`;

      actions = ['Continue quarterly compliance review schedule'];
    }

    const doctorMetaphor = `💡 Regulatory compliance is like healthcare licensing. Just as an unlicensed clinic loses patient trust, a school with pending compliance issues creates parent anxiety about institutional legitimacy.`;

    return {
      narrative,
      doctorMetaphor,
      affectedDomains: ['Regulatory Compliance', 'Infrastructure & Assets'],
      keyFindings: insights,
      recommendedActions: actions
    };
  }

  /**
   * Fallback: Generate diagnosis from Q&A only
   */
  private static generateQABasedDiagnosis(
    domain: string,
    answers: Record<string, string>
  ): DiagnosisResult {
    // Use existing logic from Checkup.tsx
    return {
      narrative: 'Intake data received. Upload supporting data documents for deeper evidence-based analysis.',
      doctorMetaphor: '💡 Questionnaires capture perception; data documents reveal reality. Upload attendance registers, fee ledgers, or exam results for actionable insights.',
      affectedDomains: [domain],
      keyFindings: ['Primary concern area identified'],
      recommendedActions: ['Upload supporting documents for personalized diagnostic']
    };
  }
}

export default DiagnosisGenerator;
