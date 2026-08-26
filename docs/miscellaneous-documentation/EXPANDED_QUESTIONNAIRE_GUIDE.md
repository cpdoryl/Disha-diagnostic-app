# DISHA EWISR - EXPANDED COMPREHENSIVE QUESTIONNAIRE
**Version:** 3.0 (Enhanced Stakeholder Distribution)  
**Date:** 2026-08-05  
**Status:** ✅ READY FOR IMPLEMENTATION

---

## 📊 Overview: Expanded Framework vs Original

### Comparison

| Aspect | Original (v2.0) | Expanded (v3.0) | Increase |
|--------|-----------------|-----------------|----------|
| **Questions per Dimension** | 4 | 10-12 | +162.5% |
| **Total Questions** | 56 | 147 | +162.5% |
| **Total Response Options** | 280 | 735 | +162.5% |
| **Stakeholder Perspectives** | 1 (Generic) | 4 Distinct | 4x |
| **Assessment Time** | 25-30 min | 45-60 min | +100% |
| **Data Richness** | Moderate | High | Excellent |
| **Bias Reduction** | Standard | High | ++ |

---

## 🎯 Stakeholder Groups (4 Perspectives)

### 1. **Management & Leadership** (3-4 questions per dimension)
- **Who**: Principal, Vice-Principal, Academic Coordinators
- **Perspective**: Strategic and operational overview
- **Focus**: Performance metrics, strategic planning, resource allocation
- **Example Questions**:
  - "What is your board exam pass rate compared to national average?"
  - "How many professional development hours per teacher annually?"
  - "How is teacher compensation compared to industry standards?"

### 2. **Faculty & Teaching Staff** (2-3 questions per dimension)
- **Who**: Teachers, Subject Specialists, Academic Support Staff
- **Perspective**: Daily operational experience
- **Focus**: Working conditions, support systems, professional growth
- **Example Questions**:
  - "How well do students come prepared with prerequisite knowledge?"
  - "Are you provided adequate curriculum flexibility?"
  - "How satisfied are you with compensation and benefits?"

### 3. **Parents & Students** (2-3 questions per dimension)
- **Who**: Parents/Guardians, Secondary/Senior Students
- **Perspective**: External stakeholder experience
- **Focus**: Quality perception, satisfaction, outcomes, engagement
- **Example Questions**:
  - "How satisfied are parents with academic quality?"
  - "How confident are students in their abilities?"
  - "Do you feel the academics prepare for competitive exams?"

### 4. **Operational & Quantitative Metrics** (2-3 questions per dimension)
- **Who**: Institution-level data and KPIs
- **Perspective**: Objective, measurable indicators
- **Focus**: Numbers, trends, benchmarks, performance
- **Example Questions**:
  - "What is your year-over-year improvement in exam pass rate?"
  - "What percentage of subjects taught by specialists?"
  - "What is curriculum coverage rate?"

---

## 📋 Example: D01 Academic Reputation (12 Questions Total)

### Management Questions (3)
1. **Q1.M.1** - Board exam pass rate vs national average
2. **Q1.M.2** - Curriculum rigor comparison
3. **Q1.M.3** - Percentage of students scoring 70%+

### Teacher Questions (3)
1. **Q1.T.1** - Student preparation with prerequisites
2. **Q1.T.2** - Curriculum flexibility
3. **Q1.T.3** - Support for curriculum delivery

### Parent/Student Questions (3)
1. **Q1.P.1** - Parent satisfaction with academic quality
2. **Q1.P.2** - Student confidence in abilities
3. **Q1.P.3** - Preparation for competitive exams

### Operational Metrics (3)
1. **Q1.O.1** - Year-over-year improvement trend
2. **Q1.O.2** - Percentage of subjects by specialists
3. **Q1.O.3** - Curriculum coverage rate

---

## 🔧 Implementation Steps

### Step 1: Update Data Import

```typescript
// Before (v2.0)
import { ALL_DIMENSIONS } from '@/data/dimensionalAssessmentData';

// After (v3.0)
import { EXPANDED_DIMENSIONS_TEMPLATE } from '@/data/expandedEWSIRQuestionnaire';
import { STAKEHOLDER_GROUPS } from '@/data/expandedEWSIRQuestionnaire';
```

### Step 2: Update Component to Handle Stakeholder Grouping

