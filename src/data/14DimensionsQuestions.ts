/**
 * 14 Dimensions Assessment Questions
 * Comprehensive framework for school diagnostic evaluation
 */

export interface Question {
  id: string;
  text: string;
  hint?: string;
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export const FOURTEEN_DIMENSIONS: Dimension[] = [
  {
    id: 'leadership',
    name: 'Leadership & Governance',
    description: 'Quality of school leadership, decision-making, and governance structures',
    questions: [
      {
        id: 'leadership_1',
        text: 'The school leadership has a clear vision for institutional excellence.',
        hint: 'Rate based on clarity and effectiveness of vision'
      },
      {
        id: 'leadership_2',
        text: 'Decision-making processes are transparent, inclusive, and data-driven.',
        hint: 'Consider involvement of stakeholders'
      },
      {
        id: 'leadership_3',
        text: 'Leadership actively promotes innovation and continuous improvement.',
        hint: 'Look for evidence of change initiatives'
      },
      {
        id: 'leadership_4',
        text: 'The school has effective systems for accountability and monitoring performance.',
        hint: 'Consider tracking mechanisms in place'
      }
    ]
  },
  {
    id: 'academic',
    name: 'Academic Excellence',
    description: 'Quality of teaching, learning outcomes, and curriculum delivery',
    questions: [
      {
        id: 'academic_1',
        text: 'Students consistently achieve high academic results compared to benchmarks.',
        hint: 'Consider exam scores, assessments'
      },
      {
        id: 'academic_2',
        text: 'Teaching methods are interactive, engaging, and student-centered.',
        hint: 'Observe classroom practices'
      },
      {
        id: 'academic_3',
        text: 'The curriculum is comprehensive, aligned with standards, and regularly updated.',
        hint: 'Review curriculum documents'
      },
      {
        id: 'academic_4',
        text: 'Assessment practices are fair, regular, and used to improve learning.',
        hint: 'Look at assessment tools and feedback'
      },
      {
        id: 'academic_5',
        text: 'Students develop critical thinking and problem-solving skills.',
        hint: 'Consider evidence of higher-order thinking'
      }
    ]
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure & Facilities',
    description: 'Physical infrastructure, resources, technology, and learning environment',
    questions: [
      {
        id: 'infrastructure_1',
        text: 'School buildings are well-maintained, safe, and conducive to learning.',
        hint: 'Observe cleanliness, maintenance, safety standards'
      },
      {
        id: 'infrastructure_2',
        text: 'Adequate learning resources including books, labs, and technology are available.',
        hint: 'Check library, computer labs, science labs'
      },
      {
        id: 'infrastructure_3',
        text: 'Technology infrastructure is modern and effectively integrated in learning.',
        hint: 'Consider internet, computers, smart classes'
      },
      {
        id: 'infrastructure_4',
        text: 'Specialized facilities (sports, arts, music) support holistic development.',
        hint: 'Look for diverse facilities'
      }
    ]
  },
  {
    id: 'student_wellbeing',
    name: 'Student Well-being & Support',
    description: 'Student safety, health, counseling, and holistic development',
    questions: [
      {
        id: 'wellbeing_1',
        text: 'The school ensures a safe, secure, and bullying-free environment for all students.',
        hint: 'Consider safety policies and reporting'
      },
      {
        id: 'wellbeing_2',
        text: 'Comprehensive counseling and mental health support services are available.',
        hint: 'Look for trained counselors and support systems'
      },
      {
        id: 'wellbeing_3',
        text: 'Health and nutrition programs promote physical wellness.',
        hint: 'Consider health programs, meals'
      },
      {
        id: 'wellbeing_4',
        text: 'Students are supported in developing life skills and emotional intelligence.',
        hint: 'Observe programs for skill development'
      }
    ]
  },
  {
    id: 'staff_development',
    name: 'Staff Development & Engagement',
    description: 'Teacher quality, professional development, and staff satisfaction',
    questions: [
      {
        id: 'staff_1',
        text: 'Teachers are well-qualified, passionate, and committed to student success.',
        hint: 'Consider qualifications and dedication'
      },
      {
        id: 'staff_2',
        text: 'Regular professional development opportunities help teachers improve their practice.',
        hint: 'Look for training programs and workshops'
      },
      {
        id: 'staff_3',
        text: 'Staff morale and job satisfaction are high.',
        hint: 'Consider turnover rates and satisfaction surveys'
      },
      {
        id: 'staff_4',
        text: 'Performance management systems are fair, transparent, and developmental.',
        hint: 'Review evaluation processes'
      }
    ]
  },
  {
    id: 'community',
    name: 'Community & Stakeholder Engagement',
    description: 'Parental involvement, community partnerships, and school-community relations',
    questions: [
      {
        id: 'community_1',
        text: 'Parents are actively involved in their child\'s learning and school activities.',
        hint: 'Consider parent participation rates'
      },
      {
        id: 'community_2',
        text: 'The school maintains strong partnerships with parents and local community.',
        hint: 'Look for collaboration initiatives'
      },
      {
        id: 'community_3',
        text: 'School communicates regularly and effectively with all stakeholders.',
        hint: 'Consider communication channels'
      },
      {
        id: 'community_4',
        text: 'Community feedback is sought and used to improve school functioning.',
        hint: 'Look for feedback mechanisms'
      }
    ]
  },
  {
    id: 'innovation',
    name: 'Innovation & Technology',
    description: 'Use of technology, innovation initiatives, and digital transformation',
    questions: [
      {
        id: 'innovation_1',
        text: 'Technology is effectively integrated into teaching and learning processes.',
        hint: 'Observe use of digital tools in classrooms'
      },
      {
        id: 'innovation_2',
        text: 'The school encourages experimentation with new teaching methodologies.',
        hint: 'Look for pilot programs and innovation projects'
      },
      {
        id: 'innovation_3',
        text: 'Digital literacy and coding skills are part of the curriculum.',
        hint: 'Check for STEM/computational thinking'
      },
      {
        id: 'innovation_4',
        text: 'The school is prepared for and embraces digital transformation.',
        hint: 'Consider online learning capabilities'
      }
    ]
  },
  {
    id: 'finance',
    name: 'Financial Management & Sustainability',
    description: 'Financial planning, resource allocation, and financial sustainability',
    questions: [
      {
        id: 'finance_1',
        text: 'Financial resources are managed transparently and efficiently.',
        hint: 'Look at budget documentation and audit'
      },
      {
        id: 'finance_2',
        text: 'Resource allocation aligns with school priorities and student needs.',
        hint: 'Consider spending patterns'
      },
      {
        id: 'finance_3',
        text: 'The school has strategies for financial sustainability and cost optimization.',
        hint: 'Look for financial planning'
      },
      {
        id: 'finance_4',
        text: 'Fee collection and financial governance comply with regulations.',
        hint: 'Consider transparency and compliance'
      }
    ]
  },
  {
    id: 'quality',
    name: 'Quality Assurance & Compliance',
    description: 'Internal quality processes, regulatory compliance, and external accreditations',
    questions: [
      {
        id: 'quality_1',
        text: 'The school has robust quality assurance mechanisms to ensure excellence.',
        hint: 'Look for QA processes and audits'
      },
      {
        id: 'quality_2',
        text: 'Regular reviews and evaluations drive continuous improvement.',
        hint: 'Consider self-evaluation and improvement plans'
      },
      {
        id: 'quality_3',
        text: 'The school maintains compliance with all applicable regulations.',
        hint: 'Check regulatory adherence'
      },
      {
        id: 'quality_4',
        text: 'External quality certifications/accreditations are maintained.',
        hint: 'Look for NAAC, ISO, or similar accreditations'
      }
    ]
  },
  {
    id: 'inclusivity',
    name: 'Inclusivity & Diversity',
    description: 'Inclusion of diverse learners, special needs support, and non-discrimination',
    questions: [
      {
        id: 'inclusivity_1',
        text: 'The school is inclusive and welcoming to students from diverse backgrounds.',
        hint: 'Consider diversity in student body'
      },
      {
        id: 'inclusivity_2',
        text: 'Students with special needs receive appropriate support and accommodations.',
        hint: 'Look for inclusive practices and support systems'
      },
      {
        id: 'inclusivity_3',
        text: 'Gender equality and non-discrimination are actively promoted.',
        hint: 'Observe policies and practices'
      },
      {
        id: 'inclusivity_4',
        text: 'Students from disadvantaged backgrounds receive targeted support.',
        hint: 'Look for scholarship and support programs'
      }
    ]
  },
  {
    id: 'curriculum',
    name: 'Curriculum & Learning Outcomes',
    description: 'Curriculum design, learning objectives, and alignment with standards',
    questions: [
      {
        id: 'curriculum_1',
        text: 'Curriculum is balanced across academic, co-curricular, and life skills development.',
        hint: 'Consider breadth of offerings'
      },
      {
        id: 'curriculum_2',
        text: 'Learning outcomes are clearly defined and consistently achieved.',
        hint: 'Review learning objectives'
      },
      {
        id: 'curriculum_3',
        text: 'Curriculum develops 21st century skills like collaboration and creativity.',
        hint: 'Observe skill-building activities'
      },
      {
        id: 'curriculum_4',
        text: 'Interdisciplinary and experiential learning approaches are integrated.',
        hint: 'Look for project-based learning'
      }
    ]
  },
  {
    id: 'satisfaction',
    name: 'Stakeholder Satisfaction & Reputation',
    description: 'Student satisfaction, parent satisfaction, and school reputation',
    questions: [
      {
        id: 'satisfaction_1',
        text: 'Students are happy and enjoy coming to school.',
        hint: 'Consider student engagement and enthusiasm'
      },
      {
        id: 'satisfaction_2',
        text: 'Parents are satisfied with the quality of education and care.',
        hint: 'Look for parent feedback and retention'
      },
      {
        id: 'satisfaction_3',
        text: 'The school has a positive reputation in the community.',
        hint: 'Consider community perception'
      },
      {
        id: 'satisfaction_4',
        text: 'Alumni are successful and proud of their school background.',
        hint: 'Consider alumni achievements'
      }
    ]
  },
  {
    id: 'performance',
    name: 'Performance Management & Accountability',
    description: 'Individual performance evaluation, accountability systems, and recognition',
    questions: [
      {
        id: 'performance_1',
        text: 'Individual performance is regularly evaluated and feedback provided.',
        hint: 'Review appraisal processes'
      },
      {
        id: 'performance_2',
        text: 'High performers are recognized and rewarded appropriately.',
        hint: 'Look for recognition systems'
      },
      {
        id: 'performance_3',
        text: 'Performance data is used for development and improvement planning.',
        hint: 'Consider data-driven decisions'
      },
      {
        id: 'performance_4',
        text: 'Accountability mechanisms are in place at all levels.',
        hint: 'Observe accountability practices'
      }
    ]
  },
  {
    id: 'culture',
    name: 'Organizational Culture & Values',
    description: 'School culture, core values, collaboration, and work environment',
    questions: [
      {
        id: 'culture_1',
        text: 'The school has a strong, positive organizational culture.',
        hint: 'Observe workplace atmosphere and relationships'
      },
      {
        id: 'culture_2',
        text: 'Core values are clearly articulated and lived by all members.',
        hint: 'Look for evidence of values in action'
      },
      {
        id: 'culture_3',
        text: 'Collaboration and teamwork are actively encouraged and practiced.',
        hint: 'Consider team initiatives and projects'
      },
      {
        id: 'culture_4',
        text: 'The work environment is supportive, respectful, and empowering.',
        hint: 'Observe staff interactions and morale'
      }
    ]
  }
];

/**
 * Get dimension by ID
 */
export function getDimensionById(id: string): Dimension | undefined {
  return FOURTEEN_DIMENSIONS.find(d => d.id === id);
}

/**
 * Get all dimension IDs
 */
export function getDimensionIds(): string[] {
  return FOURTEEN_DIMENSIONS.map(d => d.id);
}

/**
 * Get dimension by index
 */
export function getDimensionByIndex(index: number): Dimension | undefined {
  return FOURTEEN_DIMENSIONS[index];
}

/**
 * Get total number of dimensions
 */
export function getTotalDimensions(): number {
  return FOURTEEN_DIMENSIONS.length;
}

/**
 * Calculate total questions across all dimensions
 */
export function getTotalQuestions(): number {
  return FOURTEEN_DIMENSIONS.reduce((sum, dim) => sum + dim.questions.length, 0);
}
