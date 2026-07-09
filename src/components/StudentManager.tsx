import React, { useState } from 'react';
import { Student, Class } from '../types';
import { Plus, Search, Edit2, Trash2, Tag, Check, X, Phone, User, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentManagerProps {
  students: Student[];
  classes: Class[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentManager({
  students,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}: StudentManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [group, setGroup] = useState('Khá');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  // Get unique list of groups
  const groups = ['All', ...Array.from(new Set(students.map(s => s.group).filter(Boolean)))];

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery) ||
      (student.parentPhone && student.parentPhone.includes(searchQuery));
    const matchesGroup = selectedGroup === 'All' || student.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setPhone('');
    setParentName('');
    setParentPhone('');
    setBirthDate('');
    setGender('Nam');
    setGroup('Khá');
    setSelectedClassIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setPhone(student.phone);
    setParentName(student.parentName);
    setParentPhone(student.parentPhone);
    setBirthDate(student.birthDate);
    setGender(student.gender);
    setGroup(student.group || 'Khá');
    setSelectedClassIds(student.classIds || []);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const studentData = {
      name,
      phone,
      parentName,
      parentPhone,
      birthDate,
      gender,
      group,
      classIds: selectedClassIds,
      status: 'active' as const
    };

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        ...studentData
      });
    } else {
      onAddStudent(studentData);
    }
    setIsModalOpen(false);
  };

  const toggleClassSelection = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên học sinh, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            id="student-search-input"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Phân nhóm:</span>
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedGroup === g
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              id={`group-filter-${g}`}
            >
              {g === 'All' ? 'Tất cả' : g}
            </button>
          ))}
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          id="btn-add-student"
        >
          <Plus className="w-4 h-4" /> Thêm Học Sinh
        </button>
      </div>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const studentClasses = classes.filter(c => student.classIds?.includes(c.id));
            return (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                id={`student-card-${student.id}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                        {student.name}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          student.gender === 'Nam' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                        }`}>
                          {student.gender}
                        </span>
                      </h3>
                      {student.phone ? (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="w-3.5 h-3.5" /> {student.phone}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic mt-1">Chưa có SĐT học sinh</p>
                      )}
                    </div>
                    {student.group && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg">
                        <Tag className="w-3 h-3" /> {student.group}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-gray-50 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Ngày sinh:</span>
                      <span className="font-medium text-xs text-gray-700">
                        {student.birthDate ? new Date(student.birthDate).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Phụ huynh:</span>
                      <span className="font-medium text-xs text-gray-700">{student.parentName || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">SĐT Phụ huynh:</span>
                      <span className="font-medium text-xs text-gray-700">{student.parentPhone || '—'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400 block mb-1.5">Lớp học ({studentClasses.length}):</span>
                    <div className="flex flex-wrap gap-1">
                      {studentClasses.length > 0 ? (
                        studentClasses.map(c => (
                          <span key={c.id} className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Chưa xếp lớp</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(student)}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                    id={`btn-edit-student-${student.id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc chắn muốn xóa học sinh ${student.name} khỏi danh sách?`)) {
                        onDeleteStudent(student.id);
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa"
                    id={`btn-delete-student-${student.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Không tìm thấy học sinh nào phù hợp</p>
            <p className="text-xs text-gray-400 mt-1">Hãy thử đổi bộ lọc hoặc thêm học sinh mới</p>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Student */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl my-8"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {editingStudent ? 'Cập Nhật Học Sinh' : 'Thêm Học Sinh Mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Tên học sinh *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        id="form-student-name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Số điện thoại học sinh</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0912345678"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        id="form-student-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Giới tính</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGender('Nam')}
                        className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                          gender === 'Nam'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Nam
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('Nữ')}
                        className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                          gender === 'Nữ'
                            ? 'bg-pink-50 border-pink-200 text-pink-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Nữ
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày sinh</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        id="form-student-birthdate"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Phân nhóm học tập</label>
                    <select
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      id="form-student-group"
                    >
                      <option value="Giỏi">Giỏi</option>
                      <option value="Khá">Khá</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cần kèm thêm">Cần kèm thêm</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Tên phụ huynh</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Nguyễn Văn B"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      id="form-student-parent-name"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">SĐT phụ huynh</label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="0912345679"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      id="form-student-parent-phone"
                    />
                  </div>
                </div>

                {/* Class Assignment Section */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-gray-500 block mb-2">Đăng ký lớp học</label>
                  <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2">
                    {classes.map(cls => (
                      <div
                        key={cls.id}
                        onClick={() => toggleClassSelection(cls.id)}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-150 cursor-pointer hover:bg-indigo-50/40 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{cls.name}</p>
                          <p className="text-[10px] text-gray-400">{cls.schedule}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          selectedClassIds.includes(cls.id)
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {selectedClassIds.includes(cls.id) && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    ))}
                    {classes.length === 0 && (
                      <p className="text-xs text-gray-400 italic text-center py-2">Chưa có lớp học nào khả dụng</p>
                    )}
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
                    id="form-student-submit"
                  >
                    {editingStudent ? 'Cập nhật' : 'Thêm mới'}
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
