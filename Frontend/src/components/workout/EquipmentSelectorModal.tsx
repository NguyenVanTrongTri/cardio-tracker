import { X, CheckCircle2, Flame, Bike, Waves, Footprints, Compass, ChevronRight } from 'lucide-react';
import { EquipmentType } from '../../types';
import { EQUIPMENT_LIST, EquipmentDef } from './equipmentData';

interface EquipmentSelectorModalProps {
  isOpen: boolean;
  currentType: EquipmentType;
  onSelect: (type: EquipmentType) => void;
  onClose: () => void;
}

export default function EquipmentSelectorModal({
  isOpen,
  currentType,
  onSelect,
  onClose,
}: EquipmentSelectorModalProps) {
  if (!isOpen) return null;

  const enabledMap = JSON.parse(localStorage.getItem('practices-enabled-status') || '{}');
  const filteredEquipment = EQUIPMENT_LIST.filter((item) => enabledMap[item.id] !== false);

  const getIcon = (type: EquipmentType) => {
    switch (type) {
      case 'TREADMILL':
        return <Flame size={20} className="text-emerald-500" />;
      case 'STATIONARY_BIKE':
        return <Bike size={20} className="text-blue-500" />;
      case 'ROWING_MACHINE':
        return <Waves size={20} className="text-cyan-500" />;
      case 'STAIR_CLIMBER':
        return <Footprints size={20} className="text-amber-500" />;
      case 'OUTDOOR_RUN':
        return <Compass size={20} className="text-purple-500" />;
      default:
        return <Flame size={20} className="text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-100 relative my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Chọn Hình Thức Tập Luyện</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tùy chỉnh thông số giai đoạn tập theo từng loại máy cardio
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Equipment Cards List */}
        <div className="overflow-y-auto space-y-2.5 py-3 pr-1 flex-1">
          {filteredEquipment.map((item: EquipmentDef) => {
          const isSelected = item.id === currentType;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getIcon(item.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {item.shortName}
                        </h3>
                        {isSelected && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className={isSelected ? 'text-emerald-600' : 'text-slate-300'}
                  />
                </div>

                <p className="text-xs text-slate-600 leading-snug pl-11">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-11 pt-1 font-mono">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                    {item.param1.label} ({item.param1.unit})
                  </span>
                  <span>•</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                    {item.param2.label} ({item.param2.unit})
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Khi chuyển hình thức tập, các trường thông số của 3 giai đoạn sẽ tự động cập nhật tương ứng.
        </div>
      </div>
    </div>
  );
}
