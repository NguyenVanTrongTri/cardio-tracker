# Cardio Tracker - Database Schema Documentation

## 1. Bảng `users` (Thông tin người dùng cố định)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment |
| `full_name` | VARCHAR(100) | Tên đầy đủ |
| `height_cm` | DECIMAL(5,2) | Chiều cao (dùng tính BMR) |
| `gender` | ENUM('MALE', 'FEMALE') | Giới tính |
| `birth_year` | INT | Năm sinh |
| `created_at` | TIMESTAMP | Thời gian tạo |

## 2. Bảng `goals` (Quản lý mục tiêu)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `user_id` | INT | Foreign Key -> `users.id` |
| `target_waist_cm` | DECIMAL(4,1) | Mục tiêu vòng eo |
| `target_weight_kg` | DECIMAL(5,2) | Mục tiêu cân nặng |
| `target_date` | DATE | Ngày đạt mục tiêu |
| `is_active` | BOOLEAN | Trạng thái mục tiêu hiện tại |

## 3. Bảng `daily_body_metrics` (Chỉ số cơ thể hàng ngày)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `user_id` | INT | Foreign Key -> `users.id` |
| `metric_date` | DATE | Ngày ghi nhận (Unique per user) |
| `weight_kg` | DECIMAL(5,2) | Cân nặng |
| `waist_cm` | DECIMAL(4,1) | Vòng eo |
| `recorded_at` | TIMESTAMP | Thời gian ghi nhận |

## 4. Bảng `equipment_types` (Loại thiết bị Cardio)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `code` | VARCHAR(50) | Unique (VD: 'TREADMILL') |
| `name` | VARCHAR(100) | Tên thiết bị |

## 5. Bảng `workouts` (Thông tin buổi tập)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `user_id` | INT | Foreign Key -> `users.id` |
| `equipment_id` | INT | Foreign Key -> `equipment_types.id` |
| `workout_start_time`| TIMESTAMP | Giờ bắt đầu tập |
| `pre_meal_time` | TIMESTAMP | Giờ ăn trước tập (Nullable) |
| `pre_meal_calories`| INT | Calo nạp trước tập (Nullable) |
| `pause_duration` | INT | Thời gian tạm dừng (phút) |
| `fatigue_level` | TINYINT | Điểm mệt mỏi (1-5) |
| `water_consumed_ml` | INT | Lượng nước (ml) |
| `notes` | TEXT | Ghi chú (Nullable) |
| `active_time` | INT | Thời gian tập thực tế |
| `calories` | DECIMAL(6,2)| Tổng calo tiêu thụ |
| `is_zone2` | BOOLEAN | Chất lượng Zone 2 |
| `created_at` | TIMESTAMP | Thời gian tạo record |

## 6. Bảng `workout_phases` (Chi tiết các giai đoạn tập)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `workout_id` | INT | Foreign Key -> `workouts.id` (CASCADE) |
| `phase_number` | TINYINT | 1: Warm-up, 2: Main, 3: Cool-down |
| `duration_minutes`| INT | Thời lượng |
| `speed_kmh` | DECIMAL(4,1) | Tốc độ |
| `incline_degree` | DECIMAL(3,1) | Độ dốc |
| `resistance_level`| INT | Mức kháng lực (Nullable) |
| `cadence_rpm` | INT | Vòng quay/phút (Nullable) |
| `is_core_engaged` | BOOLEAN | Trạng thái siết core |

---
## Điểm sáng thiết kế
1. **Chuẩn hóa 1-N cho Phases:** Dễ dàng tính calo và mở rộng (ví dụ thêm HIIT).
2. **Khả năng mở rộng:** Dễ dàng thêm thiết bị mới mà không phá vỡ cấu trúc `workouts`.
3. **Edge Cases:** Sử dụng TIMESTAMP cho thời gian giúp chính xác tuyệt đối.