```typescript
// components/EWSIRAssessment/ExpandedDimensionSection.tsx
interface ExpandedDimensionSectionProps {
  dimension: ExpandedDimension;
  onResponseChange: (questionId: string, selectedWeight: number) => void;
  responses: DimensionResponse[];
  selectedStakeholders?: ('management' | 'teachers' | 'parents_students' | 'operational_metrics')[];
}

export const ExpandedDimensionSection: React.FC<ExpandedDimensionSectionProps> = ({
  dimension,
  onResponseChange,
  responses,
  selectedStakeholders = ['management', 'teachers', 'parents_students', 'operational_metrics']
}) => {
  // Group questions by stakeholder
  const questionsByStakeholder = dimension.questions.reduce((acc, q) => {
    if (!acc[q.stakeholder]) {
      acc[q.stakeholder] = [];
    }
    acc[q.stakeholder].push(q);
    return acc;
  }, {} as Record<string, ExpandedQuestion[]>);

  return (
    <div className="expanded-dimension-section">
      {/* Render questions grouped by stakeholder */}
      {Object.entries(questionsByStakeholder).map(([stakeholder, questions]) => (
        <div key={stakeholder} className="stakeholder-group">
          <h3>{STAKEHOLDER_GROUPS[stakeholder as keyof typeof STAKEHOLDER_GROUPS].name}</h3>
          {questions.map((question) => (
            // Render question...
          ))}
        </div>
      ))}
    </div>
  );
};
```

### Step 3: Update Hook for Expanded Framework

```typescript
// hooks/useExpandedEWSIRAssessment.ts
export const useExpandedEWSIRAssessment = (schoolName: string = 'My School') => {
  const [assessmentState, setAssessmentState] = useState<ExpandedAssessmentState>({
    schoolName,
    assessmentDate: new Date(),
    responses: [],
    selectedStakeholders: ['management', 'teachers', 'parents_students', 'operational_metrics']
  });

  // Modified to handle more questions per dimension
  const calculateDimensionScores = useCallback((): ExpandedDimensionScore[] => {
    return Object.values(EXPANDED_DIMENSIONS_TEMPLATE).map((dimension) => {
      const dimensionResponses = assessmentState.responses.filter(
        (r) => dimension.questions.some(q => q.id === r.questionId)
      );

      if (dimensionResponses.length === 0) {
        return {
          dimensionId: dimension.dimensionId,
          label: dimension.label,
          weight: dimension.weight,
          averageWeight: 0,
          score: 0,
          stakeholderBreakdown: calculateStakeholderScores(dimension, [])
        };
      }

      // Average all responses for this dimension
      const avgWeight = dimensionResponses.reduce((sum, r) => sum + r.selectedOptionWeight, 0) / 
                        dimensionResponses.length;

      return {
        dimensionId: dimension.dimensionId,
        label: dimension.label,
        weight: dimension.weight,
        averageWeight: avgWeight,
        score: SCORING_FORMULAS.dimensionScore(avgWeight),
        stakeholderBreakdown: calculateStakeholderScores(dimension, dimensionResponses)
      };
    });
  }, [assessmentState.responses]);

  // NEW: Calculate scores broken down by stakeholder
  const calculateStakeholderScores = (
    dimension: ExpandedDimension,
    responses: DimensionResponse[]
  ): StakeholderScoreBreakdown => {
    const stakeholders = Object.keys(dimension.stakeholderBreakdown) as Array<
      'management' | 'teachers' | 'parents_students' | 'operational_metrics'
    >;

    return stakeholders.reduce((acc, stakeholder) => {
      const stakeholderResponses = responses.filter((r) => {
        const question = dimension.questions.find(q => q.id === r.questionId);
        return question?.stakeholder === stakeholder;
      });

      if (stakeholderResponses.length === 0) {
        acc[stakeholder] = null;
        return acc;
      }

      const avgWeight = stakeholderResponses.reduce((sum, r) => sum + r.selectedOptionWeight, 0) /
                        stakeholderResponses.length;

      acc[stakeholder] = {
        averageWeight: avgWeight,
        score: SCORING_FORMULAS.dimensionScore(avgWeight),
        responseCount: stakeholderResponses.length
      };

      return acc;
    }, {} as StakeholderScoreBreakdown);
  };

  return {
    // ... existing methods ...
    calculateStakeholderScores
  };
};
```

### Step 4: Update Results Display

