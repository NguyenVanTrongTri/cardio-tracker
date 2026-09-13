import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import {
  Settings,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  UserCheck
} from 'lucide-react';
import { UserAccount } from '../types';
import {
  exportSystemDataAsJSON,
  importSystemDataFromJSON,
  getSystemAuditLogs,
  logAdminAction
} from './adminService';
import { SystemAuditLog } from './types';

interface AdminSettingsTabProps {
  currentUser: UserAccount;
  onRefreshStats: () => void;
}

export default function AdminSettingsTab({ currentUser, onRefreshStats }: AdminSettingsTabProps) {
  const [logs, setLogs] = useState<SystemAuditLog[]>(getSystemAuditLogs());
  const [storageUsedKb, setStorageUsedKb] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const calculateStorage = () => {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalBytes += key.length + (localStorage.getItem(key)?.length || 0);
      }
    }
    setStorageUsedKb(Math.round((totalBytes * 2) / 1024)); // utf-16 approx 2 bytes
  };

  useEffect(() => {
    calculateStorage();
    setLogs(getSystemAuditLogs());
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportSystemDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cardio_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logAdminAction(currentUser.email, 'Xuất sao lưu hệ thống', 'Tải tệp JSON chứa toàn bộ dữ liệu hệ thống', 'INFO');
    showToast('Đã tải tệp sao lưu JSON thành công!');
    setLogs(getSystemAuditLogs());
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importSystemDataFromJSON(content);
      if (res.success) {
        logAdminAction(currentUser.email, 'Phục hồi dữ liệu', `Phục hồi dữ liệu từ tệp ${file.name}`, 'SUCCESS');
        showToast('Phục hồi dữ liệu thành công! Đang tải lại...');
        calculateStorage();
        setLogs(getSystemAuditLogs());
        onRefreshStats();
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        showToast(res.error || 'Lỗi khi nhập tệp', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAuditLogs = () => {
    const confirm = window.confirm('Xóa sạch nhật ký hoạt động hệ thống?');
    if (!confirm) return;

    localStorage.removeItem('cardio_admin_audit_logs_v1');
    setLogs([]);
    showToast('Đã dọn sạch nhật ký kiểm toán.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border animate-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* System Health & Storage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <HardDrive size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Dung Lượng Sử Dụng</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              ~{storageUsedKb} <span className="text-sm font-semibold text-slate-400">KB</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Định dạng LocalStorage Client-Side tốc độ cao
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Phiên Quản Trị Hiện Tại</span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {currentUser.fullName}
            </div>
            <p className="text-[11px] text-emerald-600 font-mono mt-0.5 font-bold">
              {currentUser.email} • ADMIN
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Trạng Thái Hệ Thống</span>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sẵn sàng & Hoạt động bình thường</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Zone 2 Engine v2.4 • ACSM Calo Metric
            </p>
          </div>
        </div>
      </div>

      {/* Backup and Restore Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sao Lưu & Phục Hồi Dữ Liệu Toàn Hệ Thống</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Xuất file JSON chứa tài khoản người dùng, tất cả buổi tập, chỉ số đo lường và danh mục thực phẩm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Download size={15} />
            <span>Tải File Sao Lưu (.JSON)</span>
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Upload size={15} />
            <span>Phục Hồi Dữ Liệu Từ File</span>
          </button>
        </div>
      </div>

      {/* Audit Log Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Nhật Ký Hoạt Động Của Quản Trị Viên (Audit Trail)</h3>
          </div>
          {logs.length > 0 && (
            <button
              onClick={handleClearAuditLogs}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
            >
              Xóa lịch sử
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Chưa có nhật ký hoạt động nào được ghi lại.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-xs">
                <div className="mt-0.5">
                  {log.level === 'SUCCESS' && <CheckCircle2 size={15} className="text-emerald-500" />}
                  {log.level === 'WARNING' && <AlertTriangle size={15} className="text-amber-500" />}
                  {log.level === 'INFO' && <Info size={15} className="text-blue-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    Thực hiện bởi: {log.adminEmail}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
