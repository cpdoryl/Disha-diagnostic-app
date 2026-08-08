import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Creating properly formatted sample data files...\n');

// FILE 1: Staff & Teacher Metrics (triggers staff analyzer)
console.log('📄 Creating: Staff_Teacher_Operational_Metrics.xlsx');
const wb1 = XLSX.utils.book_new();

const staffData = [
  { TeacherName: 'Mrs. Sharma', Subject: 'Mathematics', Certified: 'Yes', annual_training_hours: 24, weekly_planning_hours: 5 },
  { TeacherName: 'Mr. Patel', Subject: 'English', Certified: 'Yes', annual_training_hours: 20, weekly_planning_hours: 4.5 },
  { TeacherName: 'Ms. Gupta', Subject: 'Science', Certified: 'Yes', annual_training_hours: 22, weekly_planning_hours: 5 },
  { TeacherName: 'Mr. Singh', Subject: 'History', Certified: 'Yes', annual_training_hours: 18, weekly_planning_hours: 4 },
  { TeacherName: 'Mrs. Khan', Subject: 'Geography', Certified: 'Yes', annual_training_hours: 20, weekly_planning_hours: 4.5 },
  { TeacherName: 'Mr. Verma', Subject: 'PE', Certified: 'Yes', annual_training_hours: 16, weekly_planning_hours: 3.5 },
  { TeacherName: 'Ms. Joshi', Subject: 'Art', Certified: 'Yes', annual_training_hours: 14, weekly_planning_hours: 3 },
  { TeacherName: 'Mr. Desai', Subject: 'Computer Science', Certified: 'Yes', annual_training_hours: 28, weekly_planning_hours: 5.5 },
  { TeacherName: 'Mrs. Lopez', Subject: 'Math', Certified: 'Yes', annual_training_hours: 20, weekly_planning_hours: 4 },
  { TeacherName: 'Mr. Kumar', Subject: 'Physics', Certified: 'Yes', annual_training_hours: 21, weekly_planning_hours: 4.5 }
];

