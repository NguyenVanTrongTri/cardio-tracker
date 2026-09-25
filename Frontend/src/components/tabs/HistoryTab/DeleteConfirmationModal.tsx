import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  onClose, 
  onConfirm, 
  isDeleting 
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 size={20} />
        </div>
        <h3 className="text-base font-bold text-slate-900 text-center">
          Xác nhận xóa buổi tập?
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed text-center">
          Thao tác này sẽ xóa vĩnh viễn buổi tập khỏi lịch sử và cập nhật lại biểu đồ thống kê.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex-1 py-2.5 ${isDeleting ? 'bg-rose-400' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-xl font-bold text-xs transition-colors shadow-xs`}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};