```typescript
// components/EWSIRAssessment/ExpandedDimensionScoreCard.tsx
interface ExpandedDimensionScoreCardProps {
  score: ExpandedDimensionScore;
  showStakeholderBreakdown?: boolean;
}

export const ExpandedDimensionScoreCard: React.FC<ExpandedDimensionScoreCardProps> = ({
  score,
  showStakeholderBreakdown = true
}) => {
  return (
    <div className="expanded-dimension-score-card">
      {/* Overall score */}
      <div className="overall-score">
        <div className="score-value">{score.score.toFixed(1)}</div>
      </div>

      {/* Stakeholder breakdown */}
      {showStakeholderBreakdown && (
        <div className="stakeholder-breakdown">
          <h4>Stakeholder Scores</h4>
          {Object.entries(score.stakeholderBreakdown).map(([stakeholder, scoreData]) => (
            scoreData && (
              <div key={stakeholder} className="stakeholder-score">
                <span className="stakeholder-name">
                  {STAKEHOLDER_GROUPS[stakeholder as keyof typeof STAKEHOLDER_GROUPS].name}
                </span>
                <span className="stakeholder-score-value">{scoreData.score.toFixed(1)}</span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 📈 Scoring Methodology for Expanded Framework

### Approach 1: Simple Average (Recommended for Initial Deployment)
```
Dimension Score = Average of all question weights for that dimension
- Simple and transparent
- Treats all questions equally
- Easy to understand for users
```

### Approach 2: Weighted by Stakeholder Importance
```
Dimension Score = Weighted average where:
  - Management: 30%
  - Teachers: 30%
  - Parents/Students: 25%
  - Operational Metrics: 15%
- Recognizes different stakeholder importance
- More nuanced
- Requires explicit weighting justification
```

### Approach 3: Consensus-Based (Most Robust)
```
Dimension Score = Average of stakeholder group scores
- First average each stakeholder group independently
- Then average the 4 stakeholder group scores
- Requires agreement across perspectives
- Reduces individual bias the most
```

**Recommendation**: Start with **Approach 1** (Simple Average), migrate to **Approach 3** (Consensus-Based) after stakeholder feedback.

---

## 🎨 Updated CSS Classes

```css
/* Expanded framework styling */

.expanded-dimension-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.stakeholder-group {
  padding: var(--spacing-lg);
  background: var(--bg-light);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-healthy);
}

.stakeholder-group h3 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stakeholder-breakdown {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.stakeholder-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  font-size: 0.9rem;
}

.stakeholder-score-value {
  font-weight: 600;
  color: var(--color-healthy);
  font-size: 1.1rem;
}
```

---

## 📊 Data Structure for Expanded Framework

```typescript
interface ExpandedAssessmentState {
  schoolName: string;
  assessmentDate: Date;
  responses: DimensionResponse[];
  selectedStakeholders: StakeholderGroup[];
}

interface ExpandedDimensionScore {
  dimensionId: string;
  label: string;
  weight: number;
  averageWeight: number;
  score: number; // 0-100
  stakeholderBreakdown: StakeholderScoreBreakdown;
}

interface StakeholderScoreBreakdown {
  management?: { averageWeight: number; score: number; responseCount: number };
  teachers?: { averageWeight: number; score: number; responseCount: number };
  parents_students?: { averageWeight: number; score: number; responseCount: number };
  operational_metrics?: { averageWeight: number; score: number; responseCount: number };
}

interface ExpandedQuestion {
  id: string;
  questionId: string;
  label: string;
  stakeholder: StakeholderGroup;
  category: string;
  options: ResponseOption[];
}

