const fs = require('fs');

const dimensions = {
  ew_1: { name: 'Competence of Faculty', opts: ['Poorly qualified/No ongoing training', 'Adequately qualified with basic training', 'Highly qualified with continuous professional development'] },
  ew_2: { name: 'Teacher Welfare & Dev', opts: ['High stress, low pay, poor benefits', 'Average pay, standard benefits, acceptable workload', 'Competitive pay, excellent benefits, well-managed workload'] },
  ew_3: { name: 'Academic Reputation', opts: ['Below average results, poor local perception', 'Average results, acceptable perception', 'Consistently excellent results, highly prestigious'] },
  ew_4: { name: 'Co-curricular Education', opts: ['Minimal activities outside academics', 'Standard clubs and activities available', 'Rich, diverse, and nationally recognized co-curricular programs'] },
  ew_5: { name: 'Sports Education', opts: ['Limited facilities and no structured training', 'Standard playground with basic sports programs', 'State-of-the-art facilities with professional coaching'] },
  ew_6: { name: 'Life Skills Education', opts: ['Not included in the curriculum', 'Some basic life skills taught occasionally', 'Integrated comprehensively into daily learning and activities'] },
  ew_7: { name: 'Individual Attention', opts: ['High student-teacher ratio, generic teaching', 'Average class sizes, some differentiation', 'Low student-teacher ratio, highly personalized learning plans'] },
  ew_8: { name: 'Leadership / Management', opts: ['Reactive, disorganized, poor vision', 'Stable, standard operational management', 'Visionary, proactive, and highly effective leadership'] },
  ew_9: { name: 'Parents Involvement', opts: ['Minimal communication, parents feel disconnected', 'Regular PTMs, standard communication', 'Deep partnership, transparent communication, active parent body'] },
  ew_10: { name: 'Infrastructure Provision', opts: ['Aging facilities, basic amenities', 'Well-maintained standard classrooms and labs', 'World-class, modern, and highly equipped campus'] },
  ew_11: { name: 'Internationalism', opts: ['No global exposure or partnerships', 'Occasional international events or basic partnerships', 'Strong international exchange programs and global curriculum integration'] },
  ew_12: { name: 'Special Needs Education', opts: ['No support for SEN students', 'Basic SEN support and some trained staff', 'Comprehensive inclusion policies, dedicated SEN department and resources'] },
  ew_13: { name: 'Value for Money', opts: ['High fees with mismatched facilities/outcomes', 'Fair fees for the services provided', 'Exceptional educational outcomes and facilities relative to the fee'] },
  ew_14: { name: 'Community Service', opts: ['No structured community service programs', 'Occasional local community initiatives', 'Deeply embedded service programs driving significant local impact'] }
};

const map = {
  leader: {
    title: "School Leaders Strategic Survey",
    desc: "Verification of compliance cycles, pedagogy audits, and CBSE structural alignments.",
    dims: ['ew_8', 'ew_1', 'ew_2', 'ew_11', 'ew_13', 'ew_10']
  },
  teacher: {
    title: "Teacher Assessment & Workplace Audit",
    desc: "Feedback on professional development, student attention, and inclusion.",
    dims: ['ew_1', 'ew_2', 'ew_6', 'ew_7', 'ew_12', 'ew_3']
  },
  parent: {
    title: "Parental Sentiment & Satisfaction Tracker",
    desc: "Evaluating academic reputation, involvement, and holistic education.",
    dims: ['ew_3', 'ew_9', 'ew_13', 'ew_7', 'ew_4', 'ew_5']
  },
  student: {
    title: "Student Experience & Engagement",
    desc: "Feedback on co-curriculars, infrastructure, and life skills.",
    dims: ['ew_4', 'ew_5', 'ew_6', 'ew_14', 'ew_10']
  },
  admin: {
    title: "Admin Staff & Operations",
    desc: "Infrastructure maintenance, support workflows, and operational efficiency.",
    dims: ['ew_10', 'ew_2', 'ew_8', 'ew_13']
  },
  other: {
    title: "Others (Alumni & Partners)",
    desc: "Feedback from alumni, local community, and partners.",
    dims: ['ew_14', 'ew_11', 'ew_3', 'ew_8']
  }
};

let output = 'export const SURVEY_QUESTIONS = {\n';

for (const [stId, stData] of Object.entries(map)) {
  output += `  ${stId}: {\n`;
  output += `    title: ${JSON.stringify(stData.title)},\n`;
  output += `    desc: ${JSON.stringify(stData.desc)},\n`;
  output += `    questions: [\n`;
  stData.dims.forEach((dim, idx) => {
    output += `      {\n`;
    output += `        id: "${dim}_${stId}",\n`;
    output += `        id_actual: "${dim}",\n`;
    output += `        label: "Q${idx+1}: ${dimensions[dim].name}",\n`;
    output += `        text: "How would you rate the school's performance in ${dimensions[dim].name}?",\n`;
    output += `        options: [\n`;
    output += `          { val: 2, label: ${JSON.stringify(dimensions[dim].opts[0])} },\n`;
    output += `          { val: 4, label: ${JSON.stringify(dimensions[dim].opts[1])} },\n`;
    output += `          { val: 5, label: ${JSON.stringify(dimensions[dim].opts[2])} }\n`;
    output += `        ]\n`;
    output += `      }${idx < stData.dims.length - 1 ? ',' : ''}\n`;
  });
  output += `    ]\n`;
  output += `  }${stId === 'other' ? '' : ','}\n`;
}

output += '};\n';
fs.writeFileSync('survey_new.ts', output);
