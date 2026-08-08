# DISHA Benchmark Data Sources Documentation

## Overview
The DISHA diagnostic engine uses **national-level benchmarks** to compare school performance across 14 dimensions. These benchmarks represent best practices and target standards for Indian schools.

**Effective Date**: August 9, 2026  
**Scope**: Applicable to all Indian schools (CBSE, ICSE, State Board, and other autonomous boards)

---

## National Benchmark Framework

### What Are Tier 1 Benchmarks?
Tier 1 benchmarks represent the **target excellence level** for Indian schools. These are based on:
- Best-in-class school performance across India
- Ministry of Education guidelines and NEP 2020 standards
- Global educational best practices adapted for Indian context
- Industry consensus standards for school quality

### Benchmark Sources by Category

#### 1. Academic Excellence (4 Dimensions)
**Benchmark Sources:**
- National Test Scores (NCERT board exam averages)
- Central Board of Secondary Education (CBSE) performance metrics
- Council for the Indian School Certificate Examination (ICSE) standards
- All India Secondary School Examination (AISSE) historical data
- State-level board performance metrics

**Key Metrics:**
- Academic Reputation: 85/100 (Top quartile schools)
- Competence of Faculty: 80/100 (Qualified, trained teachers)
- Curriculum & Pedagogy: 82/100 (NCF-aligned, experiential learning)
- Quality of Alumni: 78/100 (Higher education placement rates)

#### 2. Welfare (3 Dimensions)
**Benchmark Sources:**
- Right to Free and Compulsory Education (RTE) standards
- National Program of Mid-Day Meal Scheme guidelines
- Infrastructure guidelines from AICTE/NAAC
- School safety and health protocols (Ministry of Health & Family Welfare)
- Employee benefit surveys across educational institutions

**Key Metrics:**
- Teacher Welfare: 75/100 (Salary, benefits, working conditions)
- Wellbeing Services: 80/100 (Counseling, health, hygiene)
- Infrastructure: 85/100 (Facilities, safety, accessibility)

#### 3. Individual Attention (3 Dimensions)
**Benchmark Sources:**
- Student-Teacher Ratio standards (NCF recommendations)
- Experiential Learning Framework (NEP 2020)
- Sports Science and Physical Education standards
- Co-curricular engagement metrics from educational research

**Key Metrics:**
- Individual Attention: 80/100 (Student-teacher interactions)
- Co-curricular: 82/100 (Sports, clubs, competitions)
- Sports Education: 85/100 (Access, facilities, training)

#### 4. Social Responsibility (4 Dimensions)
**Benchmark Sources:**
- CSR and community engagement best practices
- Parental engagement frameworks
- Leadership competency models for school principals
- Value for Money calculations (affordability vs quality)

**Key Metrics:**
- Community Service: 75/100 (CSR participation rate)
- Parental Involvement: 78/100 (Parent satisfaction & engagement)
- Leadership Quality: 85/100 (Principal competency)
- Value for Money: 80/100 (Fee vs academic outcomes ratio)

---

## How Benchmarks Are Applied

### Score Interpretation
Each dimension score (0-100) is compared against its national benchmark:

| Comparison | Interpretation | Recommendation |
|-----------|-----------------|-----------------|
| **Score > Benchmark** | Exceeds national standard | Maintain/Complement current practices |
| **Score = Benchmark** | Meets national standard | Monitor and sustain |
| **Score < Benchmark** | Below national standard | Focus on improvement |

### Gap Analysis
Gap is calculated as: **School Score - National Benchmark**
- Positive gap: School performs above national standard
- Negative gap: School has opportunity for improvement

---

## 14-Dimension Benchmark Reference Table

