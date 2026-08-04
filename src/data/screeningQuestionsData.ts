// COMPLETE SCREENING QUESTIONNAIRE DATA - ALL 15 CHALLENGES WITH 5-6 OPTIONS PER QUESTION
// Extracted from PDF: challanges questionaire with multiple response.pdf

export const COMPLETE_SCREENING_QUESTIONS = [
  {
    id: "enrollment_decline",
    challengeId: "C1",
    label: "Enrollment Decline",
    category: "growth",
    domain: "Growth & Enrollment",
    metrics: ["New Student Intake Rate (%)", "Student Retention Rate (%)"],
    questions: [
      {
        id: "q1_1",
        questionId: "Q1.1",
        label: "What is the trend of new enrollments in the last 3 years?",
        options: [
          { label: "Strong growth (>20% YoY)", value: "q1_1_1", weight: 1 },
          { label: "Moderate growth (10-20% YoY)", value: "q1_1_2", weight: 2 },
          { label: "Flat/minimal growth (<10% YoY)", value: "q1_1_3", weight: 4 },
          { label: "Slight decline (-5% to -10%)", value: "q1_1_4", weight: 6 },
          { label: "Moderate decline (-10% to -20%)", value: "q1_1_5", weight: 8 },
          { label: "Severe decline (<-20%)", value: "q1_1_6", weight: 10 }
        ]
      },
      {
        id: "q1_2",
        questionId: "Q1.2",
        label: "How competitive is enrollment vs peer schools in your market?",
        options: [
          { label: "More competitive than peers", value: "q1_2_1", weight: 1 },
          { label: "Equally competitive", value: "q1_2_2", weight: 3 },
          { label: "Less competitive than peers", value: "q1_2_3", weight: 5 },
          { label: "Significantly less competitive", value: "q1_2_4", weight: 8 },
          { label: "Major disadvantage vs competitors", value: "q1_2_5", weight: 10 }
        ]
      },
      {
        id: "q1_3",
        questionId: "Q1.3",
        label: "What is your student retention rate from Grade 1 to Grade 12?",
        options: [
          { label: "90%+ retention", value: "q1_3_1", weight: 1 },
          { label: "80-90% retention", value: "q1_3_2", weight: 3 },
          { label: "70-80% retention", value: "q1_3_3", weight: 5 },
          { label: "60-70% retention", value: "q1_3_4", weight: 7 },
          { label: "<60% retention", value: "q1_3_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "student_attrition",
    challengeId: "C2",
    label: "Student Attrition",
    category: "growth",
    domain: "Growth & Enrollment",
    metrics: ["Mid-Year Dropout Rate (%)", "Outflow to Competitors (%)"],
    questions: [
      {
        id: "q2_1",
        questionId: "Q2.1",
        label: "What percentage of students leave mid-year?",
        options: [
          { label: "0-2% mid-year attrition", value: "q2_1_1", weight: 1 },
          { label: "2-5% mid-year attrition", value: "q2_1_2", weight: 3 },
          { label: "5-8% mid-year attrition", value: "q2_1_3", weight: 5 },
          { label: "8-12% mid-year attrition", value: "q2_1_4", weight: 7 },
          { label: ">12% mid-year attrition", value: "q2_1_5", weight: 10 }
        ]
      },
      {
        id: "q2_2",
        questionId: "Q2.2",
        label: "What are the primary reasons for student exit?",
        options: [
          { label: "Academic/personal - isolated cases", value: "q2_2_1", weight: 2 },
          { label: "Mixed reasons, mostly controllable", value: "q2_2_2", weight: 4 },
          { label: "Mostly controllable (affordability, safety)", value: "q2_2_3", weight: 6 },
          { label: "Major controllable issues (staff, quality)", value: "q2_2_4", weight: 8 },
          { label: "Systemic failure in core offering", value: "q2_2_5", weight: 10 }
        ]
      },
      {
        id: "q2_3",
        questionId: "Q2.3",
        label: "How many students shift to competitor schools annually?",
        options: [
          { label: "Very few (<2%)", value: "q2_3_1", weight: 1 },
          { label: "Some (2-5%)", value: "q2_3_2", weight: 3 },
          { label: "Noticeable (5-10%)", value: "q2_3_3", weight: 5 },
          { label: "Significant (10-15%)", value: "q2_3_4", weight: 8 },
          { label: "Severe (>15%)", value: "q2_3_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "fee_collection_challenges",
    challengeId: "C3",
    label: "Fee Collection Challenges",
    category: "growth",
    domain: "Growth & Enrollment",
    metrics: ["Fee Realization Rate (%)", "Days Sales Outstanding (DSO)"],
    questions: [
      {
        id: "q3_1",
        questionId: "Q3.1",
        label: "What percentage of annual fees is realized?",
        options: [
          { label: "95-100% realization", value: "q3_1_1", weight: 1 },
          { label: "90-95% realization", value: "q3_1_2", weight: 2 },
          { label: "85-90% realization", value: "q3_1_3", weight: 4 },
          { label: "75-85% realization", value: "q3_1_4", weight: 7 },
          { label: "<75% realization", value: "q3_1_5", weight: 10 }
        ]
      },
      {
        id: "q3_2",
        questionId: "Q3.2",
        label: "What is the average payment delay from parents?",
        options: [
          { label: "On-time or early payment", value: "q3_2_1", weight: 1 },
          { label: "30 days average delay", value: "q3_2_2", weight: 2 },
          { label: "60 days average delay", value: "q3_2_3", weight: 4 },
          { label: "90+ days average delay", value: "q3_2_4", weight: 7 },
          { label: "Chronic defaults and disputes", value: "q3_2_5", weight: 10 }
        ]
      },
      {
        id: "q3_3",
        questionId: "Q3.3",
        label: "How many parents request scholarships/fee reduction?",
        options: [
          { label: "<5% requesting concession", value: "q3_3_1", weight: 1 },
          { label: "5-10% requesting concession", value: "q3_3_2", weight: 2 },
          { label: "10-20% requesting concession", value: "q3_3_3", weight: 4 },
          { label: "20-30% requesting concession", value: "q3_3_4", weight: 7 },
          { label: ">30% requesting concession", value: "q3_3_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "teacher_attrition",
    challengeId: "C4",
    label: "Teacher Attrition",
    category: "people",
    domain: "People & Staffing",
    metrics: ["Teacher Turnover Rate (%)", "Avg Teacher Tenure (years)"],
    questions: [
      {
        id: "q4_1",
        questionId: "Q4.1",
        label: "What is your annual teacher attrition rate?",
        options: [
          { label: "<5% annual turnover", value: "q4_1_1", weight: 1 },
          { label: "5-10% annual turnover", value: "q4_1_2", weight: 2 },
          { label: "10-15% annual turnover", value: "q4_1_3", weight: 4 },
          { label: "15-25% annual turnover", value: "q4_1_4", weight: 7 },
          { label: ">25% annual turnover", value: "q4_1_5", weight: 10 }
        ]
      },
      {
        id: "q4_2",
        questionId: "Q4.2",
        label: "What is the primary reason teachers leave?",
        options: [
          { label: "Retirement/personal - unavoidable", value: "q4_2_1", weight: 1 },
          { label: "Career growth opportunities elsewhere", value: "q4_2_2", weight: 3 },
          { label: "Better compensation packages", value: "q4_2_3", weight: 5 },
          { label: "Management/culture issues", value: "q4_2_4", weight: 7 },
          { label: "Systemic institutional failure", value: "q4_2_5", weight: 10 }
        ]
      },
      {
        id: "q4_3",
        questionId: "Q4.3",
        label: "What is the average teacher tenure at your school?",
        options: [
          { label: "10+ years average", value: "q4_3_1", weight: 1 },
          { label: "7-10 years average", value: "q4_3_2", weight: 2 },
          { label: "5-7 years average", value: "q4_3_3", weight: 4 },
          { label: "3-5 years average", value: "q4_3_4", weight: 7 },
          { label: "<3 years average", value: "q4_3_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "staff_capability_gaps",
    challengeId: "C5",
    label: "Staff Capability Gaps",
    category: "people",
    domain: "People & Staffing",
    metrics: ["Teacher Competency Score (%)", "Professional Qualification %"],
    questions: [
      {
        id: "q5_1",
        questionId: "Q5.1",
        label: "What % of your teachers have subject specialist qualifications?",
        options: [
          { label: ">90% specialists", value: "q5_1_1", weight: 1 },
          { label: "80-90% specialists", value: "q5_1_2", weight: 2 },
          { label: "70-80% specialists", value: "q5_1_3", weight: 4 },
          { label: "50-70% specialists", value: "q5_1_4", weight: 6 },
          { label: "<50% specialists", value: "q5_1_5", weight: 10 }
        ]
      },
      {
        id: "q5_2",
        questionId: "Q5.2",
        label: "How aligned is teacher competency to curriculum needs?",
        options: [
          { label: "Highly aligned - excellent match", value: "q5_2_1", weight: 1 },
          { label: "Well aligned - good match", value: "q5_2_2", weight: 2 },
          { label: "Mostly aligned - acceptable", value: "q5_2_3", weight: 4 },
          { label: "Gaps in key subjects/areas", value: "q5_2_4", weight: 7 },
          { label: "Major misalignment issues", value: "q5_2_5", weight: 10 }
        ]
      },
      {
        id: "q5_3",
        questionId: "Q5.3",
        label: "How often do teachers receive upskilling training?",
        options: [
          { label: "Regular (monthly+)", value: "q5_3_1", weight: 1 },
          { label: "Quarterly", value: "q5_3_2", weight: 2 },
          { label: "Semi-annual", value: "q5_3_3", weight: 3 },
          { label: "Annual", value: "q5_3_4", weight: 5 },
          { label: "Rarely/never", value: "q5_3_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "leadership_capability_gap",
    challengeId: "C6",
    label: "Leadership Capability Gap",
    category: "people",
    domain: "People & Staffing",
    metrics: ["Leadership Competency Score (%)", "Principal/VP Experience (years)"],
    questions: [
      {
        id: "q6_1",
        questionId: "Q6.1",
        label: "How many years of leadership experience does your top leader have?",
        options: [
          { label: "15+ years", value: "q6_1_1", weight: 1 },
          { label: "10-15 years", value: "q6_1_2", weight: 2 },
          { label: "7-10 years", value: "q6_1_3", weight: 3 },
          { label: "3-7 years", value: "q6_1_4", weight: 5 },
          { label: "<3 years", value: "q6_1_5", weight: 10 }
        ]
      },
      {
        id: "q6_2",
        questionId: "Q6.2",
        label: "How clear is the institutional vision and strategy?",
        options: [
          { label: "Crystal clear, well communicated", value: "q6_2_1", weight: 1 },
          { label: "Clear, mostly aligned", value: "q6_2_2", weight: 2 },
          { label: "Somewhat clear, partial alignment", value: "q6_2_3", weight: 4 },
          { label: "Unclear, limited buy-in", value: "q6_2_4", weight: 7 },
          { label: "No clear vision/direction", value: "q6_2_5", weight: 10 }
        ]
      },
      {
        id: "q6_3",
        questionId: "Q6.3",
        label: "How effective is decision-making and governance?",
        options: [
          { label: "Excellent - quick, well-informed", value: "q6_3_1", weight: 1 },
          { label: "Good - timely, mostly sound", value: "q6_3_2", weight: 2 },
          { label: "Adequate - but some delays", value: "q6_3_3", weight: 4 },
          { label: "Poor - slow, inconsistent", value: "q6_3_4", weight: 7 },
          { label: "Dysfunctional - unclear authority", value: "q6_3_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "academic_quality_decline",
    challengeId: "C7",
    label: "Academic Quality Decline",
    category: "academic",
    domain: "Academic & Wellbeing",
    metrics: ["Board Exam Pass Rate (%)", "Average Subject Score (%)"],
    questions: [
      {
        id: "q7_1",
        questionId: "Q7.1",
        label: "What is your board exam pass rate?",
        options: [
          { label: ">95% pass rate", value: "q7_1_1", weight: 1 },
          { label: "90-95% pass rate", value: "q7_1_2", weight: 2 },
          { label: "85-90% pass rate", value: "q7_1_3", weight: 3 },
          { label: "70-85% pass rate", value: "q7_1_4", weight: 5 },
          { label: "<70% pass rate", value: "q7_1_5", weight: 10 }
        ]
      },
      {
        id: "q7_2",
        questionId: "Q7.2",
        label: "How are your scores trending vs peer institutions?",
        options: [
          { label: "Consistently above peer average", value: "q7_2_1", weight: 1 },
          { label: "At or near peer average", value: "q7_2_2", weight: 2 },
          { label: "Slightly below peer average", value: "q7_2_3", weight: 4 },
          { label: "Significantly below peer average", value: "q7_2_4", weight: 7 },
          { label: "Much lower than peers", value: "q7_2_5", weight: 10 }
        ]
      },
      {
        id: "q7_3",
        questionId: "Q7.3",
        label: "What % of students score above 70% aggregate?",
        options: [
          { label: ">80% high achievers", value: "q7_3_1", weight: 1 },
          { label: "70-80% high achievers", value: "q7_3_2", weight: 2 },
          { label: "50-70% high achievers", value: "q7_3_3", weight: 4 },
          { label: "30-50% high achievers", value: "q7_3_4", weight: 7 },
          { label: "<30% high achievers", value: "q7_3_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "student_wellbeing_issues",
    challengeId: "C8",
    label: "Student Wellbeing Issues",
    category: "academic",
    domain: "Academic & Wellbeing",
    metrics: ["Mental Health Incidents (per 1000)", "Safety Violations (count/year)"],
    questions: [
      {
        id: "q8_1",
        questionId: "Q8.1",
        label: "How many mental health/psychological issues are reported?",
        options: [
          { label: "Very few - excellent support", value: "q8_1_1", weight: 1 },
          { label: "Minimal - good awareness", value: "q8_1_2", weight: 2 },
          { label: "Some - moderate support", value: "q8_1_3", weight: 4 },
          { label: "Multiple - limited support", value: "q8_1_4", weight: 7 },
          { label: "Significant - systemic issues", value: "q8_1_5", weight: 10 }
        ]
      },
      {
        id: "q8_2",
        questionId: "Q8.2",
        label: "How safe do students feel at school?",
        options: [
          { label: "Extremely safe - zero incidents", value: "q8_2_1", weight: 1 },
          { label: "Very safe - rare incidents", value: "q8_2_2", weight: 2 },
          { label: "Safe - occasional issues", value: "q8_2_3", weight: 4 },
          { label: "Somewhat unsafe - regular issues", value: "q8_2_4", weight: 7 },
          { label: "Unsafe - frequent incidents", value: "q8_2_5", weight: 10 }
        ]
      },
      {
        id: "q8_3",
        questionId: "Q8.3",
        label: "How strong is peer bullying/harassment prevention?",
        options: [
          { label: "Excellent - proactive culture", value: "q8_3_1", weight: 1 },
          { label: "Good - reported and addressed", value: "q8_3_2", weight: 2 },
          { label: "Adequate - some gaps", value: "q8_3_3", weight: 4 },
          { label: "Poor - incidents go unaddressed", value: "q8_3_4", weight: 7 },
          { label: "Severe - systemic bullying", value: "q8_3_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "remedial_lag",
    challengeId: "C9",
    label: "Remedial Lag",
    category: "academic",
    domain: "Academic & Wellbeing",
    metrics: ["Remedial Support Coverage (%)", "Improvement Rate (%)"],
    questions: [
      {
        id: "q9_1",
        questionId: "Q9.1",
        label: "What % of students requiring remedial support receive it?",
        options: [
          { label: "90%+ support provided", value: "q9_1_1", weight: 1 },
          { label: "75-90% support provided", value: "q9_1_2", weight: 2 },
          { label: "50-75% support provided", value: "q9_1_3", weight: 4 },
          { label: "25-50% support provided", value: "q9_1_4", weight: 7 },
          { label: "<25% support provided", value: "q9_1_5", weight: 10 }
        ]
      },
      {
        id: "q9_2",
        questionId: "Q9.2",
        label: "How effective is remedial intervention (improvement rate)?",
        options: [
          { label: "Very effective - 70%+ improve", value: "q9_2_1", weight: 1 },
          { label: "Effective - 50-70% improve", value: "q9_2_2", weight: 2 },
          { label: "Moderate - 30-50% improve", value: "q9_2_3", weight: 4 },
          { label: "Limited - 10-30% improve", value: "q9_2_4", weight: 7 },
          { label: "Ineffective - <10% improve", value: "q9_2_5", weight: 10 }
        ]
      },
      {
        id: "q9_3",
        questionId: "Q9.3",
        label: "How many grade levels receive remedial support?",
        options: [
          { label: "All grades, all subjects", value: "q9_3_1", weight: 1 },
          { label: "Most grades, key subjects", value: "q9_3_2", weight: 2 },
          { label: "Some grades, core subjects", value: "q9_3_3", weight: 4 },
          { label: "Limited grades only", value: "q9_3_4", weight: 7 },
          { label: "No systematic remedial", value: "q9_3_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "parent_communication_issues",
    challengeId: "C10",
    label: "Parent Communication Issues",
    category: "reputation",
    domain: "Reputation & Competition",
    metrics: ["Parent Satisfaction Score (%)", "Parent Response Rate (%)"],
    questions: [
      {
        id: "q10_1",
        questionId: "Q10.1",
        label: "How satisfied are parents with communication?",
        options: [
          { label: "Very satisfied - 90%+ positive", value: "q10_1_1", weight: 1 },
          { label: "Satisfied - 75-90% positive", value: "q10_1_2", weight: 2 },
          { label: "Neutral - 50-75% positive", value: "q10_1_3", weight: 4 },
          { label: "Dissatisfied - 25-50% positive", value: "q10_1_4", weight: 7 },
          { label: "Very dissatisfied - <25% positive", value: "q10_1_5", weight: 10 }
        ]
      },
      {
        id: "q10_2",
        questionId: "Q10.2",
        label: "What is your average response time to parent queries?",
        options: [
          { label: "Within 4 hours", value: "q10_2_1", weight: 1 },
          { label: "Within 12 hours", value: "q10_2_2", weight: 2 },
          { label: "Within 24 hours", value: "q10_2_3", weight: 4 },
          { label: "2-3 days", value: "q10_2_4", weight: 7 },
          { label: ">3 days / no response", value: "q10_2_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "competitive_pressure",
    challengeId: "C11",
    label: "Competitive Pressure",
    category: "reputation",
    domain: "Reputation & Competition",
    metrics: ["Market Share Loss (%)", "Competitor Win Rate (%)"],
    questions: [
      {
        id: "q11_1",
        questionId: "Q11.1",
        label: "How intense is competition in your market?",
        options: [
          { label: "Limited - clear market leader", value: "q11_1_1", weight: 1 },
          { label: "Moderate - few strong competitors", value: "q11_1_2", weight: 2 },
          { label: "High - several strong competitors", value: "q11_1_3", weight: 4 },
          { label: "Very high - many aggressive competitors", value: "q11_1_4", weight: 7 },
          { label: "Extreme - commoditized market", value: "q11_1_5", weight: 10 }
        ]
      },
      {
        id: "q11_2",
        questionId: "Q11.2",
        label: "Are you losing enrollment to specific competitors?",
        options: [
          { label: "Not losing market share", value: "q11_2_1", weight: 1 },
          { label: "Minimal losses (<2% annually)", value: "q11_2_2", weight: 2 },
          { label: "Noticeable losses (2-5% annually)", value: "q11_2_3", weight: 4 },
          { label: "Significant losses (5-10% annually)", value: "q11_2_4", weight: 7 },
          { label: "Severe losses (>10% annually)", value: "q11_2_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "brand_reputation_issues",
    challengeId: "C12",
    label: "Brand/Reputation Issues",
    category: "reputation",
    domain: "Reputation & Competition",
    metrics: ["Brand Perception Score (%)", "Media Sentiment (%)"],
    questions: [
      {
        id: "q12_1",
        questionId: "Q12.1",
        label: "How is your school perceived by target parents?",
        options: [
          { label: "Excellent reputation - top of mind", value: "q12_1_1", weight: 1 },
          { label: "Good reputation - well regarded", value: "q12_1_2", weight: 2 },
          { label: "Neutral reputation - known entity", value: "q12_1_3", weight: 4 },
          { label: "Poor reputation - perception concerns", value: "q12_1_4", weight: 7 },
          { label: "Very poor reputation - negative image", value: "q12_1_5", weight: 10 }
        ]
      },
      {
        id: "q12_2",
        questionId: "Q12.2",
        label: "How often does negative news/media coverage appear?",
        options: [
          { label: "Never - only positive coverage", value: "q12_2_1", weight: 1 },
          { label: "Rare - occasional positive stories", value: "q12_2_2", weight: 2 },
          { label: "Occasional - mixed coverage", value: "q12_2_3", weight: 4 },
          { label: "Regular - notable negative stories", value: "q12_2_4", weight: 7 },
          { label: "Frequent - serious reputation damage", value: "q12_2_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "cost_inflation",
    challengeId: "C13",
    label: "Cost Inflation",
    category: "operations",
    domain: "Operations & Finance",
    metrics: ["Cost Increase YoY (%)", "Operating Margin (%)"],
    questions: [
      {
        id: "q13_1",
        questionId: "Q13.1",
        label: "What is your cost inflation rate vs fee increase?",
        options: [
          { label: "Inflation lower than fee increase", value: "q13_1_1", weight: 1 },
          { label: "Aligned with fee increase", value: "q13_1_2", weight: 2 },
          { label: "Slightly higher than fee increase", value: "q13_1_3", weight: 4 },
          { label: "Significantly higher than fee increase", value: "q13_1_4", weight: 7 },
          { label: "Costs growing much faster than fees", value: "q13_1_5", weight: 10 }
        ]
      },
      {
        id: "q13_2",
        questionId: "Q13.2",
        label: "How healthy is your operating margin?",
        options: [
          { label: "Excellent - 20%+ margin", value: "q13_2_1", weight: 1 },
          { label: "Good - 15-20% margin", value: "q13_2_2", weight: 2 },
          { label: "Adequate - 10-15% margin", value: "q13_2_3", weight: 4 },
          { label: "Thin - 5-10% margin", value: "q13_2_4", weight: 7 },
          { label: "Negative - losses or break-even", value: "q13_2_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "infrastructure_deficits",
    challengeId: "C14",
    label: "Infrastructure Deficits",
    category: "operations",
    domain: "Operations & Finance",
    metrics: ["Infrastructure Quality Score (%)", "Maintenance Backlog (₹)"],
    questions: [
      {
        id: "q14_1",
        questionId: "Q14.1",
        label: "How would you rate your overall infrastructure quality?",
        options: [
          { label: "Excellent - modern, well-maintained", value: "q14_1_1", weight: 1 },
          { label: "Good - mostly adequate, minor updates needed", value: "q14_1_2", weight: 2 },
          { label: "Fair - functional but aging", value: "q14_1_3", weight: 4 },
          { label: "Poor - significant deficits", value: "q14_1_4", weight: 7 },
          { label: "Very poor - major infrastructure issues", value: "q14_1_5", weight: 10 }
        ]
      },
      {
        id: "q14_2",
        questionId: "Q14.2",
        label: "What is your infrastructure maintenance backlog?",
        options: [
          { label: "Current - all maintained", value: "q14_2_1", weight: 1 },
          { label: "Minimal - minor backlog", value: "q14_2_2", weight: 2 },
          { label: "Moderate - significant backlog", value: "q14_2_3", weight: 4 },
          { label: "Large - major deferred maintenance", value: "q14_2_4", weight: 7 },
          { label: "Severe - critical backlog", value: "q14_2_5", weight: 10 }
        ]
      }
    ]
  },
  {
    id: "compliance_regulatory_stress",
    challengeId: "C15",
    label: "Compliance & Regulatory Stress",
    category: "operations",
    domain: "Operations & Finance",
    metrics: ["Compliance Score (%)", "Regulatory Violations (count/year)"],
    questions: [
      {
        id: "q15_1",
        questionId: "Q15.1",
        label: "How well are you complying with education regulations?",
        options: [
          { label: "Full compliance - zero violations", value: "q15_1_1", weight: 1 },
          { label: "Nearly compliant - minor issues", value: "q15_1_2", weight: 2 },
          { label: "Mostly compliant - some gaps", value: "q15_1_3", weight: 4 },
          { label: "Non-compliant - multiple violations", value: "q15_1_4", weight: 7 },
          { label: "Severe violations - regulatory risk", value: "q15_1_5", weight: 10 }
        ]
      },
      {
        id: "q15_2",
        questionId: "Q15.2",
        label: "Are there pending compliance audits or notices?",
        options: [
          { label: "No pending issues", value: "q15_2_1", weight: 1 },
          { label: "Routine audit cycle", value: "q15_2_2", weight: 2 },
          { label: "Minor notices to address", value: "q15_2_3", weight: 4 },
          { label: "Significant compliance notices", value: "q15_2_4", weight: 7 },
          { label: "Serious regulatory action pending", value: "q15_2_5", weight: 10 }
        ]
      }
    ]
  }
];
