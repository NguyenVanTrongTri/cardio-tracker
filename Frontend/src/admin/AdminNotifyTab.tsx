import { useState, useMemo } from 'react';
import { Bell, Send, Search, Trash2, Edit2, Save, X } from 'lucide-react';

interface AdminNotifyTabProps {
  adminEmail: string;
  onRefreshStats: () => void;
  onAddNotification: (title: string, message: string) => void;
}

interface SentNotification {
  id: number;
  title: string;
  message: string;
  date: string;
}

export default function AdminNotifyTab({ adminEmail, onRefreshStats, onAddNotification }: AdminNotifyTabProps) {
  const [title, setTitle] = useState("Thông báo từ Quản trị viên!");
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([
    { id: 1, title: 'Thông báo tập luyện', message: 'Hôm nay hãy tập Cardio!', date: '2026-09-09' }
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');

  const handleSendNotification = () => {
    onAddNotification(title, message);
    setSentNotifications([
      { id: Date.now(), title, message, date: new Date().toISOString().split('T')[0] },
      ...sentNotifications
    ]);
    alert('Thông báo đã được gửi thành công!');
    setTitle('');
    setMessage('');
  };

  const deleteNotification = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
      setSentNotifications(sentNotifications.filter(n => n.id !== id));
    }
  };

  const startEdit = (n: SentNotification) => {
    setEditingId(n.id);
    setEditTitle(n.title);
    setEditMessage(n.message);
  };

  const saveEdit = (id: number) => {
    setSentNotifications(sentNotifications.map(n => n.id === id ? { ...n, title: editTitle, message: editMessage } : n));
    setEditingId(null);
  };

  const filteredNotifications = useMemo(() => {
    return sentNotifications.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sentNotifications, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Gửi Thông Báo Toàn Hệ Thống</h2>
            <p className="text-xs text-slate-500">Soạn thảo và gửi thông báo đến tất cả người dùng.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tiêu đề thông báo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Nhập tiêu đề hấp dẫn..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nội dung thông báo</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              rows={4}
              placeholder="Nhập nội dung chi tiết..."
            />
          </div>
          <button
            onClick={handleSendNotification}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-md active:scale-[0.99] transition-all cursor-pointer"
          >
            <Send size={18} />
            Gửi Thông Báo
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-slate-900">Lịch sử thông báo ({filteredNotifications.length})</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none w-48"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotifications.map(n => (
            <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
              {editingId === n.id ? (
                <div className="flex-1 space-y-2">
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full p-2 rounded-lg border text-sm" />
                  <textarea value={editMessage} onChange={e => setEditMessage(e.target.value)} className="w-full p-2 rounded-lg border text-sm" />
                </div>
              ) : (
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">{n.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">{n.date}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                {editingId === n.id ? (
                  <>
                    <button onClick={() => saveEdit(n.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save size={18}/></button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(n)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={18}/></button>
                    <button onClick={() => deleteNotification(n.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={18}/></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
