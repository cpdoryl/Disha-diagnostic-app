// Load and transform screening questions database for use in the app
// Fetch database dynamically to ensure proper loading

export interface QuestionOption {
  label: string;
  value: string;
  weight: number;
}

export interface Question {
  id: string;
  label: string;
  type: 'select' | 'number' | 'text';
  options?: QuestionOption[];
  placeholder?: string;
}

export interface Challenge {
  id: string;
  category: string;
  label: string;
  description: string;
  probes: string;
  dataRequired: string;
  questions: Question[];
  baselineAnalysis: {
    gapTitle: string;
    mismatchTitle: string;
    diagnosisText: string;
    mismatchText: string;
    recommendedActions: { title: string; desc: string; cost: string; effort: string; roi: string }[];
  };
}

let cachedQuestions: Challenge[] | null = null;

// Transform database format to component format
export const transformScreeningQuestions = async (): Promise<Challenge[]> => {
  // Return cached data if already loaded
  if (cachedQuestions) return cachedQuestions;

  try {
    // Fetch the database from public folder
    const response = await fetch('/screening-questions-database.json');
    if (!response.ok) {
      throw new Error(`Failed to load screening questions: ${response.status}`);
    }
    const data = await response.json();

    const categoriesMap: Record<string, string> = {
      'Growth & Enrollment': 'growth',
      'People & Staffing': 'people',
      'Academic & Wellbeing': 'academic',
      'Reputation & Competition': 'reputation',
      'Operations & Finance': 'operations'
    };

    cachedQuestions = data.challenges.map((challenge: any) => {
      const challengeQuestions = data.questions.filter((q: any) => q.challengeId === challenge.challengeId);
      const transformedQuestions = challengeQuestions.map((q: any) => {
        const transformedOptions = q.options.map((opt: any) => ({
          label: opt.text,
          value: opt.optionId,
          weight: opt.weight
        }));
        console.log(`Question ${q.questionId}: ${transformedOptions.length} options loaded`);
        return {
          id: q.questionId.toLowerCase().replace(/\./g, '_'),
          label: q.question,
          type: 'select' as const,
          options: transformedOptions
        };
      });
      console.log(`Challenge ${challenge.challengeId}: ${transformedQuestions.length} questions loaded`);
      return {
        id: challenge.challengeId.toLowerCase().replace(/\s+/g, '_'),
        category: categoriesMap[challenge.domain] || 'growth',
        label: challenge.name,
        description: challenge.description,
        probes: challenge.domain,
        dataRequired: challenge.metrics.join(', '),
        questions: transformedQuestions,
        baselineAnalysis: {
          gapTitle: `${challenge.name} Assessment`,
          mismatchTitle: `${challenge.name} Gap Analysis`,
          diagnosisText: `Assessment for ${challenge.name} across ${challenge.domain} domain`,
          mismatchText: `Detailed analysis and findings for ${challenge.name}`,
          recommendedActions: [
            {
              title: `Address ${challenge.name}`,
              desc: `Implement targeted improvements for ${challenge.name}`,
              cost: 'Variable',
              effort: 'Medium',
              roi: '2-3x'
            }
          ]
        }
      };
    });

    return cachedQuestions;
  } catch (error) {
    console.error('Error loading screening questions:', error);
    return [];
  }
};

// Initialize screening questions (will load asynchronously)
export const SCREENING_CHALLENGES: Promise<Challenge[]> = transformScreeningQuestions();

export default SCREENING_CHALLENGES;