const ws1 = XLSX.utils.json_to_sheet(staffData);
ws1['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb1, ws1, 'Staff Data');

const outputPath1 = path.join(__dirname, 'Staff_Teacher_Operational_Metrics.xlsx');
XLSX.writeFile(wb1, outputPath1);
console.log('   ✅ Created:', outputPath1);

// FILE 2: Operational Dashboard (simple metrics summary)
console.log('\n📄 Creating: Operational_Dashboard_Metrics.xlsx');
const wb2 = XLSX.utils.book_new();

const dashboardData = [
  { MetricName: 'Total_Students', Value: 1260, Unit: 'count' },
  { MetricName: 'Total_Teachers', Value: 45, Unit: 'count' },
  { MetricName: 'students_per_classroom', Value: 28, Unit: 'ratio' },
  { MetricName: 'parent_query_response_sla_hours', Value: 24, Unit: 'hours' },
  { MetricName: 'annual_training_hours', Value: 20, Unit: 'hours_per_teacher_per_year' },
  { MetricName: 'weekly_planning_hours', Value: 4, Unit: 'hours_per_week' },
  { MetricName: 'attendance_rate_pct', Value: 91, Unit: 'percentage' },
  { MetricName: 'fee_collection_rate_pct', Value: 88, Unit: 'percentage' },
  { MetricName: 'board_exam_pass_rate', Value: 82, Unit: 'percentage' },
  { MetricName: 'certified_teachers_pct', Value: 85, Unit: 'percentage' }
];

const ws2 = XLSX.utils.json_to_sheet(dashboardData);
ws2['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 25 }];
XLSX.utils.book_append_sheet(wb2, ws2, 'Metrics');

const outputPath2 = path.join(__dirname, 'Operational_Dashboard_Metrics.xlsx');
XLSX.writeFile(wb2, outputPath2);
console.log('   ✅ Created:', outputPath2);

// FILE 3: Simple CSV format (will be recognized better)
console.log('\n📄 Creating: School_Operational_Metrics.csv');

const csvContent = `Metric,Value,Unit,Status
students_per_classroom,28,students per class,Fair
parent_query_response_sla_hours,24,hours response time,Good
annual_training_hours,20,hours per teacher per year,Acceptable
weekly_planning_hours,4,hours per week,Acceptable
Total Students,1260,count,Healthy
Total Teachers,45,count,Adequate
Attendance Rate,91,percentage,Good
Fee Collection Rate,88,percentage,Good
Board Exam Pass Rate,82,percentage,Good
Certified Teachers,85,percentage,Excellent`;

const csvPath = path.join(__dirname, 'School_Operational_Metrics.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log('   ✅ Created:', csvPath);

// FILE 4: Attendance with metrics embedded
console.log('\n📄 Creating: Attendance_Register_With_Metrics.xlsx');
const wb4 = XLSX.utils.book_new();

const attendanceDataWithMetrics = [
  { Grade: '1A', Students: 32, students_per_classroom: 28, PresentDays: 185, AbsentDays: 15, AttendanceRate: 92.5 },
  { Grade: '2A', Students: 30, students_per_classroom: 28, PresentDays: 180, AbsentDays: 20, AttendanceRate: 90 },
  { Grade: '3A', Students: 28, students_per_classroom: 28, PresentDays: 188, AbsentDays: 12, AttendanceRate: 94 },
  { Grade: '4A', Students: 29, students_per_classroom: 28, PresentDays: 182, AbsentDays: 18, AttendanceRate: 91 },
  { Grade: '5A', Students: 27, students_per_classroom: 28, PresentDays: 190, AbsentDays: 10, AttendanceRate: 95 },
  { Grade: '6A', Students: 31, students_per_classroom: 28, PresentDays: 175, AbsentDays: 25, AttendanceRate: 87.5 },
  { Grade: '7A', Students: 33, students_per_classroom: 28, PresentDays: 178, AbsentDays: 22, AttendanceRate: 89 },
  { Grade: '8A', Students: 30, students_per_classroom: 28, PresentDays: 185, AbsentDays: 15, AttendanceRate: 92.5 },
  { Grade: '9A', Students: 28, students_per_classroom: 28, PresentDays: 188, AbsentDays: 12, AttendanceRate: 94 },
  { Grade: '10A', Students: 26, students_per_classroom: 28, PresentDays: 189, AbsentDays: 11, AttendanceRate: 94.5 }
];

const ws4 = XLSX.utils.json_to_sheet(attendanceDataWithMetrics);
ws4['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
XLSX.utils.book_append_sheet(wb4, ws4, 'Attendance');

const outputPath4 = path.join(__dirname, 'Attendance_Register_With_Metrics.xlsx');
XLSX.writeFile(wb4, outputPath4);
console.log('   ✅ Created:', outputPath4);

console.log('\n' + '='.repeat(70));
console.log('✨ All Sample Data Files Created Successfully!\n');

console.log('📋 FILES CREATED:');
console.log('━'.repeat(70));
console.log('1️⃣  Staff_Teacher_Operational_Metrics.xlsx');
console.log('   → Contains: annual_training_hours, weekly_planning_hours');
console.log('   → Use for: Staff/Teacher data uploads');
console.log();
console.log('2️⃣  Operational_Dashboard_Metrics.xlsx');
console.log('   → Contains: ALL 4 REQUIRED METRICS IN ONE FILE');
console.log('   → Use for: Quick testing of all required fields');
console.log();
console.log('3️⃣  School_Operational_Metrics.csv');
console.log('   → Contains: ALL 4 REQUIRED METRICS IN CSV FORMAT');
console.log('   → Use for: Simple text-based upload testing');
console.log();
console.log('4️⃣  Attendance_Register_With_Metrics.xlsx');
console.log('   → Contains: students_per_classroom + attendance data');
console.log('   → Use for: Attendance + infrastructure metrics');
console.log();

console.log('🎯 RECOMMENDED TESTING:');
console.log('━'.repeat(70));
console.log('✅ BEST FOR COMPLETE VALIDATION:');
console.log('   Upload: Operational_Dashboard_Metrics.xlsx');
console.log('   Expected: ✅ Data VALID! (All 4 metrics found)');
console.log();
console.log('📍 LOCATION:');
console.log('   ' + __dirname);
console.log();
console.log('🚀 ALL FILES READY FOR TESTING!');
console.log('='.repeat(70));