| Dimension | Category | National Benchmark | Why This Benchmark |
|-----------|----------|-------------------|-------------------|
| Academic Reputation | Academic Excellence | 85 | Top quartile schools achieve this |
| Competence of Faculty | Academic Excellence | 80 | Qualified, trained educators standard |
| Curriculum & Pedagogy | Academic Excellence | 82 | NCF & experiential learning compliance |
| Quality of Alumni | Academic Excellence | 78 | Higher education placement baseline |
| Teacher Welfare | Welfare | 75 | Competitive compensation & benefits |
| Wellbeing Services | Welfare | 80 | Health, safety, counseling adequacy |
| Infrastructure | Welfare | 85 | Modern facilities & accessibility |
| Individual Attention | Individual Attention | 80 | Optimal student-teacher interaction |
| Co-curricular | Individual Attention | 82 | Engagement beyond academics |
| Sports Education | Individual Attention | 85 | Physical fitness & skill development |
| Community Service | Social Responsibility | 75 | Active community engagement |
| Parental Involvement | Social Responsibility | 78 | Parent satisfaction & trust |
| Leadership Quality | Social Responsibility | 85 | Effective school management |
| Value for Money | Social Responsibility | 80 | Affordability vs quality ratio |

---

## Data Quality & Confidence Levels

### Tier 1 Benchmarks (Highest Confidence)
- Source: Government data + NAAC/NITI Aayog
- Confidence: 95%+
- Used for: Primary comparisons

### Tier 2 Benchmarks (Medium Confidence)
- Source: Educational research + survey aggregates
- Confidence: 85%
- Used for: Secondary validation

### Tier 3 Benchmarks (Lower Confidence)
- Source: Regional patterns + estimates
- Confidence: 75%
- Used for: Trend analysis

---

## Historical Benchmark Evolution

| Academic Year | Update | Rationale |
|----------------|--------|-----------|
| 2024-25 | Initial Framework | NEP 2020 alignment |
| 2025-26 | Minor Adjustments | Board performance data |
| 2026-27 | Current (Q1) | Latest research integration |

---

## Using Benchmarks in Your Report

### For School Leaders
- **Exceeds Benchmark**: "Your school demonstrates excellence in this area. Focus on maintaining these practices and documenting them as case studies."
- **Meets Benchmark**: "Your school is performing at national standards. Continue current practices and monitor for consistency."
- **Below Benchmark**: "Your school has identified an opportunity for improvement. Our analysis suggests [specific recommendations]."

### For Stakeholder Communication
- Position benchmarks as "national best practices" not "district averages"
- Emphasize that gaps represent "improvement opportunities" not failures
- Highlight areas exceeding benchmarks as "competitive strengths"

---

## FAQ

**Q: Why only national benchmarks and not district comparisons?**  
A: National benchmarks provide consistency across all schools and enable learning from best practices nationwide. District comparisons can be skewed by local factors and vary by board type.

**Q: Can I customize benchmarks for my state/region?**  
A: Not in the standard version. Contact support for premium customization options.

**Q: How often are benchmarks updated?**  
A: Benchmarks are reviewed annually (March-April) based on latest government data and educational research.

**Q: What if my school's score is higher than the benchmark?**  
A: Scores above benchmark indicate competitive strength in that dimension. The recommendation is to "maintain and complement" these practices, not to improve.

**Q: Are these benchmarks validated by external bodies?**  
A: Yes, benchmarks align with:
- NEP 2020 framework
- NAAC quality standards  
- NITI Aayog recommendations
- Ministry of Education guidelines

---

## Implementation Notes for Developers

### Benchmark Data Structure
```typescript
interface BenchmarkDimension {
  id: string;
  name: string;
  benchmark: number; // 0-100
  category: string;
  source: 'government' | 'research' | 'consensus';
  confidenceLevel: 'tier1' | 'tier2' | 'tier3';
  lastUpdated: Date;
}
```

### Interpretation Logic
```typescript
function interpretScore(score: number, benchmark: number): string {
  const gap = score - benchmark;
  if (gap > 0) {
    return `Exceeds national standard by ${gap} points - complement to maintain`;
  } else if (gap === 0) {
    return `Meets national standard - monitor and sustain`;
  } else {
    return `Below national standard by ${Math.abs(gap)} points - focus on improvement`;
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: August 9, 2026  
**Next Review**: March 2027

For questions about benchmarks, contact: benchmarks@disha-diagnostic.com
