import React from 'react';
import { WorkoutRecord } from '../../../types';

interface DraftRestoreModalProps {
  draft: WorkoutRecord;
  onRestore: () => void;
  onDiscard: () => void;
}

const DraftRestoreModal: React.FC<DraftRestoreModalProps> = ({ draft, onRestore, onDiscard }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Tìm thấy bản nháp!</h3>
        <p className="text-sm text-slate-600 mb-6">
          Bạn có một buổi tập chưa hoàn thành từ ngày {draft.workoutStartTime.split('T')[0]}. Bạn có muốn khôi phục lại không?
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onDiscard}
            className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl"
          >
            Bỏ qua
          </button>
          <button 
            onClick={onRestore}
            className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl"
          >
            Khôi phục
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftRestoreModal;
