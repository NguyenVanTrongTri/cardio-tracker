import { useState, useEffect, useMemo } from 'react';
import {
  Bike,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { EquipmentDef } from '../components/workout/equipmentData';
import { logAdminAction } from './adminService';
import AdminPracticeEditModal from './AdminPracticeEditModal';
import AdminPracticeCreateModal from './AdminPracticeCreateModal';
import { API_ENDPOINTS } from '../services/apiConfig';
interface AdminPracticeTabProps {
  adminEmail: string;
  onRefreshStats: () => void;
}

const API_BASE_URL = API_ENDPOINTS.PRACTICES;

export default function AdminPracticeTab({ adminEmail, onRefreshStats }: AdminPracticeTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [practices, setPractices] = useState<EquipmentDef[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingPractice, setEditingPractice] = useState<EquipmentDef | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [practiceToDelete, setPracticeToDelete] = useState<EquipmentDef | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };
  const handleDeletePractice = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include', // 👈 Bắt buộc phải có để gửi HttpOnly Cookie lên server
      });
      const data = await res.json();

      if (data.success) {
        setPractices(prev => prev.filter(p => p.id !== id));
        setPracticeToDelete(null);
        showToast('Đã xóa bài tập thành công!');
        onRefreshStats();
      } else {
        showToast(data.message || 'Xóa bài tập thất bại!', 'error');
      }
    } catch (error) {
      console.error('Error deleting practice:', error);
      showToast('Lỗi kết nối khi xóa bài tập!', 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  // 1. Lấy danh sách bài tập động từ Backend (Domain đầy đủ)
  const fetchPractices = async () => {
  try {
    setLoading(true);
    const res = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 🍪 BẮT BUỘC: Thêm dòng này để trình duyệt tự đính kèm HttpOnly Cookie lên Backend
      credentials: 'include', 
    });
    
    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { success: false, error: rawText };
    }
    
    if (data.success) {
      const formatted = data.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        shortName: item.shortName || item.short_name,
        tag: item.tag,
        badgeColor: item.badgeColor || item.badge_color,
        bgLight: item.bgLight || item.bg_light,
        description: item.description,
        enabled: item.enabled,
        ...(item.configJson || item.config_json || {})
      }));
      setPractices(formatted);
      // Lưu ý: Nếu không muốn mỗi lần load danh sách bài tập đều hiện toast thông báo thành công thì có thể bỏ dòng showToast bên dưới đi cho đỡ phiền người dùng
      // showToast('Thành công!', 'success');
    } else {
      showToast('Không thể tải danh sách bài tập từ server!', 'error');
    }
  } catch (error) {
    console.error('Error fetching practices:', error);
    showToast('Lỗi kết nối đến server khi tải bài tập!', 'error');
  } finally {
    setLoading(false);
  }
  };
  useEffect(() => {
    fetchPractices();
  }, []);

  const filteredPractices = useMemo(() => {
    // Nếu không có từ khóa, trả về toàn bộ danh sách để đảm bảo hiển thị đúng
    if (!searchTerm || searchTerm.trim() === '') {
      return practices;
    }

    return practices.filter(p => {
      const label = p.name || '';
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [practices, searchTerm]);

  // 2. Bật / Tắt trạng thái bài tập gọi API PUT (Domain đầy đủ)
  const togglePractice = async (id: string) => {
  const practice = practices.find(p => p.id === id);
  if (!practice) return;

  const nextEnabledStatus = !practice.enabled;
  
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
        },
        credentials: 'include', // 👈 Dùng HttpOnly Cookie thay vì Authorization Header cũ
        body: JSON.stringify({ enabled: nextEnabledStatus })
      });
      
      const data = await res.json();

      if (data.success) {
        setPractices(prev => 
          prev.map(p => p.id === id ? { ...p, enabled: nextEnabledStatus } : p)
        );
        logAdminAction(adminEmail, 'Cập nhật trạng thái bài tập', `Đã ${nextEnabledStatus ? 'bật' : 'tắt'} bài tập: ${id}`, 'INFO');
        showToast('Cập nhật trạng thái thành công!');
        onRefreshStats();
      } else {
        showToast(data.message || 'Cập nhật thất bại!', 'error');
      }
    } catch (error) {
      console.error('Error toggling practice:', error);
      showToast('Lỗi kết nối khi cập nhật trạng thái!', 'error');
    }
  };

  // 3. Lưu cấu hình chỉnh sửa bài tập gọi API PUT (Domain đầy đủ)
  const handleSavePractice = async (updated: EquipmentDef) => {
    try {
      const { id, name, shortName, tag, badgeColor, bgLight, description, enabled, ...configRest } = updated;

      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          name,
          shortName,
          tag,
          badgeColor,
          bgLight,
          description,
          enabled,
          configJson: configRest
        })
      });
      const data = await res.json();

      if (data.success) {
        setPractices(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditingPractice(null);
        showToast('Đã lưu cấu hình bài tập lên database!');
        fetchPractices();
      } else {
        showToast(data.message || 'Lưu cấu hình thất bại!', 'error');
      }
    } catch (error) {
      console.error('Error saving practice:', error);
      showToast('Lỗi server khi lưu cấu hình!', 'error');
    }
  };

  // 4. Thêm bài tập mới gọi API POST (Domain đầy đủ)
  const handleCreatePractice = async (newPractice: EquipmentDef) => {
  try {
    const { id, name, shortName, tag, badgeColor, bgLight, description, enabled, ...configRest } = newPractice;

    // Validate nhanh ở phía client để báo lỗi trực quan cho user
    if (!id || !name || !shortName) {
      showToast('Vui lòng điền đầy đủ ID, Tên và Tên viết tắt!', 'error');
      return;
    }

    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // 👈 Bắt buộc phải có để gửi kèm HttpOnly Cookie lên server
      body: JSON.stringify({
        id,
        name,
        shortName, // Đảm bảo đúng định dạng chuẩn BE yêu cầu
        tag,
        badgeColor,
        bgLight,
        description,
        enabled: enabled ?? true,
        configJson: configRest
      })
    });

    const data = await res.json();

    if (data.success) {
      setIsCreateModalOpen(false);
      showToast('Đã thêm bài tập mới thành công!');
      fetchPractices();
      onRefreshStats();
    } else {
      showToast(data.message || 'Thêm bài tập thất bại!', 'error');
    }
  } catch (error) {
    console.error('Error creating practice:', error);
    showToast('Lỗi kết nối khi thêm mới bài tập!', 'error');
  }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Quản Lý Bài Tập / Thiết Bị (Database)</h2>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-colors">
          <Plus size={16} /> Thêm Bài Tập Mới
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm bài tập..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Đang tải...!</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên Bài Tập</th>
                <th className="px-6 py-4 font-semibold">Mã ID</th>
                <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                <th className="px-6 py-4 font-semibold">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPractices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">Không tìm thấy bài tập nào.</td>
                </tr>
              ) : (
                filteredPractices.map((practice) => (
                  <tr key={practice.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{practice.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{practice.id}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePractice(practice.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          practice.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {practice.enabled ? <Power size={12} /> : <PowerOff size={12} />}
                        {practice.enabled ? 'Đang bật' : 'Đang tắt'}
                      </button>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => setEditingPractice(practice)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Chỉnh sửa"><Edit2 size={16} /></button>
                      <button onClick={() => setPracticeToDelete(practice)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Xóa"><Trash2 size={16} /></button>  
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {practiceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa</h3>
            <p className="text-sm text-slate-600">Bạn có chắc chắn muốn xóa bài tập <span className="font-bold">{practiceToDelete.name}</span>? Thao tác này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setPracticeToDelete(null)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold hover:bg-slate-200 transition-colors">Hủy</button>
              <button 
                onClick={() => handleDeletePractice(practiceToDelete.id)} 
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {editingPractice && (
        <AdminPracticeEditModal 
          practice={editingPractice} 
          isOpen={!!editingPractice}
          onClose={() => setEditingPractice(null)}
          handleSavePractice={handleSavePractice}
        />
      )}
      
      {isCreateModalOpen && (
        <AdminPracticeCreateModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreatePractice}
        />
      )}

      {feedback && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-bottom-5 z-50 ${feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {feedback.text}
        </div>
      )}
    </div>
  );
}