# Business Requirements Document (BRS) - Cardio & Fat Loss Tracker

## 1. Quản Lý Thông Tin Người Dùng & Mục Tiêu

### 1.1. Thông tin cố định (User Profile)
- **Các trường:** Chiều cao (cm), Giới tính, Năm sinh.
- **Mục đích:** Sử dụng làm tham số đầu vào để tính BMR (Basal Metabolic Rate) và các chỉ số tiêu hao calo.

### 1.2. Quản lý mục tiêu (Goal Tracking)
- **Các trường:** Vòng eo mục tiêu (cm, mặc định 80cm), Cân nặng mục tiêu (kg), Hạn định hoàn thành (Target Date).
- **Trạng thái:** Quản lý mục tiêu hiện tại (`is_active`).

### 1.3. Quy tắc toàn vẹn dữ liệu chỉ số cơ thể (Body Metrics Integrity)
- **Tách biệt:** Nhật ký tập luyện (nhiều buổi/ngày) và Chỉ số cơ thể (1 bản ghi/ngày).
- **Ràng buộc:** Nếu người dùng bỏ trống Cân nặng/Vòng eo khi tạo buổi tập, Backend tự động lấy giá trị từ bản ghi gần nhất.

---

## 2. Luồng Quản Lý Nhật Ký Tập Luyện (Workout Logger)

### 2.1. Thiết bị tập luyện (Equipment Context)
- Hỗ trợ Treadmill (Mặc định Phase 1), mở rộng tương lai cho Stationary Bike (tự động chuyển đổi logic tính toán cường độ).

### 2.2. Thông tin buổi tập
- Thời điểm bắt đầu (`workout_start_time`).
- Thông tin bữa ăn: Thời gian (`pre_meal_time`), Lượng calo ước tính (~400–450 kcal).

### 2.3. Giai đoạn tập luyện (3-Phase Workout)
- **P1 (Warm-up):** Thời gian, Độ dốc, Tốc độ.
- **P2 (Fat Burn):** Thời gian, Độ dốc, Tốc độ, Siết cơ core.
- **P3 (Cool-down):** Thời gian, Độ dốc, Tốc độ.
- **Khác:** Thời gian nghỉ (`pause_duration`), Mức độ mệt mỏi (1-5), Nước tiêu thụ (ml), Ghi chú.

### 2.4. Ràng buộc dữ liệu (Validation)
- Cân nặng, Vòng eo, Thời gian > 0.
- Độ dốc: 0° - 15°.
- Tốc độ: 0.5 - 20.0 km/h.

---

## 3. Mô-đun Xử Lý Logic & Tính Toán

### 3.1. Chỉ số tập luyện
- **Active Time:** (P1 + P2 + P3) - Pause Duration.
- **Calo (ACSM):**
  - VO2 = (0.1 * Speed) + (1.8 * Speed * Incline) + 3.5 (Speed tính bằng m/phút).
  - Calories/phút = (VO2 * Cân nặng) / 200.
- **Efficiency Index:** Tổng Calo / Active Time.

### 3.2. Cảnh báo thông minh (Smart Alerts)
- **Cortisol Alert:** Active Time > 50 phút (Cảnh báo đỏ).
- **Pre-workout Alert:** Khoảng cách (`workout_start_time` - `pre_meal_time`) < 20 phút (Cảnh báo xóc hông).

### 3.3. Chấm điểm bài tập (Zone 2)
- Điều kiện đạt chuẩn: P2 >= 25 phút, Độ dốc P2 >= 8°, 40 <= Active Time <= 48 phút.

---

## 4. Mô-đun Gợi Ý & Phân Tích

### 4.1. Đề xuất tải trọng (Smart Recommendation)
- **Tăng:** Mệt mỏi <= 2/5 (3 buổi liên tiếp) + Vòng eo/Cân nặng không giảm > 0.2cm (14 ngày).
- **Giảm:** Mệt mỏi >= 4/5 hoặc Active Time > 50 phút.

### 4.2. Thống kê & Biểu đồ
- **Kỷ luật gồng core:** Tỷ lệ % buổi tập có siết cơ ở P2.
- **So sánh buổi tập:** Calo, Thời gian, Mật độ calo, Độ dốc.
- **Dashboard:** Biểu đồ đường (Cân nặng, Vòng eo, đường tiệm cận mục tiêu), Tổng kcal tích lũy, Tốc độ giảm eo trung bình.
