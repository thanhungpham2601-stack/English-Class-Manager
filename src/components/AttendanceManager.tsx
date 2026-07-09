import React, { useState } from 'react';
import { ScheduleItem, Class, Student, AttendanceRecord } from '../types';
import { Calendar, UserCheck, AlertTriangle, HelpCircle, Save, Check, X, Clock, HelpCircle as HelpIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface AttendanceManagerProps {
  schedule: ScheduleItem[];
  classes: Class[];
  students: Student[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}

export default function AttendanceManager({
  schedule,
  classes,
  students,
  attendance,
  onSaveAttendance
}: AttendanceManagerProps) {
  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  
  // Get schedule items for selected class, sorted by date desc
  const classSchedules = schedule
    .filter(s => s.classId === selectedClassId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const [selectedSessionId, setSelectedSessionId] = useState<string>(classSchedules[0]?.id || '');

  // Reset selected session if class changes
  React.useEffect(() => {
    const freshSchedules = schedule.filter(s => s.classId === selectedClassId);
    if (freshSchedules.length > 0) {
      setSelectedSessionId(freshSchedules[0].id);
    } else {
      setSelectedSessionId('');
    }
  }, [selectedClassId, schedule]);

  // Selected session details
  const currentSession = schedule.find(s => s.id === selectedSessionId);
  const currentClass = classes.find(c => c.id === selectedClassId);
  
  // Students in selected class
  const classStudents = students.filter(s => currentClass?.studentIds?.includes(s.id));

  // State to hold interactive unsaved attendance for the selected session
  const [sessionAttendance, setSessionAttendance] = useState<{ [studentId: string]: { status: 'present' | 'absent' | 'late'; note: string } }>({});

  // Populate interactive state whenever the session changes or when attendance prop updates
  React.useEffect(() => {
    if (!selectedSessionId) {
      setSessionAttendance({});
      return;
    }

    const initialMap: typeof sessionAttendance = {};
    classStudents.forEach(student => {
      const record = attendance.find(r => r.scheduleItemId === selectedSessionId && r.studentId === student.id);
      initialMap[student.id] = {
        status: record ? record.status : 'present', // default to present
        note: record ? record.note : ''
      };
    });
    setSessionAttendance(initialMap);
  }, [selectedSessionId, selectedClassId, attendance, students]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setSessionAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setSessionAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note
      }
    }));
  };

  const handleSave = () => {
    if (!selectedSessionId) return;

    const recordsToSave: AttendanceRecord[] = classStudents.map(student => {
      const state = sessionAttendance[student.id] || { status: 'present', note: '' };
      return {
        id: `${selectedSessionId}_${student.id}`,
        scheduleItemId: selectedSessionId,
        studentId: student.id,
        status: state.status,
        note: state.note
      };
    });

    onSaveAttendance(recordsToSave);
    alert('Điểm danh thành công!');
  };

  // Quick stats
  const stats = React.useMemo(() => {
    const vals = Object.values(sessionAttendance) as Array<{ status: 'present' | 'absent' | 'late'; note: string }>;
    return {
      present: vals.filter(v => v.status === 'present').length,
      late: vals.filter(v => v.status === 'late').length,
      absent: vals.filter(v => v.status === 'absent').length,
      total: vals.length
    };
  }, [sessionAttendance]);

  return (
    <div className="space-y-6">
      {/* Session selector */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">1. Chọn lớp học</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            id="attendance-class-select"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            {classes.length === 0 && (
              <option value="">Chưa có lớp học nào</option>
            )}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">2. Chọn buổi học cần điểm danh</label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            id="attendance-session-select"
          >
            {classSchedules.map(s => (
              <option key={s.id} value={s.id}>
                {new Date(s.date).toLocaleDateString('vi-VN')} ({s.startTime} - {s.endTime}) - {s.topic}
              </option>
            ))}
            {classSchedules.length === 0 && (
              <option value="">Không có lịch dạy nào cho lớp này</option>
            )}
          </select>
        </div>
      </div>

      {currentSession ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header & Stats Banner */}
          <div className="bg-indigo-600/5 border-b border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">Đang điểm danh</span>
              <h3 className="font-bold text-gray-900 text-lg mt-1">{currentClass?.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                <Calendar className="w-4 h-4 text-gray-400" />
                Ngày {new Date(currentSession.date).toLocaleDateString('vi-VN')} ({currentSession.startTime} - {currentSession.endTime})
                🎯 {currentSession.topic}
              </p>
            </div>

            {/* Quick counters */}
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 text-indigo-800 text-xs px-3 py-1.5 rounded-lg border border-indigo-100 font-semibold">
                Có mặt: {stats.present}
              </div>
              <div className="bg-amber-50 text-amber-800 text-xs px-3 py-1.5 rounded-lg border border-amber-100 font-semibold">
                Muộn: {stats.late}
              </div>
              <div className="bg-red-50 text-red-800 text-xs px-3 py-1.5 rounded-lg border border-red-100 font-semibold">
                Vắng: {stats.absent}
              </div>
            </div>
          </div>

          {/* Student list for attendance */}
          <div className="divide-y divide-gray-100">
            {classStudents.length > 0 ? (
              classStudents.map((student) => {
                const currentRecord = sessionAttendance[student.id] || { status: 'present', note: '' };
                return (
                  <div key={student.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        {student.name}
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">
                          Nhóm: {student.group || 'Chưa nhóm'}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">SĐT: {student.phone || 'Chưa có SĐT'}</p>
                    </div>

                    {/* Attendance selection & notes */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      {/* Note Input */}
                      <input
                        type="text"
                        placeholder="Ghi chú (ví dụ: xin phép, lò bài...)"
                        value={currentRecord.note}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[200px]"
                        id={`attendance-note-${student.id}`}
                      />

                      {/* Status Buttons */}
                      <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-150">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentRecord.status === 'present'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                          id={`btn-attendance-present-${student.id}`}
                        >
                          Có mặt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentRecord.status === 'late'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                          id={`btn-attendance-late-${student.id}`}
                        >
                          Muộn
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentRecord.status === 'absent'
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                          id={`btn-attendance-absent-${student.id}`}
                        >
                          Vắng
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <HelpIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm font-medium">Lớp học này chưa có học sinh nào</p>
                <p className="text-xs text-gray-400 mt-1">Vào mục "Lớp học" hoặc "Học sinh" để xếp học sinh vào lớp</p>
              </div>
            )}
          </div>

          {/* Save Button Footer */}
          {classStudents.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                id="btn-save-attendance-main"
              >
                <Save className="w-4 h-4" /> Lưu Điểm Danh
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Chưa có lịch học để điểm điểm danh</p>
          <p className="text-xs text-gray-400 mt-1">Hãy tạo lớp học và buổi dạy trước khi thực hiện điểm danh</p>
        </div>
      )}
    </div>
  );
}
