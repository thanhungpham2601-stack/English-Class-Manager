import { Student, Class, ScheduleItem, AttendanceRecord, Homework, HomeworkSubmission, TuitionPayment } from './types';

export const initialStudents: Student[] = [
  {
    id: 'std_1',
    name: 'Nguyễn Minh Anh',
    phone: '0912345678',
    parentName: 'Nguyễn Văn Hùng',
    parentPhone: '0912345679',
    birthDate: '2010-05-15',
    gender: 'Nam',
    group: 'Giỏi',
    classIds: ['cls_ielts', 'cls_com'],
    status: 'active'
  },
  {
    id: 'std_2',
    name: 'Trần Thị Bảo Vy',
    phone: '0987654321',
    parentName: 'Lê Thị Mai',
    parentPhone: '0987654322',
    birthDate: '2010-10-22',
    gender: 'Nữ',
    group: 'Khá',
    classIds: ['cls_ielts'],
    status: 'active'
  },
  {
    id: 'std_3',
    name: 'Phạm Gia Huy',
    phone: '0905123456',
    parentName: 'Phạm Gia Hải',
    parentPhone: '0905123457',
    birthDate: '2011-02-12',
    gender: 'Nam',
    group: 'Cần kèm thêm',
    classIds: ['cls_ielts', 'cls_kids'],
    status: 'active'
  },
  {
    id: 'std_4',
    name: 'Lê Hoàng Nam',
    phone: '0934111222',
    parentName: 'Lê Văn Nam',
    parentPhone: '0934111223',
    birthDate: '2012-08-05',
    gender: 'Nam',
    group: 'Khá',
    classIds: ['cls_kids'],
    status: 'active'
  },
  {
    id: 'std_5',
    name: 'Vũ Thùy Chi',
    phone: '0977888999',
    parentName: 'Vũ Quốc Việt',
    parentPhone: '0977888000',
    birthDate: '2013-12-30',
    gender: 'Nữ',
    group: 'Giỏi',
    classIds: ['cls_kids'],
    status: 'active'
  }
];

export const initialClasses: Class[] = [
  {
    id: 'cls_ielts',
    name: 'IELTS Intensive 5.5+',
    schedule: 'Thứ 2, Thứ 4 - 18:00 - 19:30',
    feePerSession: 150000,
    studentIds: ['std_1', 'std_2', 'std_3']
  },
  {
    id: 'cls_kids',
    name: 'English Fun for Kids (A2)',
    schedule: 'Thứ 3, Thứ 5 - 17:30 - 19:00',
    feePerSession: 120000,
    studentIds: ['std_3', 'std_4', 'std_5']
  },
  {
    id: 'cls_com',
    name: 'Giao tiếp Tiếng Anh Cơ bản',
    schedule: 'Thứ 7 - 19:30 - 21:00',
    feePerSession: 130000,
    studentIds: ['std_1']
  }
];

// Based around current local time: 2026-07-08 (Wednesday)
export const initialSchedule: ScheduleItem[] = [
  {
    id: 'sch_1',
    classId: 'cls_ielts',
    date: '2026-07-06', // Monday
    startTime: '18:00',
    endTime: '19:30',
    topic: 'Writing Task 1 - Bar Chart',
    status: 'completed'
  },
  {
    id: 'sch_2',
    classId: 'cls_kids',
    date: '2026-07-07', // Tuesday
    startTime: '17:30',
    endTime: '19:00',
    topic: 'Vocabulary: Fruits and Animals',
    status: 'completed'
  },
  {
    id: 'sch_3',
    classId: 'cls_ielts',
    date: '2026-07-08', // Wednesday (Today)
    startTime: '18:00',
    endTime: '19:30',
    topic: 'Speaking Part 2 - Describe a person',
    status: 'scheduled'
  },
  {
    id: 'sch_4',
    classId: 'cls_kids',
    date: '2026-07-09', // Thursday
    startTime: '17:30',
    endTime: '19:00',
    topic: 'Simple Present Tense - Game-based',
    status: 'scheduled'
  },
  {
    id: 'sch_5',
    classId: 'cls_com',
    date: '2026-07-11', // Saturday
    startTime: '19:30',
    endTime: '21:00',
    topic: 'Daily Conversations & Shopping',
    status: 'scheduled'
  }
];

