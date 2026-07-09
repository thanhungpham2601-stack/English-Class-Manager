import React, { useState } from 'react';
import { Class, Student, TuitionPayment, ScheduleItem, AttendanceRecord } from '../types';
import { DollarSign, CheckCircle2, XCircle, AlertCircle, HelpCircle, Save, Check, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface TuitionManagerProps {
  classes: Class[];
  students: Student[];
  schedule: ScheduleItem[];
  attendance: AttendanceRecord[];
  tuitionPayments: TuitionPayment[];
  onSaveTuitionPayments: (payments: TuitionPayment[]) => void;
}

export default function TuitionManager({
  classes,
  students,
  schedule,
  attendance,
  tuitionPayments,
  onSaveTuitionPayments
}: TuitionManagerProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07'); // Default July 2026

  const currentClass = classes.find(c => c.id === selectedClassId);
  const classStudents = students.filter(s => currentClass?.studentIds?.includes(s.id));

  // Interactive local state for tuition values
  const [localPayments, setLocalPayments] = useState<{
    [studentId: string]: {
      amountPaid: number;
      amountDue: number;
      status: 'paid' | 'unpaid' | 'partial';
      paymentDate: string;
    };
  }>({});

  // Calculate session count for each student in the selected month
  const calculateMonthSessionsAndDue = (studentId: string): { completedSessions: number; calculatedDue: number } => {
    if (!currentClass) return { completedSessions: 0, calculatedDue: 0 };
    
    // 1. Find all schedule items for this class in the selected month
    const monthSchedules = schedule.filter(s => 
      s.classId === selectedClassId && 
      s.date.startsWith(selectedMonth) &&
      s.status === 'completed'
    );

    // 2. Count sessions where this student was present or late
    let attendedCount = 0;
    monthSchedules.forEach(session => {
      const rec = attendance.find(a => a.scheduleItemId === session.id && a.studentId === studentId);
      if (rec && (rec.status === 'present' || rec.status === 'late')) {
        attendedCount++;
      }
    });

    return {
      completedSessions: attendedCount,
      calculatedDue: attendedCount * currentClass.feePerSession
    };
  };

  // Sync with prop when class, month, or payments change
  React.useEffect(() => {
    if (!selectedClassId || !selectedMonth) return;

    const initialMap: typeof localPayments = {};
    classStudents.forEach(student => {
      // Find existing payment record
      const record = tuitionPayments.find(p => 
        p.studentId === student.id && 
        p.classId === selectedClassId && 
        p.month === selectedMonth
      );

      const { calculatedDue } = calculateMonthSessionsAndDue(student.id);

      if (record) {
        initialMap[student.id] = {
          amountPaid: record.amountPaid,
          amountDue: record.amountDue || calculatedDue,
          status: record.status,
          paymentDate: record.paymentDate || ''
        };
      } else {
        // If no record, initialize with calculated due based on attendance
        initialMap[student.id] = {
          amountPaid: 0,
          amountDue: calculatedDue,
          status: 'unpaid',
          paymentDate: ''
        };
      }
    });

    setLocalPayments(initialMap);
  }, [selectedClassId, selectedMonth, tuitionPayments, students, schedule, attendance]);

  const handlePaidChange = (studentId: string, paidVal: number) => {
    setLocalPayments(prev => {
      const current = prev[studentId] || { amountPaid: 0, amountDue: 0, status: 'unpaid', paymentDate: '' };
      let newStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
      
      if (paidVal >= current.amountDue && current.amountDue > 0) {
        newStatus = 'paid';
      } else if (paidVal > 0) {
        newStatus = 'partial';
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          amountPaid: paidVal,
          status: newStatus,
          paymentDate: newStatus === 'paid' ? '2026-07-08' : current.paymentDate
        }
      };
    });
  };

  const handleDueChange = (studentId: string, dueVal: number) => {
    setLocalPayments(prev => {
      const current = prev[studentId] || { amountPaid: 0, amountDue: 0, status: 'unpaid', paymentDate: '' };
      let newStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
      
      if (current.amountPaid >= dueVal && dueVal > 0) {
        newStatus = 'paid';
      } else if (current.amountPaid > 0) {
        newStatus = 'partial';
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          amountDue: dueVal,
          status: newStatus
        }
      };
    });
  };

  const markFullyPaid = (studentId: string) => {
    setLocalPayments(prev => {
      const current = prev[studentId] || { amountPaid: 0, amountDue: 0, status: 'unpaid', paymentDate: '' };
      return {
        ...prev,
        [studentId]: {
          ...current,
          amountPaid: current.amountDue,
          status: 'paid',
          paymentDate: '2026-07-08'
        }
      };
    });
  };

  const markUnpaid = (studentId: string) => {
    setLocalPayments(prev => {
      const current = prev[studentId] || { amountPaid: 0, amountDue: 0, status: 'unpaid', paymentDate: '' };
      return {
        ...prev,
        [studentId]: {
          ...current,
          amountPaid: 0,
          status: 'unpaid',
          paymentDate: ''
        }
      };
    });
  };

  // Recalculate suggested due amounts based on attendance
  const resetToCalculatedDue = () => {
    setLocalPayments(prev => {
      const updated = { ...prev };
      classStudents.forEach(student => {
        const { calculatedDue } = calculateMonthSessionsAndDue(student.id);
        const current = updated[student.id] || { amountPaid: 0, amountDue: 0, status: 'unpaid', paymentDate: '' };
        
        let newStatus = current.status;
        if (current.amountPaid >= calculatedDue && calculatedDue > 0) {
          newStatus = 'paid';
        } else if (current.amountPaid > 0) {
          newStatus = 'partial';
        } else {
          newStatus = 'unpaid';
        }

        updated[student.id] = {
          ...current,
          amountDue: calculatedDue,
          status: newStatus
        };
      });
      return updated;
    });
  };

  const handleSave = () => {
    if (!selectedClassId || !selectedMonth) return;

    const paymentsToSave: TuitionPayment[] = classStudents.map(student => {
      const state = localPayments[student.id] || { amountPaid: 0, amountDue: 0, status: 'unpaid', paymentDate: '' };
      return {
        id: `${student.id}_${selectedClassId}_${selectedMonth}`,
        studentId: student.id,
        classId: selectedClassId,
        month: selectedMonth,
        amountPaid: state.amountPaid,
        amountDue: state.amountDue,
        status: state.status,
        paymentDate: state.paymentDate || undefined
      };
    });

    onSaveTuitionPayments(paymentsToSave);
    alert('Đã cập nhật trạng thái học phí thành công!');
  };

  // Compute overall summary statistics
  const stats = React.useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    let paidCount = 0;
    
    (Object.values(localPayments) as Array<{ amountPaid: number; amountDue: number; status: 'paid' | 'unpaid' | 'partial'; paymentDate: string }>).forEach(p => {
      totalDue += p.amountDue;
      totalPaid += p.amountPaid;
      if (p.status === 'paid') paidCount++;
    });

    return {
      totalDue,
      totalPaid,
      totalDebt: totalDue - totalPaid,
      paidCount,
      totalCount: Object.keys(localPayments).length
    };
  }, [localPayments]);

  return (
    <div className="space-y-6">
      {/* Selection Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Chọn lớp học</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            id="tuition-class-select"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Chọn tháng học phí</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            id="tuition-month-select"
          />
        </div>

        <button
          onClick={resetToCalculatedDue}
          className="flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-amber-200 transition-colors cursor-pointer"
          id="btn-recalc-tuition"
          title="Tính lại học phí dựa trên điểm danh thực tế"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Tính học phí theo điểm danh
        </button>
      </div>

      {currentClass ? (
        <div className="space-y-6">
          {/* Summary widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Phải Thu (Học phí)</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {stats.totalDue.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block">Đã Thu</span>
              <span className="text-xl font-black text-indigo-600 mt-1 block">
                {stats.totalPaid.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">Còn Nợ</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">
                {stats.totalDebt.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tỷ lệ hoàn thành</span>
              <span className="text-xl font-black text-indigo-600 mt-1 block">
                {stats.totalCount > 0 ? Math.round((stats.paidCount / stats.totalCount) * 100) : 0}% 
                <span className="text-xs text-gray-400 font-medium ml-1">({stats.paidCount}/{stats.totalCount} học sinh)</span>
              </span>
            </div>
          </div>

          {/* List of students and tuition inputs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">DANH SÁCH THU HỌC PHÍ {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}</span>
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-medium">
                Giá gốc: {currentClass.feePerSession.toLocaleString('vi-VN')}đ/buổi
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {classStudents.length > 0 ? (
                classStudents.map((student) => {
                  const state = localPayments[student.id] || { amountPaid: 0, amountDue: 0, status: 'unpaid', paymentDate: '' };
                  const { completedSessions } = calculateMonthSessionsAndDue(student.id);

                  return (
                    <div key={student.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50/40 transition-colors">
                      {/* Left: Student identity & stats */}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm">{student.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-medium">
                            Điểm danh tháng này: <strong className="text-indigo-700 font-black">{completedSessions}</strong> buổi đi học
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>Mã HS: {student.id}</span>
                        </div>
                      </div>

                      {/* Right: Tuition fee values and status buttons */}
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Due amount input */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Học phí cần đóng</span>
                          <div className="relative">
                            <input
                              type="number"
                              step="5000"
                              min={0}
                              value={state.amountDue}
                              onChange={(e) => handleDueChange(student.id, Number(e.target.value))}
                              className="w-32 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              id={`tuition-due-${student.id}`}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">VNĐ</span>
                          </div>
                        </div>

                        {/* Paid amount input */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-indigo-500 font-bold block uppercase">Số tiền đã đóng</span>
                          <div className="relative">
                            <input
                              type="number"
                              step="5000"
                              min={0}
                              value={state.amountPaid}
                              onChange={(e) => handlePaidChange(student.id, Number(e.target.value))}
                              className="w-32 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-indigo-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              id={`tuition-paid-${student.id}`}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400">VNĐ</span>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">Trạng thái</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                            state.status === 'paid'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : state.status === 'partial'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {state.status === 'paid' ? 'Đã đóng đủ' : state.status === 'partial' ? 'Mới đóng một phần' : 'Chưa đóng'}
                          </span>
                        </div>

                        {/* Action shortcuts */}
                        <div className="flex items-center gap-1.5 pt-4">
                          <button
                            onClick={() => markFullyPaid(student.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Xác nhận đã đóng đầy đủ"
                          >
                            <Check className="w-3.5 h-3.5" /> Đóng đủ
                          </button>
                          <button
                            onClick={() => markUnpaid(student.id)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Hủy trạng thái đã đóng"
                          >
                            Hủy đóng
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">Lớp học này chưa đăng ký học sinh nào</p>
                </div>
              )}
            </div>

            {/* Save Button */}
            {classStudents.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
                  id="btn-save-tuition-main"
                >
                  <Save className="w-4 h-4" /> Lưu Trạng Thái Học Phí
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Vui lòng tạo lớp học trước để quản lý học phí</p>
        </div>
      )}
    </div>
  );
}
