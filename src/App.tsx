import React, { useState, useEffect } from 'react';
import { Student, Class, ScheduleItem, AttendanceRecord, Homework, HomeworkSubmission, TuitionPayment } from './types';
import { 
  initialStudents, 
  initialClasses, 
  initialSchedule, 
  initialAttendance, 
  initialHomeworks, 
  initialHomeworkSubmissions, 
  initialTuitionPayments 
} from './mockData';

// Component imports
import StudentManager from './components/StudentManager';
import ClassManager from './components/ClassManager';
import ScheduleManager from './components/ScheduleManager';
import AttendanceManager from './components/AttendanceManager';
import HomeworkManager from './components/HomeworkManager';
import TuitionManager from './components/TuitionManager';
import ReportManager from './components/ReportManager';

// Icon imports
import { 
  Users, 
  BookOpen, 
  Calendar, 
  UserCheck, 
  FileText, 
  DollarSign, 
  BarChart3, 
  GraduationCap, 
  RotateCcw,
  Sparkles,
  Palette,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider, useTheme } from './context/ThemeContext';

type TabType = 'students' | 'classes' | 'schedule' | 'attendance' | 'homework' | 'tuition' | 'reports';

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const { currentTheme, setThemeById, themes } = useTheme();

  // Core State
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [tuitionPayments, setTuitionPayments] = useState<TuitionPayment[]>([]);

  // 1. Initial Load
  useEffect(() => {
    const localStudents = localStorage.getItem('ecm_students');
    const localClasses = localStorage.getItem('ecm_classes');
    const localSchedule = localStorage.getItem('ecm_schedule');
    const localAttendance = localStorage.getItem('ecm_attendance');
    const localHomeworks = localStorage.getItem('ecm_homeworks');
    const localSubmissions = localStorage.getItem('ecm_submissions');
    const localTuition = localStorage.getItem('ecm_tuition');

    if (localStudents) setStudents(JSON.parse(localStudents));
    else {
      setStudents(initialStudents);
      localStorage.setItem('ecm_students', JSON.stringify(initialStudents));
    }

    if (localClasses) setClasses(JSON.parse(localClasses));
    else {
      setClasses(initialClasses);
      localStorage.setItem('ecm_classes', JSON.stringify(initialClasses));
    }

    if (localSchedule) setSchedule(JSON.parse(localSchedule));
    else {
      setSchedule(initialSchedule);
      localStorage.setItem('ecm_schedule', JSON.stringify(initialSchedule));
    }

    if (localAttendance) setAttendance(JSON.parse(localAttendance));
    else {
      setAttendance(initialAttendance);
      localStorage.setItem('ecm_attendance', JSON.stringify(initialAttendance));
    }

    if (localHomeworks) setHomeworks(JSON.parse(localHomeworks));
    else {
      setHomeworks(initialHomeworks);
      localStorage.setItem('ecm_homeworks', JSON.stringify(initialHomeworks));
    }

    if (localSubmissions) setSubmissions(JSON.parse(localSubmissions));
    else {
      setSubmissions(initialHomeworkSubmissions);
      localStorage.setItem('ecm_submissions', JSON.stringify(initialHomeworkSubmissions));
    }

    if (localTuition) setTuitionPayments(JSON.parse(localTuition));
    else {
      setTuitionPayments(initialTuitionPayments);
      localStorage.setItem('ecm_tuition', JSON.stringify(initialTuitionPayments));
    }
  }, []);

  // Helpers to update and save specific states
  const updateStudentsState = (newStudents: Student[]) => {
    setStudents(newStudents);
    localStorage.setItem('ecm_students', JSON.stringify(newStudents));
  };

  const updateClassesState = (newClasses: Class[]) => {
    setClasses(newClasses);
    localStorage.setItem('ecm_classes', JSON.stringify(newClasses));
  };

  const updateScheduleState = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
    localStorage.setItem('ecm_schedule', JSON.stringify(newSchedule));
  };

  const updateAttendanceState = (newAttendance: AttendanceRecord[]) => {
    setAttendance(newAttendance);
    localStorage.setItem('ecm_attendance', JSON.stringify(newAttendance));
  };

  const updateHomeworkState = (newHomeworks: Homework[]) => {
    setHomeworks(newHomeworks);
    localStorage.setItem('ecm_homeworks', JSON.stringify(newHomeworks));
  };

  const updateSubmissionsState = (newSubmissions: HomeworkSubmission[]) => {
    setSubmissions(newSubmissions);
    localStorage.setItem('ecm_submissions', JSON.stringify(newSubmissions));
  };

  const updateTuitionState = (newTuition: TuitionPayment[]) => {
    setTuitionPayments(newTuition);
    localStorage.setItem('ecm_tuition', JSON.stringify(newTuition));
  };

  // --- Callbacks for Students ---
  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    const studentWithId: Student = {
      ...newStudent,
      id: `std_${Date.now()}`
    };
    const updated = [...students, studentWithId];
    updateStudentsState(updated);

    // If classes were checked, enroll them there too
    if (newStudent.classIds && newStudent.classIds.length > 0) {
      const updatedClasses = classes.map(cls => {
        if (newStudent.classIds.includes(cls.id)) {
          return {
            ...cls,
            studentIds: Array.from(new Set([...(cls.studentIds || []), studentWithId.id]))
          };
        }
        return cls;
      });
      updateClassesState(updatedClasses);
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    updateStudentsState(updated);

    // Synchronize class registrations
    const updatedClasses = classes.map(cls => {
      const shouldHave = updatedStudent.classIds?.includes(cls.id);
      const currentlyHas = cls.studentIds?.includes(updatedStudent.id);

      if (shouldHave && !currentlyHas) {
        return { ...cls, studentIds: [...(cls.studentIds || []), updatedStudent.id] };
      } else if (!shouldHave && currentlyHas) {
        return { ...cls, studentIds: (cls.studentIds || []).filter(id => id !== updatedStudent.id) };
      }
      return cls;
    });
    updateClassesState(updatedClasses);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter(s => s.id !== studentId);
    updateStudentsState(updated);

    // Remove from classes
    const updatedClasses = classes.map(cls => ({
      ...cls,
      studentIds: (cls.studentIds || []).filter(id => id !== studentId)
    }));
    updateClassesState(updatedClasses);

    // Remove from tuition payments
    const updatedTuition = tuitionPayments.filter(p => p.studentId !== studentId);
    updateTuitionState(updatedTuition);
  };

  // --- Callbacks for Classes ---
  const handleAddClass = (newClass: Omit<Class, 'id' | 'studentIds'>) => {
    const classWithId: Class = {
      ...newClass,
      id: `cls_${Date.now()}`,
      studentIds: []
    };
    updateClassesState([...classes, classWithId]);
  };

  const handleUpdateClass = (updatedClass: Class) => {
    const updated = classes.map(c => c.id === updatedClass.id ? updatedClass : c);
    updateClassesState(updated);
  };

  const handleDeleteClass = (classId: string) => {
    const updated = classes.filter(c => c.id !== classId);
    updateClassesState(updated);

    // Unregister this class from all students
    const updatedStudents = students.map(s => ({
      ...s,
      classIds: (s.classIds || []).filter(id => id !== classId)
    }));
    updateStudentsState(updatedStudents);

    // Remove schedule items
    const updatedSchedule = schedule.filter(s => s.classId !== classId);
    updateScheduleState(updatedSchedule);

    // Remove tuition records
    const updatedTuition = tuitionPayments.filter(p => p.classId !== classId);
    updateTuitionState(updatedTuition);
  };

  const handleUpdateStudentClassAssignment = (classId: string, studentIds: string[]) => {
    // 1. Update the class studentIds
    const updatedClasses = classes.map(cls => {
      if (cls.id === classId) {
        return { ...cls, studentIds };
      }
      return cls;
    });
    updateClassesState(updatedClasses);

    // 2. Synchronize back into students' classIds
    const updatedStudents = students.map(student => {
      const isCurrentlyRegistered = student.classIds?.includes(classId);
      const shouldBeRegistered = studentIds.includes(student.id);

      if (shouldBeRegistered && !isCurrentlyRegistered) {
        return { ...student, classIds: [...(student.classIds || []), classId] };
      } else if (!shouldBeRegistered && isCurrentlyRegistered) {
        return { ...student, classIds: (student.classIds || []).filter(id => id !== classId) };
      }
      return student;
    });
    updateStudentsState(updatedStudents);
  };

  // --- Callbacks for Schedule ---
  const handleAddScheduleItem = (newItem: Omit<ScheduleItem, 'id'>) => {
    const itemWithId: ScheduleItem = {
      ...newItem,
      id: `sch_${Date.now()}`
    };
    updateScheduleState([...schedule, itemWithId]);
  };

  const handleUpdateScheduleItem = (updatedItem: ScheduleItem) => {
    const updated = schedule.map(s => s.id === updatedItem.id ? updatedItem : s);
    updateScheduleState(updated);
  };

  const handleDeleteScheduleItem = (itemId: string) => {
    const updated = schedule.filter(s => s.id !== itemId);
    updateScheduleState(updated);

    // Delete attendance records for this session too
    const updatedAttendance = attendance.filter(a => a.scheduleItemId !== itemId);
    updateAttendanceState(updatedAttendance);
  };

  // --- Callbacks for Attendance ---
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    // Create a lookup map of incoming records
    const recordsMap = new Map(records.map(r => [r.id, r]));
    
    // Filter out old records of the same scheduleItemId
    const targetSessionId = records[0]?.scheduleItemId;
    const remainingAttendance = attendance.filter(a => a.scheduleItemId !== targetSessionId);

    // Append new records
    const updated = [...remainingAttendance, ...records];
    updateAttendanceState(updated);
  };

  // --- Callbacks for Homework ---
  const handleAddHomework = (newHw: Omit<Homework, 'id'>) => {
    const hwWithId: Homework = {
      ...newHw,
      id: `hw_${Date.now()}`
    };
    updateHomeworkState([...homeworks, hwWithId]);
  };

  const handleUpdateHomework = (updatedHw: Homework) => {
    const updated = homeworks.map(h => h.id === updatedHw.id ? updatedHw : h);
    updateHomeworkState(updated);
  };

  const handleDeleteHomework = (id: string) => {
    const updated = homeworks.filter(h => h.id !== id);
    updateHomeworkState(updated);

    // Delete submissions
    const updatedSubmissions = submissions.filter(s => s.homeworkId !== id);
    updateSubmissionsState(updatedSubmissions);
  };

  const handleSaveSubmissions = (subs: HomeworkSubmission[]) => {
    const homeworkId = subs[0]?.homeworkId;
    const remainingSubmissions = submissions.filter(s => s.homeworkId !== homeworkId);
    const updated = [...remainingSubmissions, ...subs];
    updateSubmissionsState(updated);
  };

  // --- Callbacks for Tuition ---
  const handleSaveTuitionPayments = (payments: TuitionPayment[]) => {
    const classId = payments[0]?.classId;
    const month = payments[0]?.month;

    // Filter out old records for the same class and month
    const remainingPayments = tuitionPayments.filter(p => !(p.classId === classId && p.month === month));
    const updated = [...remainingPayments, ...payments];
    updateTuitionState(updated);
  };

  // Reset System State to Demo Data
  const handleResetSystem = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu? Tất cả các thay đổi tự tạo sẽ bị xóa.')) {
      setStudents(initialStudents);
      setClasses(initialClasses);
      setSchedule(initialSchedule);
      setAttendance(initialAttendance);
      setHomeworks(initialHomeworks);
      setSubmissions(initialHomeworkSubmissions);
      setTuitionPayments(initialTuitionPayments);

      localStorage.setItem('ecm_students', JSON.stringify(initialStudents));
      localStorage.setItem('ecm_classes', JSON.stringify(initialClasses));
      localStorage.setItem('ecm_schedule', JSON.stringify(initialSchedule));
      localStorage.setItem('ecm_attendance', JSON.stringify(initialAttendance));
      localStorage.setItem('ecm_homeworks', JSON.stringify(initialHomeworks));
      localStorage.setItem('ecm_submissions', JSON.stringify(initialHomeworkSubmissions));
      localStorage.setItem('ecm_tuition', JSON.stringify(initialTuitionPayments));
      
      alert('Đã khôi phục dữ liệu thành công!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--sidebar-bg)] text-slate-300 flex flex-col border-r border-[var(--sidebar-border)] shrink-0 transition-colors duration-300">
        {/* Branding */}
        <div className="p-6 flex items-center gap-3 border-b border-[var(--sidebar-border)]/60">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0 transition-colors duration-300">EL</div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              EnglishPro Admin
              <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-bold transition-colors duration-300">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Hệ thống quản lý lớp học</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'students', label: 'Quản lý học sinh', icon: Users },
            { id: 'classes', label: 'Lớp học', icon: BookOpen },
            { id: 'schedule', label: 'Lịch dạy', icon: Calendar },
            { id: 'attendance', label: 'Điểm danh', icon: UserCheck },
            { id: 'homework', label: 'Bài tập & Điểm', icon: FileText },
            { id: 'tuition', label: 'Học phí', icon: DollarSign },
            { id: 'reports', label: 'Báo cáo tháng', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[var(--sidebar-hover)]/50'
                }`}
                id={`tab-${tab.id}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Theme / Color Switcher */}
        <div className="p-4 border-t border-[var(--sidebar-border)] space-y-2.5 bg-slate-950/20">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Màu sắc chủ đề</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5 pt-0.5">
            {themes.map((t) => {
              const isSelected = currentTheme.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setThemeById(t.id)}
                  style={{ backgroundColor: t.colors[600] }}
                  className={`w-6 h-6 rounded-full border border-white/20 transition-all cursor-pointer relative flex items-center justify-center hover:scale-110 active:scale-95 ${
                    isSelected ? 'scale-110 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={t.name}
                  id={`theme-btn-${t.id}`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-slate-400 font-medium italic text-center leading-none">{currentTheme.name}</p>
        </div>

        {/* Teacher Profile / Bottom Info */}
        <div className="p-4 border-t border-[var(--sidebar-border)] flex items-center gap-3 bg-slate-950/40">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-600 shrink-0 flex items-center justify-center text-xs font-bold text-indigo-800 transition-colors duration-300">
            MH
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">Ms. Ha</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">Senior Teacher</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-150 py-3.5 px-6 sticky top-0 z-40 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {activeTab === 'students' && 'Quản lý Học sinh'}
              {activeTab === 'classes' && 'Quản lý Lớp học'}
              {activeTab === 'schedule' && 'Lịch dạy Hôm nay & Tuần này'}
              {activeTab === 'attendance' && 'Điểm danh Lớp học'}
              {activeTab === 'homework' && 'Bài tập & Điểm số'}
              {activeTab === 'tuition' && 'Theo dõi Học phí'}
              {activeTab === 'reports' && 'Báo cáo Doanh thu & Chuyên cần'}
            </h2>
            <p className="text-xs text-gray-400 font-medium">Hôm nay: Thứ Ba, 24/10/2023</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSystem}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 transition-colors cursor-pointer"
              title="Khôi phục lại dữ liệu mẫu"
              id="btn-reset-system"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi phục dữ liệu mẫu
            </button>
            <div className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-center text-xs text-indigo-700 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>Học kỳ mới 2026</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 flex-1 w-full max-w-7xl mx-auto">
          {/* Tab content panel */}
          <div className="min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'students' && (
                  <StudentManager
                    students={students}
                    classes={classes}
                    onAddStudent={handleAddStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                  />
                )}
                {activeTab === 'classes' && (
                  <ClassManager
                    classes={classes}
                    students={students}
                    onAddClass={handleAddClass}
                    onUpdateClass={handleUpdateClass}
                    onDeleteClass={handleDeleteClass}
                    onUpdateStudentClassAssignment={handleUpdateStudentClassAssignment}
                  />
                )}
                {activeTab === 'schedule' && (
                  <ScheduleManager
                    schedule={schedule}
                    classes={classes}
                    onAddScheduleItem={handleAddScheduleItem}
                    onUpdateScheduleItem={handleUpdateScheduleItem}
                    onDeleteScheduleItem={handleDeleteScheduleItem}
                  />
                )}
                {activeTab === 'attendance' && (
                  <AttendanceManager
                    schedule={schedule}
                    classes={classes}
                    students={students}
                    attendance={attendance}
                    onSaveAttendance={handleSaveAttendance}
                  />
                )}
                {activeTab === 'homework' && (
                  <HomeworkManager
                    homeworks={homeworks}
                    submissions={submissions}
                    classes={classes}
                    students={students}
                    onAddHomework={handleAddHomework}
                    onUpdateHomework={handleUpdateHomework}
                    onDeleteHomework={handleDeleteHomework}
                    onSaveSubmissions={handleSaveSubmissions}
                  />
                )}
                {activeTab === 'tuition' && (
                  <TuitionManager
                    classes={classes}
                    students={students}
                    schedule={schedule}
                    attendance={attendance}
                    tuitionPayments={tuitionPayments}
                    onSaveTuitionPayments={handleSaveTuitionPayments}
                  />
                )}
                {activeTab === 'reports' && (
                  <ReportManager
                    classes={classes}
                    students={students}
                    schedule={schedule}
                    attendance={attendance}
                    tuitionPayments={tuitionPayments}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Styled Footer */}
        <footer className="bg-white border-t border-gray-150 py-4 text-center text-xs text-gray-400 mt-auto">
          <p className="font-semibold text-gray-500">English Pro Admin App • © 2026 All rights reserved</p>
          <p className="mt-0.5">Designed for robust and offline-first classroom administration</p>
        </footer>
      </div>
    </div>
  );
}