type StakeholderGroup = 'management' | 'teachers' | 'parents_students' | 'operational_metrics';
```

---

## 🚀 Migration Path

### Phase 1: Development (Week 1)
- [ ] Create expanded questionnaire data file
- [ ] Create ExpandedDimensionSection component
- [ ] Create useExpandedEWSIRAssessment hook
- [ ] Update scoring formulas to handle multiple questions

### Phase 2: Testing (Week 2)
- [ ] Unit test expanded calculations
- [ ] Test stakeholder grouping
- [ ] Test scoring algorithms
- [ ] Performance test with 147 questions

### Phase 3: Deployment (Week 3)
- [ ] Deploy updated components
- [ ] Monitor assessment completion times
- [ ] Gather user feedback
- [ ] Adjust stakeholder weightings if needed

### Phase 4: Refinement (Week 4)
- [ ] Analyze stakeholder score distributions
- [ ] Identify most valuable questions
- [ ] Potentially optimize to 8-10 questions per dimension
- [ ] Create stakeholder-specific reports

---

## 📊 Assessment Experience Changes

### Completion Time
- **Before**: 25-30 minutes for full assessment
- **After**: 45-60 minutes for full assessment
- **Impact**: Users need ~30 more minutes, but data quality is 3x richer

### Question Presentation
```
View 1: All 147 questions in one flow
View 2: Dimension-by-dimension (14 dimensional sections)
View 3: Stakeholder-by-stakeholder (4 stakeholder perspectives)
View 4: Role-based (only answer questions relevant to your role)
```

**Recommendation**: Implement **View 2** (Dimension-by-dimension) with **View 4** (Role-based) as option.

---

## 📈 Reporting Enhancements

### Standard Report (Available for all)
- Overall Health Index (0-100)
- 14 Dimension Scores
- Health Status Classification
- Top & Bottom Performers
- Action Plan by Priority

### Enhanced Report (New)
- Overall Health Index by Stakeholder Group
- Dimension Scores by Stakeholder
- Stakeholder Consensus Analysis
- Divergence Detection (where stakeholders disagree)
- Stakeholder-Specific Recommendations
- Gap Analysis between perspectives

### Executive Report (New)
- High-level summary of findings
- Stakeholder agreement/disagreement heatmap
- Top 3 action items by stakeholder
- Strategic insights from multi-perspective analysis

---

## 🔍 Quality Metrics for Expanded Framework

### Track These KPIs

1. **Response Consistency** - Do stakeholder groups agree on dimension scores?
   ```
   Formula: Standard Deviation of stakeholder group scores per dimension
   Target: StdDev < 15 (indicates good consensus)
   ```

2. **Data Quality** - Are users completing all questions?
   ```
   Formula: % of questions answered per assessment
   Target: > 90% completion rate
   ```

3. **Assessment Duration** - Is it taking reasonable time?
   ```
   Formula: Average time to complete assessment
   Target: 45-75 minutes
   ```

4. **Stakeholder Participation** - Are all groups represented?
   ```
   Formula: % of assessments with all 4 stakeholder groups
   Target: > 75% with all groups
   ```

---

## 🎓 User Guidance

### For School Leaders
"You'll answer strategic questions about institutional performance, decision-making, and resource allocation. Estimated time: 10-15 minutes."

### For Teachers
"You'll share your perspective on working conditions, professional development, and support systems. Estimated time: 10-15 minutes."

### For Parents & Students
"You'll share your satisfaction and experience with the school's quality and engagement. Estimated time: 10-15 minutes."

### For Data Entry
"You'll provide institutional metrics and performance indicators. Estimated time: 10-15 minutes."

---

## 💾 Database Schema Updates

### New Fields for ewisr_assessments Collection

```javascript
{
  // ... existing fields ...
  
  // NEW: Stakeholder responses tracking
  stakeholderResponses: {
    management: {
      questionCount: 42,
      responseCount: 42,
      completionPercentage: 100,
      averageScore: 75,
      respondent: "Principal Name"
    },
    teachers: {
      questionCount: 35,
      responseCount: 28,
      completionPercentage: 80,
      averageScore: 72,
      respondentCount: 5 // Multiple teachers
    },
    parents_students: {
      questionCount: 35,
      responseCount: 33,
      completionPercentage: 94,
      averageScore: 78,
      respondentCount: 15 // Multiple parents/students
    },
    operational_metrics: {
      questionCount: 35,
      responseCount: 35,
      completionPercentage: 100,
      averageScore: 76,
      respondent: "Data entry person"
    }
  },
  
  // NEW: Stakeholder-specific scores
  stakeholderScores: {
    management: 75,
    teachers: 72,
    parents_students: 78,
    operational_metrics: 76
  },
  
  // NEW: Consensus metrics
  consensusAnalysis: {
    standardDeviation: 2.5,
    agreement: "high", // low | moderate | high
    divergentDimensions: ["D05", "D11"], // Dimensions with high disagreement
    strongAgreement: ["D01", "D03", "D12"] // Dimensions with strong consensus
  }
}
```

---

## ✅ Validation Checklist

- [ ] All 147 questions created (14 × 10-12)
- [ ] All stakeholder groups represented
- [ ] Response options consistent (5-6 per question)
- [ ] Weight scales consistent (1-10)
- [ ] Component handles grouping
- [ ] Hook calculates stakeholder scores
- [ ] CSS updated for new layout
- [ ] Database schema updated
- [ ] Documentation complete
- [ ] Performance tested with full dataset

---

## 🎯 Key Benefits of Expanded Framework

1. **Richer Data** - 3x more questions = 3x more insights
2. **Multi-perspective** - 4 stakeholder views reduce bias
3. **Actionable** - Specific questions lead to targeted fixes
4. **Validated** - Consensus across groups increases confidence
5. **Strategic** - Different perspectives inform different actions
6. **Scalable** - Can be deployed to different stakeholder groups separately

---

## 📞 Support & Next Steps

1. **Review** - Check expanded questionnaire structure
2. **Customize** - Adapt questions 7-14 for remaining dimensions
3. **Implement** - Build components and update hook
4. **Test** - Validate scoring and reports
5. **Deploy** - Roll out to initial pilot schools
6. **Refine** - Gather feedback and optimize

---

**Status**: ✅ **READY TO IMPLEMENT**

The expanded framework provides 3x the data richness with 4 stakeholder perspectives for each dimension. Follow the implementation steps above to integrate into your assessment application.

