export interface Student {
  id: string;
  name: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ';
  group: string; // Phân nhóm (Ví dụ: Khá, Trung bình, VIP, Cần kèm thêm)
  classIds: string[];
  status: 'active' | 'inactive';
}

export interface Class {
  id: string;
  name: string;
  schedule: string; // Ví dụ: "Thứ 2, Thứ 5 - 18:00 - 19:30"
  feePerSession: number; // Học phí/buổi
  studentIds: string[];
}

export interface ScheduleItem {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  topic: string; // Chủ đề bài học
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AttendanceRecord {
  id: string; // scheduleItemId + "_" + studentId
  scheduleItemId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late'; // Có mặt, Vắng, Muộn
  note: string;
}

export interface Homework {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  maxScore: number;
}

export interface HomeworkSubmission {
  id: string; // homeworkId + "_" + studentId
  homeworkId: string;
  studentId: string;
  submittedAt?: string;
  score: number | null; // null nếu chưa chấm
  status: 'not_submitted' | 'submitted' | 'graded';
  comment: string;
}

export interface TuitionPayment {
  id: string; // studentId + "_" + classId + "_" + month (YYYY-MM)
  studentId: string;
  classId: string;
  month: string; // YYYY-MM
  amountPaid: number;
  amountDue: number;
  status: 'paid' | 'unpaid' | 'partial';
  paymentDate?: string;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  totalSessions: number;
  totalRevenue: number;
  totalStudentsActive: number;
}
