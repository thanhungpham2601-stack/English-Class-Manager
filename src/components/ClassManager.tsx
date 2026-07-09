import React, { useState } from 'react';
import { Class, Student } from '../types';
import { Plus, Edit2, Trash2, Users, Calendar, DollarSign, X, Check, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClassManagerProps {
  classes: Class[];
  students: Student[];
  onAddClass: (newClass: Omit<Class, 'id' | 'studentIds'>) => void;
  onUpdateClass: (updatedClass: Class) => void;
  onDeleteClass: (id: string) => void;
  onUpdateStudentClassAssignment: (classId: string, studentIds: string[]) => void;
}

export default function ClassManager({
  classes,
  students,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onUpdateStudentClassAssignment
}: ClassManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  
  // Class details/student assignment modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState<Class | null>(null);
  const [tempStudentIds, setTempStudentIds] = useState<string[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [feePerSession, setFeePerSession] = useState(100000);

  const openAddModal = () => {
    setEditingClass(null);
    setName('');
    setSchedule('');
    setFeePerSession(100000);
    setIsModalOpen(true);
  };

  const openEditModal = (cls: Class) => {
    setEditingClass(cls);
    setName(cls.name);
    setSchedule(cls.schedule);
    setFeePerSession(cls.feePerSession);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingClass) {
      onUpdateClass({
        ...editingClass,
        name,
        schedule,
        feePerSession
      });
    } else {
      onAddClass({
        name,
        schedule,
        feePerSession
      });
    }
    setIsModalOpen(false);
  };

  const openAssignModal = (cls: Class) => {
    setSelectedClassForAssign(cls);
    setTempStudentIds(cls.studentIds || []);
    setIsAssignModalOpen(true);
  };

  const toggleStudentInClass = (studentId: string) => {
    if (tempStudentIds.includes(studentId)) {
      setTempStudentIds(tempStudentIds.filter(id => id !== studentId));
    } else {
      setTempStudentIds([...tempStudentIds, studentId]);
    }
  };

  const handleSaveAssignments = () => {
    if (selectedClassForAssign) {
      onUpdateStudentClassAssignment(selectedClassForAssign.id, tempStudentIds);
      setIsAssignModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">Danh Sách Lớp Học</h2>
          <p className="text-xs text-gray-400 mt-0.5">Quản lý các lớp học, thời khóa biểu và học phí</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
          id="btn-add-class"
        >
          <Plus className="w-4 h-4" /> Thêm Lớp Học
        </button>
      </div>

      {/* Grid of classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classStudents = students.filter(s => cls.studentIds?.includes(s.id));
          return (
            <motion.div
              key={cls.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              id={`class-card-${cls.id}`}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {cls.feePerSession.toLocaleString('vi-VN')}đ / buổi
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{cls.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{cls.schedule || 'Chưa xếp lịch'}</span>
                  </div>
                </div>

                {/* Student quick count */}
                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => openAssignModal(cls)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-2.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    Sĩ số: {classStudents.length} học sinh
                  </button>
                </div>

                {/* Preview student names */}
                <div className="text-xs space-y-1">
                  <span className="text-gray-400 block font-medium">Danh sách nhanh:</span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-1">
                    {classStudents.map(s => (
                      <span key={s.id} className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-[11px] font-medium border border-gray-100">
                        {s.name}
                      </span>
                    ))}
                    {classStudents.length === 0 && (
                      <span className="text-gray-400 italic">Chưa có học sinh nào đăng ký</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(cls)}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="Sửa lớp học"
                  id={`btn-edit-class-${cls.id}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn xóa lớp học ${cls.name}? Học viên thuộc lớp này sẽ tự động hủy đăng ký khỏi lớp.`)) {
                      onDeleteClass(cls.id);
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa lớp học"
                  id={`btn-delete-class-${cls.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
        {classes.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Chưa có lớp học nào</p>
            <p className="text-xs text-gray-400 mt-1">Vui lòng nhấp vào nút "Thêm Lớp Học" để bắt đầu</p>
          </div>
        )}
      </div>

      {/* Add / Edit Class Modal */}
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
                <h3 className="font-semibold text-gray-900 text-lg">
                  {editingClass ? 'Cập Nhật Lớp Học' : 'Thêm Lớp Học Mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Tên lớp học *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: IELTS Listening & Reading"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    id="form-class-name"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Thời khóa biểu / Lịch học *</label>
                  <input
                    type="text"
                    required
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="Ví dụ: Thứ 2, Thứ 5 - 18:00 - 19:30"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    id="form-class-schedule"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Học phí mỗi buổi dạy (VNĐ) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      required
                      min={0}
                      value={feePerSession}
                      onChange={(e) => setFeePerSession(Number(e.target.value))}
                      placeholder="150000"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      id="form-class-fee"
                    />
                  </div>
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
                    id="form-class-submit"
                  >
                    {editingClass ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Students Modal */}
      <AnimatePresence>
        {isAssignModalOpen && selectedClassForAssign && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Phân Bổ Học Sinh</h3>
                  <p className="text-xs text-gray-400">Lớp: {selectedClassForAssign.name}</p>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Chọn hoặc bỏ chọn học sinh dưới đây để thêm/bớt khỏi lớp.</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50">
                  {students.map(s => {
                    const isSelected = tempStudentIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleStudentInClass(s.id)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-gray-150 cursor-pointer hover:bg-indigo-50/40 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{s.name}</p>
                          <p className="text-[10px] text-gray-400">{s.phone || 'Chưa có SĐT'} • Nhóm: {s.group}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                  {students.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">Chưa có học sinh nào trong cơ sở dữ liệu</p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveAssignments}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
                    id="btn-save-assignments"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
