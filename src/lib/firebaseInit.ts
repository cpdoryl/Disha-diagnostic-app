import { db } from './firebase';
import { collection, addDoc, setDoc, doc, writeBatch } from 'firebase/firestore';

// ===== DIMENSIONS CATALOG =====

const DIMENSIONS_DATA = [
  {
    id: 'D1',
    name: 'Leadership & Governance',
    definition: 'The quality of leadership, strategic vision, governance structures, and decision-making processes',
    category: 'Governance',
    weight: 7
  },
  {
    id: 'D2',
    name: 'Academic Excellence',
    definition: 'Student learning outcomes, assessment results, and curriculum quality',
    category: 'Academic',
    weight: 7
  },
  {
    id: 'D3',
    name: 'Infrastructure & Facilities',
    definition: 'Physical infrastructure, technology infrastructure, and safety',
    category: 'Infrastructure',
    weight: 7
  },
  {
    id: 'D4',
    name: 'Student Wellbeing',
    definition: 'Physical health, mental health, and social-emotional learning',
    category: 'Wellbeing',
    weight: 7
  },
  {
    id: 'D5',
    name: 'Staff Development',
    definition: 'Professional development, skill building, and career advancement',
    category: 'People',
    weight: 7
  },
  {
    id: 'D6',
    name: 'Community Engagement',
    definition: 'Parent involvement, community partnerships, and stakeholder communication',
    category: 'Community',
    weight: 7
  },
  {
    id: 'D7',
    name: 'Innovation & Technology',
    definition: 'Digital learning, technology integration, and innovation culture',
    category: 'Technology',
    weight: 7
  },
  {
    id: 'D8',
    name: 'Financial Management',
    definition: 'Budget allocation, financial transparency, and resource management',
    category: 'Finance',
    weight: 7
  },
  {
    id: 'D9',
    name: 'Quality Assurance',
    definition: 'Quality systems, monitoring, and improvement processes',
    category: 'Quality',
    weight: 7
  },
  {
    id: 'D10',
    name: 'Inclusivity & Diversity',
    definition: 'Inclusive practices, diversity representation, and accessibility',
    category: 'Inclusion',
    weight: 7
  },
  {
    id: 'D11',
    name: 'Curriculum & Learning Outcomes',
    definition: 'Curriculum design, learning objectives, and competency development',
    category: 'Academic',
    weight: 7
  },
  {
    id: 'D12',
    name: 'Stakeholder Satisfaction',
    definition: 'Student satisfaction, parent satisfaction, and staff satisfaction',
    category: 'Satisfaction',
    weight: 7
  },
  {
    id: 'D13',
    name: 'Performance & Accountability',
    definition: 'Performance metrics, target achievement, and accountability systems',
    category: 'Performance',
    weight: 7
  },
  {
    id: 'D14',
    name: 'Organizational Culture',
    definition: 'Values alignment, collaboration, trust, and innovation mindset',
    category: 'Culture',
    weight: 7
  }
];

// ===== CHALLENGES CATALOG =====

