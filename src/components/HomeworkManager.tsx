import React, { useState } from 'react';
import { Homework, HomeworkSubmission, Class, Student } from '../types';
import { Plus, Check, Edit2, Trash2, Calendar, FileText, CheckCircle, Clock, X, AlertCircle, Award, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeworkManagerProps {
  homeworks: Homework[];
  submissions: HomeworkSubmission[];
  classes: Class[];
  students: Student[];
  onAddHomework: (hw: Omit<Homework, 'id'>) => void;
  onUpdateHomework: (hw: Homework) => void;
  onDeleteHomework: (id: string) => void;
  onSaveSubmissions: (subs: HomeworkSubmission[]) => void;
}

export default function HomeworkManager({
  homeworks,
  submissions,
  classes,
  students,
  onAddHomework,
  onUpdateHomework,
  onDeleteHomework,
  onSaveSubmissions
}: HomeworkManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);

  // Quick grading modal state
  const [gradingHomework, setGradingHomework] = useState<Homework | null>(null);
  const [tempScores, setTempScores] = useState<{ [studentId: string]: { score: string; comment: string; status: 'not_submitted' | 'submitted' | 'graded' } }>({});

  // Form State for creating/editing homework
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-07-15');
  const [maxScore, setMaxScore] = useState(10);

  const openAddModal = () => {
    if (classes.length === 0) {
      alert('Vui lòng tạo lớp học trước khi giao bài tập.');
      return;
    }
    setEditingHomework(null);
    setClassId(classes[0].id);
    setTitle('');
    setDescription('');
    setDueDate('2026-07-15');
    setMaxScore(10);
    setIsModalOpen(true);
  };

  const openEditModal = (hw: Homework) => {
    setEditingHomework(hw);
    setClassId(hw.classId);
    setTitle(hw.title);
    setDescription(hw.description);
    setDueDate(hw.dueDate);
    setMaxScore(hw.maxScore);
    setIsModalOpen(true);
  };

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classId) return;

    if (editingHomework) {
      onUpdateHomework({
        ...editingHomework,
        classId,
        title,
        description,
        dueDate,
        maxScore
      });
    } else {
      onAddHomework({
        classId,
        title,
        description,
        dueDate,
        maxScore
      });
    }
    setIsModalOpen(false);
  };

  // Open the "Chấm nhanh" (quick grade) interface
  const handleOpenGrading = (hw: Homework) => {
    setGradingHomework(hw);
    const cls = classes.find(c => c.id === hw.classId);
    const clsStudents = students.filter(s => cls?.studentIds?.includes(s.id));

    const initialMap: typeof tempScores = {};
    clsStudents.forEach(student => {
      const sub = submissions.find(s => s.homeworkId === hw.id && s.studentId === student.id);
      initialMap[student.id] = {
        score: sub?.score !== null && sub?.score !== undefined ? String(sub.score) : '',
        comment: sub?.comment || '',
        status: sub?.status || 'not_submitted'
      };
    });
    setTempScores(initialMap);
  };

  const handleScoreChange = (studentId: string, scoreStr: string) => {
    setTempScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: scoreStr,
        status: scoreStr.trim() !== '' ? 'graded' : prev[studentId].status
      }
    }));
  };

  const handleSubmissionStatusChange = (studentId: string, status: 'not_submitted' | 'submitted' | 'graded') => {
    setTempScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        score: status === 'not_submitted' ? '' : prev[studentId].score
      }
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setTempScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment
      }
    }));
  };

  const handleSaveSubmissions = () => {
    if (!gradingHomework) return;

    const cls = classes.find(c => c.id === gradingHomework.classId);
    const clsStudents = students.filter(s => cls?.studentIds?.includes(s.id));

    const submissionsToSave: HomeworkSubmission[] = clsStudents.map(student => {
      const state = tempScores[student.id] || { score: '', comment: '', status: 'not_submitted' };
      const scoreNum = state.score.trim() !== '' ? Number(state.score) : null;
      
      return {
        id: `${gradingHomework.id}_${student.id}`,
        homeworkId: gradingHomework.id,
        studentId: student.id,
        score: scoreNum,
        status: scoreNum !== null ? 'graded' : state.status,
        comment: state.comment,
        submittedAt: state.status !== 'not_submitted' ? '2026-07-08' : undefined
      };
    });

    onSaveSubmissions(submissionsToSave);
    setGradingHomework(null);
    alert('Lưu bảng chấm điểm bài tập thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">Giao Bài & Chấm Điểm Nhanh</h2>
          <p className="text-xs text-gray-400 mt-0.5">Tạo bài tập về nhà, theo dõi nộp bài và chấm điểm học sinh</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
          id="btn-add-homework"
        >
          <Plus className="w-4 h-4" /> Giao Bài Tập
        </button>
      </div>

      {/* Homework Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homeworks.map((hw) => {
          const cls = classes.find(c => c.id === hw.classId);
          const clsStudents = students.filter(s => cls?.studentIds?.includes(s.id));
          const homeworkSubmissions = submissions.filter(s => s.homeworkId === hw.id);
          
          const submittedCount = homeworkSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
          const gradedCount = homeworkSubmissions.filter(s => s.status === 'graded').length;

          return (
            <motion.div
              key={hw.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              id={`homework-card-${hw.id}`}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Hạn nộp: {new Date(hw.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-base line-clamp-1">{hw.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">Lớp: <span className="font-semibold text-gray-700">{cls?.name || 'Chưa phân lớp'}</span></p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">{hw.description || 'Không có mô tả chi tiết'}</p>
                </div>

                {/* Submissions tracking stats bar */}
                <div className="pt-3 border-t border-gray-50 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Nộp bài: {submittedCount}/{clsStudents.length}</span>
                    <span>Đã chấm: {gradedCount}/{submittedCount}</span>
                  </div>
                  {/* Simple progress bar */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full transition-all" 
                      style={{ width: `${clsStudents.length ? (submittedCount / clsStudents.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenGrading(hw)}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  id={`btn-grade-homework-${hw.id}`}
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Chấm Nhanh
                </button>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(hw)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Sửa đề bài"
                    id={`btn-edit-homework-${hw.id}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa bài tập ${hw.title}?`)) {
                        onDeleteHomework(hw.id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa bài tập"
                    id={`btn-delete-homework-${hw.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {homeworks.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Chưa có bài tập nào được giao</p>
            <p className="text-xs text-gray-400 mt-1">Vui lòng nhấp vào nút "Giao Bài Tập" để giao bài</p>
          </div>
        )}
      </div>

      {/* Add / Edit Homework Modal */}
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
                  {editingHomework ? 'Sửa Đề Bài Tập' : 'Giao Bài Tập Mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitHomework} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Giao cho lớp *</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    id="form-homework-class"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Tiêu đề bài tập *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Viết đoạn văn kể về chuyến du lịch"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    id="form-homework-title"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Yêu cầu / Hướng dẫn</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Các em làm bài tập và chụp ảnh gửi qua zalo..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    id="form-homework-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Hạn nộp bài *</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      id="form-homework-due-date"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Thang điểm tối đa *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={maxScore}
                      onChange={(e) => setMaxScore(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      id="form-homework-max-score"
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
                    id="form-homework-submit"
                  >
                    {editingHomework ? 'Lưu thay đổi' : 'Giao bài'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Grading (Chấm Điểm Nhanh) Modal */}
      <AnimatePresence>
        {gradingHomework && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-indigo-600" /> Chấm Điểm Nhanh
                  </h3>
                  <p className="text-xs text-gray-400">Đề bài: {gradingHomework.title} • Lớp: {classes.find(c => c.id === gradingHomework.classId)?.name}</p>
                </div>
                <button
                  onClick={() => setGradingHomework(null)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grading Form Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Chỉnh trạng thái nộp bài của học sinh và nhập điểm trực tiếp. Đánh dấu "Đã chấm" để lưu kết quả. Thang điểm: 0 - {gradingHomework.maxScore}.</span>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
                        <th className="p-3">Học sinh</th>
                        <th className="p-3 text-center">Trạng thái nộp</th>
                        <th className="p-3">Điểm số</th>
                        <th className="p-3">Nhận xét của giáo viên</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium">
                      {students
                        .filter(s => classes.find(c => c.id === gradingHomework.classId)?.studentIds?.includes(s.id))
                        .map(student => {
                          const state = tempScores[student.id] || { score: '', comment: '', status: 'not_submitted' };
                          return (
                            <tr key={student.id} className="hover:bg-gray-50/40">
                              <td className="p-3">
                                <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                                <p className="text-[10px] text-gray-400">Nhóm: {student.group}</p>
                              </td>
                              <td className="p-3">
                                <div className="flex justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSubmissionStatusChange(student.id, 'not_submitted')}
                                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                                      state.status === 'not_submitted'
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                                  >
                                    Chưa nộp
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSubmissionStatusChange(student.id, 'submitted')}
                                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                                      state.status === 'submitted'
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                                  >
                                    Đã nộp
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSubmissionStatusChange(student.id, 'graded')}
                                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                                      state.status === 'graded'
                                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                                  >
                                    Đã chấm
                                  </button>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max={gradingHomework.maxScore}
                                    placeholder="Điểm"
                                    value={state.score}
                                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                    className="w-16 px-2 py-1 text-center bg-gray-50 border border-gray-200 rounded font-bold text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    id={`grade-score-${student.id}`}
                                  />
                                  <span className="text-gray-400 font-bold">/ {gradingHomework.maxScore}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  placeholder="Nhập lời phê..."
                                  value={state.comment}
                                  onChange={(e) => handleCommentChange(student.id, e.target.value)}
                                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  id={`grade-comment-${student.id}`}
                                />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grading Form Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGradingHomework(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSubmissions}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
                  id="btn-save-grades"
                >
                  Lưu Kết Quả
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
