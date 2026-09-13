import { useState, useMemo } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { EQUIPMENT_LIST, EquipmentDef } from '../components/workout/equipmentData';
import { logAdminAction } from './adminService';
import AdminPracticeEditModal from './AdminPracticeEditModal';
import AdminPracticeCreateModal from './AdminPracticeCreateModal';

interface AdminPracticeTabProps {
  adminEmail: string;
  onRefreshStats: () => void;
}

export default function AdminPracticeTab({ adminEmail, onRefreshStats }: AdminPracticeTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [practices, setPractices] = useState<EquipmentDef[]>(() => {
    const saved = localStorage.getItem('practices-enabled-status');
    const enabledMap = saved ? JSON.parse(saved) : {};
    return EQUIPMENT_LIST.map(p => ({
      ...p,
      enabled: enabledMap[p.id] ?? (p.enabled ?? true) // Default to true if not set
    }));
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingPractice, setEditingPractice] = useState<EquipmentDef | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const filteredPractices = useMemo(() => {
    return practices.filter(p => {
      const label = p.name || '';
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [practices, searchTerm]);

  const togglePractice = (id: string) => {
    setPractices(prev => {
      const updated = prev.map(p => 
        p.id === id ? { ...p, enabled: !p.enabled } : p
      );
      // Persist enabled status
      const enabledMap = updated.reduce((acc, p) => ({ ...acc, [p.id]: p.enabled }), {});
      localStorage.setItem('practices-enabled-status', JSON.stringify(enabledMap));
      return updated;
    });
    
    // Log and refresh
    const practice = practices.find(p => p.id === id);
    logAdminAction(adminEmail, 'Cập nhật trạng thái bài tập', `Đã ${practice?.enabled ? 'tắt' : 'bật'} bài tập: ${id}`, 'INFO');
    showToast('Cập nhật trạng thái thành công!');
    onRefreshStats();
  };

  const handleSavePractice = (updated: EquipmentDef) => {
    setPractices(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingPractice(null);
    showToast('Đã lưu cấu hình bài tập!');
  };

  const handleCreatePractice = (newPractice: EquipmentDef) => {
    setPractices(prev => [...prev, newPractice]);
    setIsCreateModalOpen(false);
    
    // Also enable it in localStorage
    const saved = localStorage.getItem('practices-enabled-status');
    const enabledMap = saved ? JSON.parse(saved) : {};
    enabledMap[newPractice.id] = true;
    localStorage.setItem('practices-enabled-status', JSON.stringify(enabledMap));
    
    showToast('Đã thêm bài tập mới!');
    onRefreshStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Quản Lý Bài Tập / Thiết Bị</h2>
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
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Tên Bài Tập</th>
              <th className="px-6 py-4 font-semibold">Trạng Thái</th>
              <th className="px-6 py-4 font-semibold">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPractices.map((practice) => (
              <tr key={practice.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{practice.name}</td>
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
                  <button onClick={() => setEditingPractice(practice)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><Edit2 size={16} /></button>
                  <button className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {editingPractice && (
        <AdminPracticeEditModal 
          practice={editingPractice} 
          isOpen={!!editingPractice}
          onClose={() => setEditingPractice(null)}
          onSave={handleSavePractice}
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
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-bottom-5 ${feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {feedback.text}
        </div>
      )}
    </div>
  );
}
