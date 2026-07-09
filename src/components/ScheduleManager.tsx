import React, { useState } from 'react';
import { ScheduleItem, Class } from '../types';
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, BookOpen, X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleManagerProps {
  schedule: ScheduleItem[];
  classes: Class[];
  onAddScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  onUpdateScheduleItem: (item: ScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
}

export default function ScheduleManager({
  schedule,
  classes,
  onAddScheduleItem,
  onUpdateScheduleItem,
  onDeleteScheduleItem
}: ScheduleManagerProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-07-08'); // Default to current time in metadata: July 8th, 2026
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [date, setDate] = useState('2026-07-08');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [topic, setTopic] = useState('');

  const selectedDate = new Date(selectedDateStr);

  // Helper: get start of the week (Monday) for a given date
  const getStartOfWeek = (d: Date): Date => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(new Date(selectedDate));

  // Generate 7 days of the week starting from Monday
  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + idx);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return {
      dateStr: `${yyyy}-${mm}-${dd}`,
      dayName: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'][idx],
      dayNum: d.getDate(),
      month: d.getMonth() + 1,
      fullDate: d
    };
  });

  // Navigation handlers
  const navigateDay = (direction: number) => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + direction);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
  };

  const navigateWeek = (direction: number) => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + direction * 7);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
  };

  const handleOpenAddModal = () => {
    if (classes.length === 0) {
      alert('Vui lòng tạo lớp học trước khi lên lịch dạy.');
      return;
    }
    setClassId(classes[0].id);
    setDate(selectedDateStr);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !date || !startTime || !endTime) return;

    onAddScheduleItem({
      classId,
      date,
      startTime,
      endTime,
      topic: topic.trim() || 'Học bài mới',
      status: 'scheduled'
    });
    setTopic('');
    setIsModalOpen(false);
  };

  const handleToggleStatus = (item: ScheduleItem, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    onUpdateScheduleItem({
      ...item,
      status: newStatus
    });
  };

  // Filter schedule for selected day
  const dailySchedules = schedule.filter(s => s.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Calendar Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'day' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              id="btn-view-day"
            >
              Theo Ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              id="btn-view-week"
            >
              Theo Tuần
            </button>
          </div>

          <div className="flex items-center gap-1 border border-gray-100 rounded-xl px-2 py-1 bg-gray-50">
            <button
              onClick={() => viewMode === 'day' ? navigateDay(-1) : navigateWeek(-1)}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 cursor-pointer"
              id="btn-navigate-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-gray-700 px-1 min-w-[100px] text-center select-none">
              {viewMode === 'day' 
                ? new Date(selectedDateStr).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })
                : `Tuần ${weekDays[0].dayNum}/${weekDays[0].month} - ${weekDays[6].dayNum}/${weekDays[6].month}`
              }
            </span>
            <button
              onClick={() => viewMode === 'day' ? navigateDay(1) : navigateWeek(1)}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 cursor-pointer"
              id="btn-navigate-next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => e.target.value && setSelectedDateStr(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            id="schedule-date-picker"
          />
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            id="btn-add-schedule"
          >
            <Plus className="w-4 h-4" /> Thêm Lịch Dạy
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((wd) => {
            const daySchedules = schedule.filter(s => s.date === wd.dateStr);
            const isToday = wd.dateStr === '2026-07-08';
            
            return (
              <div
                key={wd.dateStr}
                className={`bg-white rounded-2xl border p-4 flex flex-col min-h-[350px] transition-all ${
                  isToday 
                    ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-200 bg-indigo-50/10'
                    : 'border-gray-100 shadow-sm'
                }`}
              >
                {/* Day Header */}
                <div className="border-b border-gray-100 pb-3 mb-3 text-center">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {wd.dayName}
                  </p>
                  <p className={`text-2xl font-black mt-0.5 ${isToday ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {wd.dayNum}
                  </p>
                </div>

                {/* Schedules */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {daySchedules.length > 0 ? (
                    daySchedules.map((item) => {
                      const cls = classes.find(c => c.id === item.classId);
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                            item.status === 'completed'
                              ? 'bg-indigo-50/50 border-indigo-100 text-indigo-800'
                              : item.status === 'cancelled'
                              ? 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                              : 'bg-white border-blue-100 shadow-sm text-blue-900 ring-1 ring-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold truncate text-xs block max-w-[80%]">
                              {cls?.name || 'Lớp không rõ'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 font-medium text-[11px] text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{item.startTime} - {item.endTime}</span>
                          </div>

                          <p className="text-[11px] font-medium leading-relaxed italic text-gray-600 truncate" title={item.topic}>
                            🎯 {item.topic}
                          </p>

                          {/* Quick Controls */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                            {item.status === 'scheduled' ? (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(item, 'completed')}
                                  className="text-[10px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                                >
                                  Hoàn thành
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(item, 'cancelled')}
                                  className="text-[10px] font-semibold text-red-500 hover:underline cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(item, 'scheduled')}
                                className="text-[10px] font-medium text-gray-500 hover:underline cursor-pointer"
                              >
                                Lên lịch lại
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Bạn có chắc muốn xóa lịch dạy này?')) {
                                  onDeleteScheduleItem(item.id);
                                }
                              }}
                              className="text-[10px] text-red-400 hover:text-red-600 hover:underline cursor-pointer ml-auto"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-center py-6">
                      <p className="text-[11px] text-gray-400 italic">Trống lịch dạy</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Lịch dạy ngày {new Date(selectedDateStr).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
          </h3>

          <div className="space-y-4">
            {dailySchedules.length > 0 ? (
              dailySchedules.map((item) => {
                const cls = classes.find(c => c.id === item.classId);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all ${
                      item.status === 'completed'
                        ? 'bg-indigo-50/40 border-indigo-100'
                        : item.status === 'cancelled'
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-blue-100 shadow-sm ring-1 ring-blue-50/50'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {cls?.name || 'Lớp không rõ'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.status === 'completed'
                            ? 'bg-indigo-100 text-indigo-800'
                            : item.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.status === 'completed' ? 'Đã dạy' : item.status === 'cancelled' ? 'Đã hủy' : 'Sắp diễn ra'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {item.startTime} - {item.endTime}
                        </span>
                        <span className="flex items-center gap-1 font-medium italic text-gray-600">
                          🎯 Chủ đề: {item.topic}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      {item.status === 'scheduled' ? (
                        <>
                          <button
                            onClick={() => handleToggleStatus(item, 'completed')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Xong
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item, 'cancelled')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Hủy dạy
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(item, 'scheduled')}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Lên lịch lại
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xóa lịch dạy này?')) {
                            onDeleteScheduleItem(item.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Xóa lịch dạy"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium text-sm">Hôm nay không có lịch dạy</p>
                <p className="text-xs text-gray-400 mt-1">Dành cả ngày nghỉ ngơi hoặc bấm "Thêm Lịch Dạy" để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-lg">Lên Lịch Buổi Học</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Chọn lớp học *</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    id="form-schedule-class"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày dạy *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    id="form-schedule-date"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Giờ bắt đầu *</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      id="form-schedule-start-time"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Giờ kết thúc *</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      id="form-schedule-end-time"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Chủ đề bài học (Dự kiến)</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ví dụ: Present Continuous, Speaking Part 1..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    id="form-schedule-topic"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
                    id="form-schedule-submit"
                  >
                    Lưu Lịch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