const CHALLENGES_DATA = [
  {
    id: 'C1',
    name: 'Enrollment Decline',
    domain: 'Growth & Enrollment',
    severity: 'High',
    affectedDimensions: ['D1', 'D2', 'D6']
  },
  {
    id: 'C2',
    name: 'Student Attrition',
    domain: 'Growth & Enrollment',
    severity: 'High',
    affectedDimensions: ['D4', 'D6', 'D12']
  },
  {
    id: 'C3',
    name: 'Fee Collection Issues',
    domain: 'Growth & Enrollment',
    severity: 'Medium',
    affectedDimensions: ['D8']
  },
  {
    id: 'C4',
    name: 'Teacher Attrition',
    domain: 'People & Staffing',
    severity: 'High',
    affectedDimensions: ['D5', 'D2', 'D1']
  },
  {
    id: 'C5',
    name: 'Staff Capability Gap',
    domain: 'People & Staffing',
    severity: 'High',
    affectedDimensions: ['D5', 'D2', 'D11']
  },
  {
    id: 'C6',
    name: 'Leadership Gap',
    domain: 'People & Staffing',
    severity: 'Critical',
    affectedDimensions: ['D1', 'D3']
  },
  {
    id: 'C7',
    name: 'Academic Decline',
    domain: 'Academic & Wellbeing',
    severity: 'Critical',
    affectedDimensions: ['D2', 'D11', 'D5']
  },
  {
    id: 'C8',
    name: 'Student Wellbeing Issues',
    domain: 'Academic & Wellbeing',
    severity: 'High',
    affectedDimensions: ['D4', 'D12']
  },
  {
    id: 'C9',
    name: 'Remedial Learning Lag',
    domain: 'Academic & Wellbeing',
    severity: 'Medium',
    affectedDimensions: ['D2', 'D11']
  },
  {
    id: 'C10',
    name: 'Parent Communication Gap',
    domain: 'Reputation & Competition',
    severity: 'Medium',
    affectedDimensions: ['D6', 'D12']
  },
  {
    id: 'C11',
    name: 'Competitive Pressure',
    domain: 'Reputation & Competition',
    severity: 'High',
    affectedDimensions: ['D2', 'D1']
  },
  {
    id: 'C12',
    name: 'Brand/Reputation Issues',
    domain: 'Reputation & Competition',
    severity: 'High',
    affectedDimensions: ['D1', 'D6', 'D12']
  },
  {
    id: 'C13',
    name: 'Cost Inflation',
    domain: 'Operations & Finance',
    severity: 'Medium',
    affectedDimensions: ['D8']
  },
  {
    id: 'C14',
    name: 'Infrastructure Deficits',
    domain: 'Operations & Finance',
    severity: 'High',
    affectedDimensions: ['D3', 'D7']
  },
  {
    id: 'C15',
    name: 'Compliance & Regulatory Stress',
    domain: 'Operations & Finance',
    severity: 'Medium',
    affectedDimensions: ['D1', 'D9']
  }
];

// ===== INITIALIZATION FUNCTIONS =====

export async function initializeDimensionsCatalog(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const batch = writeBatch(db);
    const dimensionsColl = collection(db, 'dimensionsCatalog');

    for (const dimension of DIMENSIONS_DATA) {
      const docRef = doc(dimensionsColl, dimension.id);
      batch.set(docRef, {
        ...dimension,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await batch.commit();
    console.log(`✓ Initialized ${DIMENSIONS_DATA.length} dimensions`);
    return { success: true, count: DIMENSIONS_DATA.length };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('✗ Error initializing dimensions:', errorMsg);
    return { success: false, count: 0, error: errorMsg };
  }
}

export async function initializeChallengesCatalog(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const batch = writeBatch(db);
    const challengesColl = collection(db, 'challengesCatalog');

    for (const challenge of CHALLENGES_DATA) {
      const docRef = doc(challengesColl, challenge.id);
      batch.set(docRef, {
        ...challenge,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await batch.commit();
    console.log(`✓ Initialized ${CHALLENGES_DATA.length} challenges`);
    return { success: true, count: CHALLENGES_DATA.length };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('✗ Error initializing challenges:', errorMsg);
    return { success: false, count: 0, error: errorMsg };
  }
}

export async function initializeAllReferenceData(): Promise<{
  success: boolean;
  dimensions: { success: boolean; count: number };
  challenges: { success: boolean; count: number };
  timestamp: string;
}> {
  console.log('Starting DISHA database initialization...');

  const dimensionsResult = await initializeDimensionsCatalog();
  const challengesResult = await initializeChallengesCatalog();

  const result = {
    success: dimensionsResult.success && challengesResult.success,
    dimensions: { success: dimensionsResult.success, count: dimensionsResult.count },
    challenges: { success: challengesResult.success, count: challengesResult.count },
    timestamp: new Date().toISOString()
  };

  console.log('Database initialization complete:', result);
  return result;
}

// ===== VERIFICATION FUNCTION =====

export async function verifyReferenceData(): Promise<{
  success: boolean;
  dimensions: number;
  challenges: number;
  status: string;
}> {
  try {
    const dimensionsSnap = await getDocs(collection(db, 'dimensionsCatalog'));
    const challengesSnap = await getDocs(collection(db, 'challengesCatalog'));

    return {
      success: true,
      dimensions: dimensionsSnap.size,
      challenges: challengesSnap.size,
      status: 'Ready for use'
    };
  } catch (error) {
    console.error('Error verifying reference data:', error);
    return {
      success: false,
      dimensions: 0,
      challenges: 0,
      status: 'Verification failed'
    };
  }
}

// Add missing import
import { getDocs } from 'firebase/firestore';

export { DIMENSIONS_DATA, CHALLENGES_DATA };
