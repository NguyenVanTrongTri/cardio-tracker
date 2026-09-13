import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { EquipmentDef } from '../components/workout/equipmentData';

interface AdminPracticeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPractice: EquipmentDef) => void;
}

// Hàm khởi tạo Dữ liệu mặc định
const createInitialFormData = (): EquipmentDef => ({
  id: `practice-${Date.now()}` as any,
  name: '',
  shortName: '',
  tag: '',
  description: '',
  badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  bgLight: 'from-emerald-500/10 to-teal-500/5',
  enabled: true,
  defaultPhases: {
    phase1: { phaseNumber: 1, name: 'Warm-up', durationMinutes: 5, inclineDegree: 0, speedKmh: 4 },
    phase2: { phaseNumber: 2, name: 'Fat Burn', durationMinutes: 30, inclineDegree: 5, speedKmh: 5, isCoreEngaged: true },
    phase3: { phaseNumber: 3, name: 'Cool-down', durationMinutes: 5, inclineDegree: 0, speedKmh: 3 },
  },
  param1: { label: 'Độ dốc', unit: '°', min: 0, max: 15, step: '0.5', key: 'inclineDegree', description: '' },
  param2: { label: 'Tốc độ', unit: 'km/h', min: 0, max: 20, step: '0.1', key: 'speedKmh', description: '' },
  coreFocus: { label: 'Siết Cơ Bụng', description: 'Kích hoạt cơ bụng sâu, bảo vệ cột sống...' },
  zone2Criteria: 'Zone 2',
});

export default function AdminPracticeCreateModal({ isOpen, onClose, onSave }: AdminPracticeCreateModalProps) {
  const [formData, setFormData] = useState<EquipmentDef>(createInitialFormData);

  // FIX LỖI 1 & 2: Reset Form và tạo ID mới tinh mỗi lần mở Modal
  useEffect(() => {
    if (isOpen) {
      setFormData(createInitialFormData());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof EquipmentDef, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleParamChange = (paramKey: 'param1' | 'param2', subKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [paramKey]: {
        ...prev[paramKey],
        [subKey]: value
      }
    }));
  };

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

  const handleCoreFocusChange = (subKey: 'label' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      coreFocus: {
        ...prev.coreFocus,
        [subKey]: value
      }
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên bài tập!');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-900">Thêm Bài Tập Mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Thông tin định danh */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-emerald-800 border-b pb-2">1. Thông Tin Định Danh</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Tên hiển thị (*)</label>
                <input type="text" value={formData.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Ví dụ: Máy Chạy Bộ" className="w-full p-3 border rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Tên ngắn</label>
                <input type="text" value={formData.shortName} onChange={e => handleFieldChange('shortName', e.target.value)} placeholder="Ví dụ: Chạy bộ" className="w-full p-3 border rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Thẻ gợi ý (Tag)</label>
              <input type="text" value={formData.tag} onChange={e => handleFieldChange('tag', e.target.value)} placeholder="Ví dụ: Tối ưu Zone 2" className="w-full p-3 border rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Mô tả thiết bị</label>
              <textarea value={formData.description} onChange={e => handleFieldChange('description', e.target.value)} className="w-full p-3 border rounded-xl" rows={2} />
            </div>
          </section>

          {/* Section 2: Cấu hình 3 giai đoạn */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-emerald-800 border-b pb-2">2. Cấu Hình 3 Giai Đoạn</h3>
            {(['phase1', 'phase2', 'phase3'] as const).map(pKey => (
              <div key={pKey} className={`p-4 rounded-2xl space-y-3 ${pKey === 'phase2' ? 'bg-emerald-50/50 border border-emerald-100' : 'bg-slate-50'}`}>
                <h4 className="font-semibold text-slate-800">
                  Giai đoạn {pKey.slice(-1)}: {formData.defaultPhases?.[pKey]?.name}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 whitespace-nowrap block truncate">Thời gian (p)</label>
                    <input type="number" value={formData.defaultPhases?.[pKey]?.durationMinutes || 0} onChange={e => handlePhaseChange(pKey, 'durationMinutes', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 whitespace-nowrap block truncate">Độ dốc (°)</label>
                    <input type="number" value={formData.defaultPhases?.[pKey]?.inclineDegree || 0} onChange={e => handlePhaseChange(pKey, 'inclineDegree', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 whitespace-nowrap block truncate">Tốc độ (km/h)</label>
                    <input type="number" step="0.1" value={formData.defaultPhases?.[pKey]?.speedKmh || 0} onChange={e => handlePhaseChange(pKey, 'speedKmh', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white" />
                  </div>
                </div>

                {/* FIX LỖI 3: Render Checkbox Siết cơ bụng cho Phase 2 */}
                {pKey === 'phase2' && (
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="createIsCoreEngaged" 
                      checked={!!formData.defaultPhases?.phase2?.isCoreEngaged} 
                      onChange={e => handlePhaseChange('phase2', 'isCoreEngaged', e.target.checked)} 
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="createIsCoreEngaged" className="text-sm font-medium text-slate-700">Mặc định bật Siết Cơ Bụng (Core Engagement)</label>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* FIX LỖI 4: Bổ sung Section 3 & 4 */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-emerald-800 border-b pb-2">3. Giới Hạn Biến Số</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 p-3 border rounded-2xl">
                <label className="text-xs font-semibold text-slate-700">Param 1 (Độ dốc)</label>
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
                    <input type="text" value={formData.param1?.step || '0.5'} onChange={e => handleParamChange('param1', 'step', e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 border rounded-2xl">
                <label className="text-xs font-semibold text-slate-700">Param 2 (Tốc độ)</label>
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
                    <input type="text" value={formData.param2?.step || '0.1'} onChange={e => handleParamChange('param2', 'step', e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </section>

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
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button onClick={onClose} className="px-6 py-2 rounded-xl bg-slate-100 font-bold hover:bg-slate-200 transition-colors">Hủy</button>
            <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors">
              <Save size={18} /> Thêm mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}