import { useState, useMemo, type FormEvent } from 'react';
import {
  Apple,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  FoodItem,
  getStoredFoodDatabase,
  addFoodItemToDatabase,
  deleteFoodItemFromDatabase,
  updateFoodItemInDatabase,
  INITIAL_FOOD_DATABASE,
  saveStoredFoodDatabase
} from '../data/foodData';
import { logAdminAction } from './adminService';

interface AdminFoodTabProps {
  adminEmail: string;
  onRefreshStats: () => void;
}

export default function AdminFoodTab({ adminEmail, onRefreshStats }: AdminFoodTabProps) {
  const [foods, setFoods] = useState<FoodItem[]>(getStoredFoodDatabase());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');

  const categories = useMemo(() => {
    const cats = new Set(foods.map((f) => f.category || 'Khác'));
    return ['Tất cả', ...Array.from(cats)];
  }, [foods]);

  // Add form state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCals, setNewCals] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState('Tinh bột');

  // Edit inline state
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editCals, setEditCals] = useState<number>(0);
  const [editCategory, setEditCategory] = useState<string>('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const refreshList = () => {
    setFoods(getStoredFoodDatabase());
    onRefreshStats();
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        categoryFilter === 'Tất cả' || (f.category || 'Khác') === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [foods, searchTerm, categoryFilter]);

  const handleAddFood = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newCals === '') return;

    try {
      addFoodItemToDatabase({
        name: newName.trim(),
        caloriesPer100g: Number(newCals),
        category: newCategory,
      });
      logAdminAction(adminEmail, 'Thêm món ăn mới', `Thêm món ${newName.trim()} (${newCals} kcal/100g)`, 'SUCCESS');
      showToast(`Đã thêm món "${newName.trim()}" vào cơ sở dữ liệu!`);
      setNewName('');
      setNewCals('');
      setIsAdding(false);
      refreshList();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi thêm thực phẩm', 'error');
    }
  };

  const handleDeleteFood = (name: string) => {
    const confirm = window.confirm(`Xóa món "${name}" khỏi cơ sở dữ liệu?`);
    if (!confirm) return;

    deleteFoodItemFromDatabase(name);
    logAdminAction(adminEmail, 'Xóa món ăn', `Đã xóa món ${name}`, 'WARNING');
    showToast(`Đã xóa "${name}"`);
    refreshList();
  };

  const startEdit = (food: FoodItem) => {
    setEditingName(food.name);
    setEditCals(food.caloriesPer100g);
    setEditCategory(food.category || 'Khác');
  };

  const saveEdit = (oldName: string) => {
    updateFoodItemInDatabase(oldName, {
      name: oldName,
      caloriesPer100g: editCals,
      category: editCategory,
    });
    logAdminAction(adminEmail, 'Cập nhật món ăn', `Cập nhật calo món ${oldName} thành ${editCals} kcal`, 'INFO');
    showToast(`Đã cập nhật món "${oldName}"!`);
    setEditingName(null);
    refreshList();
  };

  const handleResetDefaults = () => {
    const confirm = window.confirm('Khôi phục danh sách thực phẩm chuẩn ban đầu?');
    if (!confirm) return;

    saveStoredFoodDatabase(INITIAL_FOOD_DATABASE);
    logAdminAction(adminEmail, 'Khôi phục danh mục món ăn', 'Đặt lại danh mục thực phẩm mặc định', 'INFO');
    showToast('Đã khôi phục danh mục thực phẩm mặc định.');
    refreshList();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Khôi phục danh sách chuẩn mặc định"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Khôi Phục Mặc Định</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Đóng Biểu Mẫu' : 'Thêm Món Mới'}</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border animate-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Add New Food Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddFood}
          className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-200/80 shadow-xs space-y-3 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Apple size={16} className="text-emerald-600" />
              <span>Thêm Món Ăn Mới Vào Bảng Dinh Dưỡng</span>
            </h4>
            <span className="text-[11px] text-emerald-700">Người dùng có thể chọn ngay sau khi lưu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên Món Ăn</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Khoai tây nghiền"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Năng Lượng (kcal / 100g)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="Ví dụ: 95"
                value={newCals}
                onChange={(e) => setNewCals(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nhóm Thực Phẩm</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              >
                <option value="Tinh bột">Tinh bột</option>
                <option value="Đạm">Chất đạm (Protein)</option>
                <option value="Rau xanh">Rau xanh / Củ quả</option>
                <option value="Đạm & Béo tốt">Đạm & Béo tốt</option>
                <option value="Trái cây">Trái cây</option>
                <option value="Đồ uống / Bổ sung">Đồ uống / Bổ sung</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/50 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Lưu Món Ăn
            </button>
          </div>
        </form>
      )}

      {/* Foods Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Tên Món Ăn</th>
                <th className="py-3 px-4">Nhóm Dinh Dưỡng</th>
                <th className="py-3 px-4">Calo / 100g</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Không tìm thấy món ăn nào.
                  </td>
                </tr>
              ) : (
                filteredFoods.map((food) => {
                  const isEditing = editingName === food.name;

                  return (
                    <tr key={food.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {food.name}
                      </td>

                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 w-32"
                          />
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                            {food.category || 'Thực phẩm'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editCals}
                            onChange={(e) => setEditCals(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 w-20"
                          />
                        ) : (
                          <span className="text-orange-600">{food.caloriesPer100g} kcal</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(food.name)}
                                className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
                                title="Lưu thay đổi"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setEditingName(null)}
                                className="p-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                                title="Hủy"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(food)}
                                className="p-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer"
                                title="Chỉnh sửa lượng calo"
                              >
                                <Edit2 size={14} />
                              </button>

                              <button
                                onClick={() => handleDeleteFood(food.name)}
                                className="p-1.5 rounded-xl bg-slate-50 text-rose-500 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
                                title="Xóa món"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