export const initialAttendance: AttendanceRecord[] = [
  // Class on July 6th
  {
    id: 'sch_1_std_1',
    scheduleItemId: 'sch_1',
    studentId: 'std_1',
    status: 'present',
    note: 'Học bài tốt'
  },
  {
    id: 'sch_1_std_2',
    scheduleItemId: 'sch_1',
    studentId: 'std_2',
    status: 'present',
    note: ''
  },
  {
    id: 'sch_1_std_3',
    scheduleItemId: 'sch_1',
    studentId: 'std_3',
    status: 'absent',
    note: 'Nghỉ có phép'
  },
  // Class on July 7th
  {
    id: 'sch_2_std_3',
    scheduleItemId: 'sch_2',
    studentId: 'std_3',
    status: 'present',
    note: 'Nhiệt tình'
  },
  {
    id: 'sch_2_std_4',
    scheduleItemId: 'sch_2',
    studentId: 'std_4',
    status: 'late',
    note: 'Muộn 10 phút'
  },
  {
    id: 'sch_2_std_5',
    scheduleItemId: 'sch_2',
    studentId: 'std_5',
    status: 'present',
    note: 'Rất tích cực'
  }
];

export const initialHomeworks: Homework[] = [
  {
    id: 'hw_1',
    classId: 'cls_ielts',
    title: 'Viết bài luận IELTS Writing Task 1',
    description: 'Viết 150 từ mô tả biểu đồ hình cột đã học trên lớp.',
    dueDate: '2026-07-10',
    maxScore: 10
  },
  {
    id: 'hw_2',
    classId: 'cls_kids',
    title: 'Học từ vựng về động vật hoang dã',
    description: 'Làm bài tập trang 24-25 sách Giáo trình English Fun.',
    dueDate: '2026-07-12',
    maxScore: 10
  }
];

export const initialHomeworkSubmissions: HomeworkSubmission[] = [
  {
    id: 'hw_1_std_1',
    homeworkId: 'hw_1',
    studentId: 'std_1',
    submittedAt: '2026-07-08',
    score: 8.5,
    status: 'graded',
    comment: 'Cấu trúc bài viết tốt, dùng từ vựng đa dạng.'
  },
  {
    id: 'hw_1_std_2',
    homeworkId: 'hw_1',
    studentId: 'std_2',
    submittedAt: '2026-07-07',
    score: null,
    status: 'submitted',
    comment: ''
  },
  {
    id: 'hw_1_std_3',
    homeworkId: 'hw_1',
    studentId: 'std_3',
    score: null,
    status: 'not_submitted',
    comment: ''
  }
];

export const initialTuitionPayments: TuitionPayment[] = [
  // July 2026 Payments
  {
    id: 'std_1_cls_ielts_2026-07',
    studentId: 'std_1',
    classId: 'cls_ielts',
    month: '2026-07',
    amountPaid: 1200000,
    amountDue: 1200000,
    status: 'paid',
    paymentDate: '2026-07-02'
  },
  {
    id: 'std_2_cls_ielts_2026-07',
    studentId: 'std_2',
    classId: 'cls_ielts',
    month: '2026-07',
    amountPaid: 0,
    amountDue: 1200000,
    status: 'unpaid'
  },
  {
    id: 'std_3_cls_ielts_2026-07',
    studentId: 'std_3',
    classId: 'cls_ielts',
    month: '2026-07',
    amountPaid: 600000,
    amountDue: 1200000,
    status: 'partial',
    paymentDate: '2026-07-04'
  },
  {
    id: 'std_3_cls_kids_2026-07',
    studentId: 'std_3',
    classId: 'cls_kids',
    month: '2026-07',
    amountPaid: 960000,
    amountDue: 960000,
    status: 'paid',
    paymentDate: '2026-07-05'
  },
  {
    id: 'std_4_cls_kids_2026-07',
    studentId: 'std_4',
    classId: 'cls_kids',
    month: '2026-07',
    amountPaid: 0,
    amountDue: 960000,
    status: 'unpaid'
  },
  {
    id: 'std_5_cls_kids_2026-07',
    studentId: 'std_5',
    classId: 'cls_kids',
    month: '2026-07',
    amountPaid: 960000,
    amountDue: 960000,
    status: 'paid',
    paymentDate: '2026-07-03'
  }
];
