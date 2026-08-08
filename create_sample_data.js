const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create a new workbook
const wb = XLSX.utils.book_new();

// Sheet 1: Operational Metrics Summary
const operationalMetrics = [
  { Metric: 'Student-Teacher Ratio', Value: 28, Unit: 'students per classroom', Status: 'Fair' },
  { Metric: 'Parent Response SLA', Value: 24, Unit: 'hours', Status: 'Good' },
  { Metric: 'Annual Training Hours', Value: 20, Unit: 'hours per teacher per year', Status: 'Acceptable' },
  { Metric: 'Weekly Planning Time', Value: 4, Unit: 'hours per week', Status: 'Acceptable' }
];
const ws1 = XLSX.utils.json_to_sheet(operationalMetrics);
ws1['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 30 }, { wch: 15 }];
XLSX.utils.book_append_sheet(wb, ws1, 'Operational Metrics');

// Sheet 2: Detailed Metrics Breakdown
const detailedMetrics = [
  { Category: 'Staff & Infrastructure', Metric: 'Total Teachers', Value: 45, Benchmark: 40, Gap: 5 },
  { Category: 'Staff & Infrastructure', Metric: 'Total Students', Value: 1260, Benchmark: 1200, Gap: 60 },
  { Category: 'Staff & Infrastructure', Metric: 'Students per Classroom', Value: 28, Benchmark: 25, Gap: -3 },
  { Category: 'Teacher Development', Metric: 'Annual Training Hours', Value: 20, Benchmark: 25, Gap: -5 },
  { Category: 'Teacher Development', Metric: 'Certified Teachers %', Value: 85, Benchmark: 85, Gap: 0 },
  { Category: 'Communication', Metric: 'Parent Response SLA (hours)', Value: 24, Benchmark: 12, Gap: -12 },
  { Category: 'Academic', Metric: 'Board Exam Pass Rate %', Value: 82, Benchmark: 80, Gap: 2 },
  { Category: 'Academic', Metric: 'Average Exam Score', Value: 76, Benchmark: 75, Gap: 1 },
  { Category: 'Operations', Metric: 'Weekly Planning Hours', Value: 4, Benchmark: 5, Gap: -1 },
  { Category: 'Finance', Metric: 'Fee Collection Rate %', Value: 88, Benchmark: 90, Gap: -2 }
];
const ws2 = XLSX.utils.json_to_sheet(detailedMetrics);
ws2['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 8 }];
XLSX.utils.book_append_sheet(wb, ws2, 'Detailed Breakdown');

// Sheet 3: Student Attendance Data
const attendanceData = [
  { Grade: '1A', TotalStudents: 32, PresentDays: 185, AbsentDays: 15, AttendanceRate: 92.5 },
  { Grade: '2A', TotalStudents: 30, PresentDays: 180, AbsentDays: 20, AttendanceRate: 90 },
  { Grade: '3A', TotalStudents: 28, PresentDays: 188, AbsentDays: 12, AttendanceRate: 94 },
  { Grade: '4A', TotalStudents: 29, PresentDays: 182, AbsentDays: 18, AttendanceRate: 91 },
  { Grade: '5A', TotalStudents: 27, PresentDays: 190, AbsentDays: 10, AttendanceRate: 95 },
  { Grade: '6A', TotalStudents: 31, PresentDays: 175, AbsentDays: 25, AttendanceRate: 87.5 },
  { Grade: '7A', TotalStudents: 33, PresentDays: 178, AbsentDays: 22, AttendanceRate: 89 },
  { Grade: '8A', TotalStudents: 30, PresentDays: 185, AbsentDays: 15, AttendanceRate: 92.5 },
  { Grade: '9A', TotalStudents: 28, PresentDays: 188, AbsentDays: 12, AttendanceRate: 94 },
  { Grade: '10A', TotalStudents: 26, PresentDays: 189, AbsentDays: 11, AttendanceRate: 94.5 }
];
const ws3 = XLSX.utils.json_to_sheet(attendanceData);
ws3['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
XLSX.utils.book_append_sheet(wb, ws3, 'Attendance Register');

// Sheet 4: Fee Collection Data
const feeData = [
  { StudentID: 'S001', StudentName: 'Raj Kumar', Grade: '5A', FeeAmount: 50000, PaidAmount: 50000, Status: 'Paid' },
  { StudentID: 'S002', StudentName: 'Priya Singh', Grade: '5A', FeeAmount: 50000, PaidAmount: 35000, Status: 'Partial' },
  { StudentID: 'S003', StudentName: 'Arjun Patel', Grade: '6A', FeeAmount: 52000, PaidAmount: 52000, Status: 'Paid' },
  { StudentID: 'S004', StudentName: 'Sneha Gupta', Grade: '6A', FeeAmount: 52000, PaidAmount: 0, Status: 'Pending' },
  { StudentID: 'S005', StudentName: 'Vikram Singh', Grade: '7A', FeeAmount: 55000, PaidAmount: 55000, Status: 'Paid' },
  { StudentID: 'S006', StudentName: 'Anjali Sharma', Grade: '7A', FeeAmount: 55000, PaidAmount: 55000, Status: 'Paid' },
  { StudentID: 'S007', StudentName: 'Rohit Kumar', Grade: '8A', FeeAmount: 55000, PaidAmount: 55000, Status: 'Paid' },
  { StudentID: 'S008', StudentName: 'Neha Reddy', Grade: '8A', FeeAmount: 55000, PaidAmount: 40000, Status: 'Partial' }
];
const ws4 = XLSX.utils.json_to_sheet(feeData);
ws4['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }];
XLSX.utils.book_append_sheet(wb, ws4, 'Fee Collection');

// Sheet 5: Teacher Training Data
const trainingData = [
  { TeacherName: 'Mrs. Sharma', Subject: 'Mathematics', TrainingCourses: 'Pedagogy, STEM', HoursPer_Year: 24, Certification: 'B.Ed' },
  { TeacherName: 'Mr. Patel', Subject: 'English', TrainingCourses: 'Communication, Literature', HoursPer_Year: 20, Certification: 'M.A' },
  { TeacherName: 'Ms. Gupta', Subject: 'Science', TrainingCourses: 'Lab Safety, Digital Tools', HoursPer_Year: 22, Certification: 'B.Sc' },
  { TeacherName: 'Mr. Singh', Subject: 'History', TrainingCourses: 'Critical Thinking', HoursPer_Year: 18, Certification: 'M.A' },
  { TeacherName: 'Mrs. Khan', Subject: 'Geography', TrainingCourses: 'GIS, Environmental', HoursPer_Year: 20, Certification: 'B.Ed' },
  { TeacherName: 'Mr. Verma', Subject: 'PE', TrainingCourses: 'Sports Science', HoursPer_Year: 16, Certification: 'B.P.Ed' },
  { TeacherName: 'Ms. Joshi', Subject: 'Art', TrainingCourses: 'Creativity Workshop', HoursPer_Year: 14, Certification: 'B.F.A' },
  { TeacherName: 'Mr. Desai', Subject: 'Computer Science', TrainingCourses: 'Coding, Cloud', HoursPer_Year: 28, Certification: 'M.Tech' }
];
const ws5 = XLSX.utils.json_to_sheet(trainingData);
ws5['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
XLSX.utils.book_append_sheet(wb, ws5, 'Teacher Training');

// Sheet 6: Academic Results
const academicData = [
  { Grade: '5A', Subject: 'Mathematics', Average: 78, HighestScore: 95, LowestScore: 45, PassPercentage: 88 },
  { Grade: '5A', Subject: 'English', Average: 75, HighestScore: 92, LowestScore: 38, PassPercentage: 85 },
  { Grade: '5A', Subject: 'Science', Average: 80, HighestScore: 98, LowestScore: 50, PassPercentage: 92 },
  { Grade: '6A', Subject: 'Mathematics', Average: 76, HighestScore: 93, LowestScore: 42, PassPercentage: 86 },
  { Grade: '6A', Subject: 'English', Average: 74, HighestScore: 90, LowestScore: 35, PassPercentage: 82 },
  { Grade: '6A', Subject: 'Science', Average: 79, HighestScore: 96, LowestScore: 48, PassPercentage: 90 },
  { Grade: '10A', Subject: 'Mathematics', Average: 82, HighestScore: 99, LowestScore: 60, PassPercentage: 95 },
  { Grade: '10A', Subject: 'English', Average: 80, HighestScore: 97, LowestScore: 55, PassPercentage: 93 }
];
const ws6 = XLSX.utils.json_to_sheet(academicData);
ws6['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 13 }, { wch: 15 }];
XLSX.utils.book_append_sheet(wb, ws6, 'Academic Results');

// Sheet 7: Parent Response Tracking
const parentResponseData = [
  { Date: '2026-08-01', QueryType: 'Academic', ResponseHours: 4, Status: 'Resolved' },
  { Date: '2026-08-02', QueryType: 'Discipline', ResponseHours: 6, Status: 'Resolved' },
  { Date: '2026-08-03', QueryType: 'Fee', ResponseHours: 2, Status: 'Resolved' },
  { Date: '2026-08-04', QueryType: 'Infrastructure', ResponseHours: 18, Status: 'Resolved' },
  { Date: '2026-08-05', QueryType: 'Curriculum', ResponseHours: 8, Status: 'Resolved' },
  { Date: '2026-08-06', QueryType: 'Behavior', ResponseHours: 3, Status: 'Resolved' },
  { Date: '2026-08-07', QueryType: 'Event', ResponseHours: 12, Status: 'Resolved' },
  { Date: '2026-08-08', QueryType: 'General', ResponseHours: 5, Status: 'Resolved' }
];
const ws7 = XLSX.utils.json_to_sheet(parentResponseData);
ws7['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
XLSX.utils.book_append_sheet(wb, ws7, 'Parent Response SLA');

// Sheet 8: Teacher Planning Hours
const planningData = [
  { Week: 'Week 1', Monday: 1.5, Tuesday: 1.5, Wednesday: 1.5, Thursday: 1.5, Friday: 0.5, TotalHours: 6.5 },
  { Week: 'Week 2', Monday: 1.5, Tuesday: 1.5, Wednesday: 1.0, Thursday: 1.5, Friday: 0.5, TotalHours: 6 },
  { Week: 'Week 3', Monday: 1.5, Tuesday: 1.5, Wednesday: 1.5, Thursday: 1.5, Friday: 0.5, TotalHours: 6.5 },
  { Week: 'Week 4', Monday: 1.0, Tuesday: 1.5, Wednesday: 1.5, Thursday: 1.5, Friday: 0.5, TotalHours: 6 },
  { Week: 'Week 5', Monday: 1.5, Tuesday: 1.5, Wednesday: 1.5, Thursday: 1.5, Friday: 0.5, TotalHours: 6.5 },
  { Week: 'Week 6', Monday: 1.5, Tuesday: 1.5, Wednesday: 1.5, Thursday: 1.5, Friday: 0.5, TotalHours: 6.5 },
  { Week: 'Week 7', Monday: 1.5, Tuesday: 1.5, Wednesday: 1.5, Thursday: 1.5, Friday: 0, TotalHours: 6 },
  { Week: 'Week 8', Monday: 1.5, Tuesday: 1.5, Wednesday: 1.5, Thursday: 1.5, Friday: 0.5, TotalHours: 6.5 }
];
const ws8 = XLSX.utils.json_to_sheet(planningData);
ws8['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
XLSX.utils.book_append_sheet(wb, ws8, 'Planning Hours');

// Write the file
const outputPath = path.join(__dirname, 'DISHA_Sample_School_Data.xlsx');
XLSX.writeFile(wb, outputPath);
console.log('✅ Sample data file created: DISHA_Sample_School_Data.xlsx');
console.log('📊 File includes 8 sheets with operational metrics');
console.log('📁 Location:', outputPath);
