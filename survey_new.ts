export const SURVEY_QUESTIONS = {
  leader: {
    title: "School Leaders Strategic Survey",
    desc: "Verification of compliance cycles, pedagogy audits, and CBSE structural alignments.",
    questions: [
      {
        id: "ew_8_leader",
        id_actual: "ew_8",
        label: "Q1: Leadership / Management",
        text: "How would you rate the school's performance in Leadership / Management?",
        options: [
          { val: 2, label: "Reactive, disorganized, poor vision" },
          { val: 4, label: "Stable, standard operational management" },
          { val: 5, label: "Visionary, proactive, and highly effective leadership" }
        ]
      },
      {
        id: "ew_1_leader",
        id_actual: "ew_1",
        label: "Q2: Competence of Faculty",
        text: "How would you rate the school's performance in Competence of Faculty?",
        options: [
          { val: 2, label: "Poorly qualified/No ongoing training" },
          { val: 4, label: "Adequately qualified with basic training" },
          { val: 5, label: "Highly qualified with continuous professional development" }
        ]
      },
      {
        id: "ew_2_leader",
        id_actual: "ew_2",
        label: "Q3: Teacher Welfare & Dev",
        text: "How would you rate the school's performance in Teacher Welfare & Dev?",
        options: [
          { val: 2, label: "High stress, low pay, poor benefits" },
          { val: 4, label: "Average pay, standard benefits, acceptable workload" },
          { val: 5, label: "Competitive pay, excellent benefits, well-managed workload" }
        ]
      },
      {
        id: "ew_11_leader",
        id_actual: "ew_11",
        label: "Q4: Internationalism",
        text: "How would you rate the school's performance in Internationalism?",
        options: [
          { val: 2, label: "No global exposure or partnerships" },
          { val: 4, label: "Occasional international events or basic partnerships" },
          { val: 5, label: "Strong international exchange programs and global curriculum integration" }
        ]
      },
      {
        id: "ew_13_leader",
        id_actual: "ew_13",
        label: "Q5: Value for Money",
        text: "How would you rate the school's performance in Value for Money?",
        options: [
          { val: 2, label: "High fees with mismatched facilities/outcomes" },
          { val: 4, label: "Fair fees for the services provided" },
          { val: 5, label: "Exceptional educational outcomes and facilities relative to the fee" }
        ]
      },
      {
        id: "ew_10_leader",
        id_actual: "ew_10",
        label: "Q6: Infrastructure Provision",
        text: "How would you rate the school's performance in Infrastructure Provision?",
        options: [
          { val: 2, label: "Aging facilities, basic amenities" },
          { val: 4, label: "Well-maintained standard classrooms and labs" },
          { val: 5, label: "World-class, modern, and highly equipped campus" }
        ]
      }
    ]
  },
  teacher: {
    title: "Teacher Assessment & Workplace Audit",
    desc: "Feedback on professional development, student attention, and inclusion.",
    questions: [
      {
        id: "ew_1_teacher",
        id_actual: "ew_1",
        label: "Q1: Competence of Faculty",
        text: "How would you rate the school's performance in Competence of Faculty?",
        options: [
          { val: 2, label: "Poorly qualified/No ongoing training" },
          { val: 4, label: "Adequately qualified with basic training" },
          { val: 5, label: "Highly qualified with continuous professional development" }
        ]
      },
      {
        id: "ew_2_teacher",
        id_actual: "ew_2",
        label: "Q2: Teacher Welfare & Dev",
        text: "How would you rate the school's performance in Teacher Welfare & Dev?",
        options: [
          { val: 2, label: "High stress, low pay, poor benefits" },
          { val: 4, label: "Average pay, standard benefits, acceptable workload" },
          { val: 5, label: "Competitive pay, excellent benefits, well-managed workload" }
        ]
      },
      {
        id: "ew_6_teacher",
        id_actual: "ew_6",
        label: "Q3: Life Skills Education",
        text: "How would you rate the school's performance in Life Skills Education?",
        options: [
          { val: 2, label: "Not included in the curriculum" },
          { val: 4, label: "Some basic life skills taught occasionally" },
          { val: 5, label: "Integrated comprehensively into daily learning and activities" }
        ]
      },
      {
        id: "ew_7_teacher",
        id_actual: "ew_7",
        label: "Q4: Individual Attention",
        text: "How would you rate the school's performance in Individual Attention?",
        options: [
          { val: 2, label: "High student-teacher ratio, generic teaching" },
          { val: 4, label: "Average class sizes, some differentiation" },
          { val: 5, label: "Low student-teacher ratio, highly personalized learning plans" }
        ]
      },
      {
        id: "ew_12_teacher",
        id_actual: "ew_12",
        label: "Q5: Special Needs Education",
        text: "How would you rate the school's performance in Special Needs Education?",
        options: [
          { val: 2, label: "No support for SEN students" },
          { val: 4, label: "Basic SEN support and some trained staff" },
          { val: 5, label: "Comprehensive inclusion policies, dedicated SEN department and resources" }
        ]
      },
      {
        id: "ew_3_teacher",
        id_actual: "ew_3",
        label: "Q6: Academic Reputation",
        text: "How would you rate the school's performance in Academic Reputation?",
        options: [
          { val: 2, label: "Below average results, poor local perception" },
          { val: 4, label: "Average results, acceptable perception" },
          { val: 5, label: "Consistently excellent results, highly prestigious" }
        ]
      }
    ]
  },
  parent: {
    title: "Parental Sentiment & Satisfaction Tracker",
    desc: "Evaluating academic reputation, involvement, and holistic education.",
    questions: [
      {
        id: "ew_3_parent",
        id_actual: "ew_3",
        label: "Q1: Academic Reputation",
        text: "How would you rate the school's performance in Academic Reputation?",
        options: [
          { val: 2, label: "Below average results, poor local perception" },
          { val: 4, label: "Average results, acceptable perception" },
          { val: 5, label: "Consistently excellent results, highly prestigious" }
        ]
      },
      {
        id: "ew_9_parent",
        id_actual: "ew_9",
        label: "Q2: Parents Involvement",
        text: "How would you rate the school's performance in Parents Involvement?",
        options: [
          { val: 2, label: "Minimal communication, parents feel disconnected" },
          { val: 4, label: "Regular PTMs, standard communication" },
          { val: 5, label: "Deep partnership, transparent communication, active parent body" }
        ]
      },
      {
        id: "ew_13_parent",
        id_actual: "ew_13",
        label: "Q3: Value for Money",
        text: "How would you rate the school's performance in Value for Money?",
        options: [
          { val: 2, label: "High fees with mismatched facilities/outcomes" },
          { val: 4, label: "Fair fees for the services provided" },
          { val: 5, label: "Exceptional educational outcomes and facilities relative to the fee" }
        ]
      },
      {
        id: "ew_7_parent",
        id_actual: "ew_7",
        label: "Q4: Individual Attention",
        text: "How would you rate the school's performance in Individual Attention?",
        options: [
          { val: 2, label: "High student-teacher ratio, generic teaching" },
          { val: 4, label: "Average class sizes, some differentiation" },
          { val: 5, label: "Low student-teacher ratio, highly personalized learning plans" }
        ]
      },
      {
        id: "ew_4_parent",
        id_actual: "ew_4",
        label: "Q5: Co-curricular Education",
        text: "How would you rate the school's performance in Co-curricular Education?",
        options: [
          { val: 2, label: "Minimal activities outside academics" },
          { val: 4, label: "Standard clubs and activities available" },
          { val: 5, label: "Rich, diverse, and nationally recognized co-curricular programs" }
        ]
      },
      {
        id: "ew_5_parent",
        id_actual: "ew_5",
        label: "Q6: Sports Education",
        text: "How would you rate the school's performance in Sports Education?",
        options: [
          { val: 2, label: "Limited facilities and no structured training" },
          { val: 4, label: "Standard playground with basic sports programs" },
          { val: 5, label: "State-of-the-art facilities with professional coaching" }
        ]
      }
    ]
  },
  student: {
    title: "Student Experience & Engagement",
    desc: "Feedback on co-curriculars, infrastructure, and life skills.",
    questions: [
      {
        id: "ew_4_student",
        id_actual: "ew_4",
        label: "Q1: Co-curricular Education",
        text: "How would you rate the school's performance in Co-curricular Education?",
        options: [
          { val: 2, label: "Minimal activities outside academics" },
          { val: 4, label: "Standard clubs and activities available" },
          { val: 5, label: "Rich, diverse, and nationally recognized co-curricular programs" }
        ]
      },
      {
        id: "ew_5_student",
        id_actual: "ew_5",
        label: "Q2: Sports Education",
        text: "How would you rate the school's performance in Sports Education?",
        options: [
          { val: 2, label: "Limited facilities and no structured training" },
          { val: 4, label: "Standard playground with basic sports programs" },
          { val: 5, label: "State-of-the-art facilities with professional coaching" }
        ]
      },
      {
        id: "ew_6_student",
        id_actual: "ew_6",
        label: "Q3: Life Skills Education",
        text: "How would you rate the school's performance in Life Skills Education?",
        options: [
          { val: 2, label: "Not included in the curriculum" },
          { val: 4, label: "Some basic life skills taught occasionally" },
          { val: 5, label: "Integrated comprehensively into daily learning and activities" }
        ]
      },
      {
        id: "ew_14_student",
        id_actual: "ew_14",
        label: "Q4: Community Service",
        text: "How would you rate the school's performance in Community Service?",
        options: [
          { val: 2, label: "No structured community service programs" },
          { val: 4, label: "Occasional local community initiatives" },
          { val: 5, label: "Deeply embedded service programs driving significant local impact" }
        ]
      },
      {
        id: "ew_10_student",
        id_actual: "ew_10",
        label: "Q5: Infrastructure Provision",
        text: "How would you rate the school's performance in Infrastructure Provision?",
        options: [
          { val: 2, label: "Aging facilities, basic amenities" },
          { val: 4, label: "Well-maintained standard classrooms and labs" },
          { val: 5, label: "World-class, modern, and highly equipped campus" }
        ]
      }
    ]
  },
  admin: {
    title: "Admin Staff & Operations",
    desc: "Infrastructure maintenance, support workflows, and operational efficiency.",
    questions: [
      {
        id: "ew_10_admin",
        id_actual: "ew_10",
        label: "Q1: Infrastructure Provision",
        text: "How would you rate the school's performance in Infrastructure Provision?",
        options: [
          { val: 2, label: "Aging facilities, basic amenities" },
          { val: 4, label: "Well-maintained standard classrooms and labs" },
          { val: 5, label: "World-class, modern, and highly equipped campus" }
        ]
      },
      {
        id: "ew_2_admin",
        id_actual: "ew_2",
        label: "Q2: Teacher Welfare & Dev",
        text: "How would you rate the school's performance in Teacher Welfare & Dev?",
        options: [
          { val: 2, label: "High stress, low pay, poor benefits" },
          { val: 4, label: "Average pay, standard benefits, acceptable workload" },
          { val: 5, label: "Competitive pay, excellent benefits, well-managed workload" }
        ]
      },
      {
        id: "ew_8_admin",
        id_actual: "ew_8",
        label: "Q3: Leadership / Management",
        text: "How would you rate the school's performance in Leadership / Management?",
        options: [
          { val: 2, label: "Reactive, disorganized, poor vision" },
          { val: 4, label: "Stable, standard operational management" },
          { val: 5, label: "Visionary, proactive, and highly effective leadership" }
        ]
      },
      {
        id: "ew_13_admin",
        id_actual: "ew_13",
        label: "Q4: Value for Money",
        text: "How would you rate the school's performance in Value for Money?",
        options: [
          { val: 2, label: "High fees with mismatched facilities/outcomes" },
          { val: 4, label: "Fair fees for the services provided" },
          { val: 5, label: "Exceptional educational outcomes and facilities relative to the fee" }
        ]
      }
    ]
  },
  other: {
    title: "Others (Alumni & Partners)",
    desc: "Feedback from alumni, local community, and partners.",
    questions: [
      {
        id: "ew_14_other",
        id_actual: "ew_14",
        label: "Q1: Community Service",
        text: "How would you rate the school's performance in Community Service?",
        options: [
          { val: 2, label: "No structured community service programs" },
          { val: 4, label: "Occasional local community initiatives" },
          { val: 5, label: "Deeply embedded service programs driving significant local impact" }
        ]
      },
      {
        id: "ew_11_other",
        id_actual: "ew_11",
        label: "Q2: Internationalism",
        text: "How would you rate the school's performance in Internationalism?",
        options: [
          { val: 2, label: "No global exposure or partnerships" },
          { val: 4, label: "Occasional international events or basic partnerships" },
          { val: 5, label: "Strong international exchange programs and global curriculum integration" }
        ]
      },
      {
        id: "ew_3_other",
        id_actual: "ew_3",
        label: "Q3: Academic Reputation",
        text: "How would you rate the school's performance in Academic Reputation?",
        options: [
          { val: 2, label: "Below average results, poor local perception" },
          { val: 4, label: "Average results, acceptable perception" },
          { val: 5, label: "Consistently excellent results, highly prestigious" }
        ]
      },
      {
        id: "ew_8_other",
        id_actual: "ew_8",
        label: "Q4: Leadership / Management",
        text: "How would you rate the school's performance in Leadership / Management?",
        options: [
          { val: 2, label: "Reactive, disorganized, poor vision" },
          { val: 4, label: "Stable, standard operational management" },
          { val: 5, label: "Visionary, proactive, and highly effective leadership" }
        ]
      }
    ]
  }
};
