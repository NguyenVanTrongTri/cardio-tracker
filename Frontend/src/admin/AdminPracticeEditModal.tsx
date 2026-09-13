import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { EquipmentDef } from '../components/workout/equipmentData';

interface AdminPracticeEditModalProps {
  practice: EquipmentDef;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: EquipmentDef) => void;
}

export default function AdminPracticeEditModal({ practice, isOpen, onClose, onSave }: AdminPracticeEditModalProps) {
  const [formData, setFormData] = useState<EquipmentDef>(practice);

  // Đồng bộ formData khi props practice thay đổi
  useEffect(() => {
    setFormData(practice);
  }, [practice, isOpen]);

  if (!isOpen) return null;

  // Cập nhật trường dữ liệu thường (chuỗi, số)
  const handleFieldChange = (field: keyof EquipmentDef, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Cập nhật Param (param1, param2)
  const handleParamChange = (paramKey: 'param1' | 'param2', subKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [paramKey]: {
        ...prev[paramKey],
        [subKey]: value
      }
    }));
  };

  // Cập nhật Phase (defaultPhases.phase1 / phase2 / phase3)
  const handlePhaseChange = (phaseKey: 'phase1' | 'phase2' | 'phase3', subKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      defaultPhases: {
        ...prev.defaultPhases,
        [phaseKey]: {
          ...prev.defaultPhases[phaseKey],
          [subKey]: value
        }
      }
    }));
  };

  // Cập nhật Core Focus
  const handleCoreFocusChange = (subKey: 'label' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      coreFocus: {
        ...prev.coreFocus,
        [subKey]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-900">Cấu hình: {formData.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: General Info */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-emerald-800 border-b pb-2">1. Thông Tin Định Danh & Mô Tả</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Tên hiển thị</label>
                <input type="text" value={formData.name || ''} onChange={e => handleFieldChange('name', e.target.value)} className="w-full p-3 border rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Tên ngắn</label>
                <input type="text" value={formData.shortName || ''} onChange={e => handleFieldChange('shortName', e.target.value)} className="w-full p-3 border rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Thẻ gợi ý (Tag)</label>
              <input type="text" value={formData.tag || ''} onChange={e => handleFieldChange('tag', e.target.value)} className="w-full p-3 border rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Mô tả thiết bị</label>
              <textarea value={formData.description || ''} onChange={e => handleFieldChange('description', e.target.value)} className="w-full p-3 border rounded-xl" rows={2} />
            </div>
          </section>

          {/* Section 2: Default Phases */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-emerald-800 border-b pb-2">2. Cấu Hình 3 Giai Đoạn Mặc Định</h3>
            
            {/* Phase 1 */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
              <h4 className="font-semibold text-slate-800">Giai đoạn 1: Warm-up (Khởi động)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Thời gian (p)</label>
                  <input type="number" value={formData.defaultPhases?.phase1?.durationMinutes || 0} onChange={e => handlePhaseChange('phase1', 'durationMinutes', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Độ dốc (°)</label>
                  <input type="number" value={formData.defaultPhases?.phase1?.inclineDegree || 0} onChange={e => handlePhaseChange('phase1', 'inclineDegree', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Tốc độ (km/h)</label>
                  <input type="number" step="0.1" value={formData.defaultPhases?.phase1?.speedKmh || 0} onChange={e => handlePhaseChange('phase1', 'speedKmh', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
              <h4 className="font-semibold text-emerald-900">Giai đoạn 2: Fat Burn (Đốt Mỡ - Trọng tâm Zone 2)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Thời gian (p)</label>
                  <input type="number" value={formData.defaultPhases?.phase2?.durationMinutes || 0} onChange={e => handlePhaseChange('phase2', 'durationMinutes', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Độ dốc (°)</label>
                  <input type="number" value={formData.defaultPhases?.phase2?.inclineDegree || 0} onChange={e => handlePhaseChange('phase2', 'inclineDegree', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Tốc độ (km/h)</label>
                  <input type="number" step="0.1" value={formData.defaultPhases?.phase2?.speedKmh || 0} onChange={e => handlePhaseChange('phase2', 'speedKmh', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isCoreEngaged" 
                  checked={!!formData.defaultPhases?.phase2?.isCoreEngaged} 
                  onChange={e => handlePhaseChange('phase2', 'isCoreEngaged', e.target.checked)} 
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="isCoreEngaged" className="text-sm font-medium text-slate-700">Mặc định bật Siết Cơ Bụng (Core Engagement)</label>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
              <h4 className="font-semibold text-slate-800">Giai đoạn 3: Cool-down (Hạ nhiệt)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Thời gian (p)</label>
                  <input type="number" value={formData.defaultPhases?.phase3?.durationMinutes || 0} onChange={e => handlePhaseChange('phase3', 'durationMinutes', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Độ dốc (°)</label>
                  <input type="number" value={formData.defaultPhases?.phase3?.inclineDegree || 0} onChange={e => handlePhaseChange('phase3', 'inclineDegree', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Tốc độ (km/h)</label>
                  <input type="number" step="0.1" value={formData.defaultPhases?.phase3?.speedKmh || 0} onChange={e => handlePhaseChange('phase3', 'speedKmh', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Boundaries */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-emerald-800 border-b pb-2">3. Giới Hạn & Bước Nhảy Biến Số</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 p-3 border rounded-2xl">
                <label className="text-xs font-semibold text-slate-700">{formData.param1?.label || 'Param 1'} (Độ dốc)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Min</span>
                    <input type="number" value={formData.param1?.min ?? 0} onChange={e => handleParamChange('param1', 'min', Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Max</span>
                    <input type="number" value={formData.param1?.max ?? 0} onChange={e => handleParamChange('param1', 'max', Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Step</span>
                    <input type="text" value={formData.param1?.step || '1'} onChange={e => handleParamChange('param1', 'step', e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 border rounded-2xl">
                <label className="text-xs font-semibold text-slate-700">{formData.param2?.label || 'Param 2'} (Tốc độ)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Min</span>
                    <input type="number" value={formData.param2?.min ?? 0} onChange={e => handleParamChange('param2', 'min', Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Max</span>
                    <input type="number" value={formData.param2?.max ?? 0} onChange={e => handleParamChange('param2', 'max', Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Step</span>
                    <input type="text" value={formData.param2?.step || '1'} onChange={e => handleParamChange('param2', 'step', e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Hints & Core Focus */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-emerald-800 border-b pb-2">4. Khuyến Cáo & Tiêu Chí</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Tiêu đề Core Focus</label>
                <input type="text" value={formData.coreFocus?.label || ''} onChange={e => handleCoreFocusChange('label', e.target.value)} className="w-full p-3 border rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Mô tả Core Focus</label>
                <textarea value={formData.coreFocus?.description || ''} onChange={e => handleCoreFocusChange('description', e.target.value)} className="w-full p-3 border rounded-xl" rows={2} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Tiêu chuẩn Zone 2 (Zone 2 Criteria)</label>
                <input type="text" value={formData.zone2Criteria || ''} onChange={e => handleFieldChange('zone2Criteria', e.target.value)} className="w-full p-3 border rounded-xl" />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button onClick={onClose} className="px-6 py-2 rounded-xl bg-slate-100 font-bold hover:bg-slate-200 transition-colors">Hủy</button>
            <button onClick={() => onSave(formData)} className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors">
              <Save size={18} /> Lưu cấu hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}