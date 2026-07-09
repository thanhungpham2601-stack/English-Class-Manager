import React, { useState } from 'react';
import { Class, Student, ScheduleItem, AttendanceRecord, TuitionPayment } from '../types';
import { Calendar, DollarSign, BookOpen, UserCheck, TrendingUp, BarChart3, ArrowUpRight, Award, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportManagerProps {
  classes: Class[];
  students: Student[];
  schedule: ScheduleItem[];
  attendance: AttendanceRecord[];
  tuitionPayments: TuitionPayment[];
}

export default function ReportManager({
  classes,
  students,
  schedule,
  attendance,
  tuitionPayments
}: ReportManagerProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07'); // Default July 2026

  // 1. Calculate overall stats for the selected month
  const monthSchedules = schedule.filter(s => 
    s.date.startsWith(selectedMonth) && 
    s.status === 'completed'
  );

  const monthPayments = tuitionPayments.filter(p => 
    p.month === selectedMonth
  );

  const totalSessions = monthSchedules.length;

  const totalCollected = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalDue = monthPayments.reduce((sum, p) => sum + p.amountDue, 0);
  const totalDebt = Math.max(0, totalDue - totalCollected);

  // Active students in selected month (assigned to classes that have schedules or are active)
  const activeStudentsCount = students.filter(s => s.status === 'active' && s.classIds?.length > 0).length;

  // 2. Class breakdown stats
  const classStats = classes.map(cls => {
    const clsSchedules = monthSchedules.filter(s => s.classId === cls.id);
    const clsPayments = monthPayments.filter(p => p.classId === cls.id);
    
    const sessionsCompleted = clsSchedules.length;
    const collected = clsPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const due = clsPayments.reduce((sum, p) => sum + p.amountDue, 0);
    const debt = Math.max(0, due - collected);

    // Calculate average attendance rate for this class in this month
    let totalPresent = 0;
    let totalExpected = 0;

    clsSchedules.forEach(session => {
      const sessionRecords = attendance.filter(a => a.scheduleItemId === session.id);
      sessionRecords.forEach(r => {
        totalExpected++;
        if (r.status === 'present' || r.status === 'late') {
          totalPresent++;
        }
      });
    });

    const attendanceRate = totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 0;

    return {
      ...cls,
      sessionsCompleted,
      collected,
      due,
      debt,
      attendanceRate
    };
  });

  // Insights
  const topRevenueClass = [...classStats].sort((a, b) => b.collected - a.collected)[0];
  const mostAttendedClass = [...classStats].sort((a, b) => b.attendanceRate - a.attendanceRate)[0];

  return (
    <div className="space-y-6">
      {/* Selection Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">Báo Cáo Hoạt Động & Doanh Thu</h2>
          <p className="text-xs text-gray-400 mt-0.5">Tổng hợp kết quả giảng dạy, sĩ số và tài chính theo tháng</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Chọn tháng báo cáo:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            id="report-month-select"
          />
        </div>
      </div>

      {/* Grid overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tổng số buổi dạy</span>
            <span className="text-2xl font-black text-gray-900 mt-0.5 block">{totalSessions} buổi</span>
            <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">Đã hoàn thành xuất sắc</span>
          </div>
        </div>

        {/* Revenue Collected */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Doanh thu thực tế</span>
            <span className="text-2xl font-black text-indigo-600 mt-0.5 block font-mono">
              {totalCollected.toLocaleString('vi-VN')} đ
            </span>
            <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Trên tổng thu: {totalDue.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Debt */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 text-red-600 p-3 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Học phí chưa thu (Nợ)</span>
            <span className="text-2xl font-black text-red-600 mt-0.5 block">
              {totalDebt.toLocaleString('vi-VN')} đ
            </span>
            <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Học viên chưa hoàn tất đóng</span>
          </div>
        </div>

        {/* Active students */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Học viên đang học</span>
            <span className="text-2xl font-black text-gray-900 mt-0.5 block">{activeStudentsCount} học sinh</span>
            <span className="text-[10px] text-blue-600 font-bold block mt-0.5">Tương tác và làm bài tốt</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Monthly Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Custom Visual Bar Chart for Revenue breakdown by class */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2 space-y-6">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Doanh Thu Thực Tế Theo Lớp Học
          </h3>

          <div className="space-y-4">
            {classStats.map((stat) => {
              const maxVal = Math.max(...classStats.map(s => s.collected), 1);
              const percentage = Math.round((stat.collected / maxVal) * 100);

              return (
                <div key={stat.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-800">{stat.name}</span>
                    <span className="text-indigo-600 font-mono">{stat.collected.toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-extrabold text-gray-400 min-w-[30px] text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}

            {classStats.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-6">Không có dữ liệu doanh thu</p>
            )}
          </div>
        </div>

        {/* Monthly Insights Cards */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Điểm Sáng Trong Tháng
          </h3>

          <div className="space-y-3 pt-2">
            {topRevenueClass && topRevenueClass.collected > 0 ? (
              <div className="p-3.5 bg-indigo-50/55 rounded-xl border border-indigo-100 flex items-start gap-3">
                <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Doanh thu cao nhất</h4>
                  <p className="text-sm font-black text-indigo-900 mt-0.5">{topRevenueClass.name}</p>
                  <p className="text-xs text-indigo-700 mt-1">Đạt {topRevenueClass.collected.toLocaleString('vi-VN')} đ thu phí thực tế.</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Chưa xác định được lớp doanh thu cao nhất</p>
            )}

            {mostAttendedClass && mostAttendedClass.attendanceRate > 0 ? (
              <div className="p-3.5 bg-amber-50/55 rounded-xl border border-amber-100 flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Lớp chuyên cần nhất</h4>
                  <p className="text-sm font-black text-amber-900 mt-0.5">{mostAttendedClass.name}</p>
                  <p className="text-xs text-amber-700 mt-1">Tỷ lệ đi học chuyên cần lên tới <strong className="font-extrabold">{mostAttendedClass.attendanceRate}%</strong>.</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Chưa xác định được lớp chuyên cần nhất</p>
            )}
          </div>
        </div>
      </div>

      {/* Class breakdown details table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-500 tracking-wider">
          CHI TIẾT HIỆU SUẤT TỪNG LỚP HỌC
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 font-bold text-gray-600">
                <th className="p-4">Tên lớp học</th>
                <th className="p-4 text-center">Số buổi học thực tế</th>
                <th className="p-4 text-center">Chuyên cần</th>
                <th className="p-4 text-right">Dự kiến thu</th>
                <th className="p-4 text-right">Thực tế đã thu</th>
                <th className="p-4 text-right">Chưa thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
              {classStats.map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50/30">
                  <td className="p-4 font-bold text-gray-900">{stat.name}</td>
                  <td className="p-4 text-center font-bold text-gray-800">{stat.sessionsCompleted} buổi</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${
                      stat.attendanceRate >= 85 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {stat.attendanceRate}%
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">{stat.due.toLocaleString('vi-VN')} đ</td>
                  <td className="p-4 text-right text-indigo-600 font-bold">{stat.collected.toLocaleString('vi-VN')} đ</td>
                  <td className="p-4 text-right text-red-600 font-bold">{stat.debt.toLocaleString('vi-VN')} đ</td>
                </tr>
              ))}
              {classStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">Không có dữ liệu lớp học phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
