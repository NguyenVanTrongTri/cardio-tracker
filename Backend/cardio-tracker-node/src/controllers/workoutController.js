const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto'); // Dùng cho crypto.randomUUID()

// 1. Hàm lấy danh sách buổi tập
const getWorkouts = async (req, res) => {
  try {
    // 🔒 Lấy userId trực tiếp từ middleware verifyToken (đã giải mã từ HttpOnly Cookie)
    const userId = req.user?.id;
    
    // Kiểm tra an toàn bảo mật
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để xem lịch sử tập luyện!' 
      });
    }
    
    // Chỉ lấy dữ liệu đúng của user sở hữu token
    const workouts = await prisma.workout.findMany({
      where: { userId }, 
      take: 10,
      include: {
        workoutPhases: true,
      },
      orderBy: { workoutStartTime: 'desc' }
    });

    // Gom tất cả các ngày tập unique để truy vấn BodyMetric 1 lần duy nhất (Tránh lỗi N+1 Query)
    const metricDates = workouts.map(workout => {
      const workoutDateObj = new Date(workout.workoutStartTime);
      return new Date(Date.UTC(
        workoutDateObj.getFullYear(),
        workoutDateObj.getMonth(),
        workoutDateObj.getDate()
      ));
    });

    // Lấy danh sách bodyMetrics tương ứng trong 1 câu lệnh query duy nhất
    const bodyMetrics = await prisma.bodyMetric.findMany({
      where: {
        userId,
        metricDate: { in: metricDates }
      }
    });

    // Tạo một map để tra cứu nhanh theo định dạng chuỗi ngày YYYY-MM-DD
    const metricMap = new Map();
    bodyMetrics.forEach(m => {
      const dateKey = new Date(m.metricDate).toISOString().split('T')[0];
      metricMap.set(dateKey, m);
    });

    // Map dữ liệu trả về cho client (CHỈ TRẢ VỀ CÁC TRƯỜNG CẦN THIẾT - BẢO MẬT DỮ LIỆU)
    const enrichedWorkouts = workouts.map((workout) => {
      const totalCalories = parseFloat(workout.calories) || 0;
      const activeMinutes = Number(workout.activeTime) || 0;
      const calPerMinute = activeMinutes > 0 
        ? (totalCalories / activeMinutes).toFixed(1) 
        : "0.0";

      const workoutDateObj = new Date(workout.workoutStartTime);
      const dateKey = workoutDateObj.toISOString().split('T')[0];
      const bodyMetric = metricMap.get(dateKey);

      return {
        id: workout.id,
        workoutStartTime: workout.workoutStartTime,
        activeTime: workout.activeTime,
        calories: workout.calories,
        totalDistanceKm: workout.totalDistanceKm,
        equipmentType: workout.equipmentType,
        fatigueLevel: workout.fatigueLevel,
        waterConsumedMl: workout.waterConsumedMl,
        notes: workout.notes,
        workoutPhases: workout.workoutPhases,
        
        // Các chỉ số tính toán & đo lường bổ sung
        efficiencyIndex: calPerMinute,
        weightKg: bodyMetric?.weightKg || null, 
        waistCm: bodyMetric?.waistCm || null,  
      };
    });

    return res.json({ success: true, data: enrichedWorkouts });
  } catch (error) {
    console.error('Error getting workouts:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
//2. Hàm tạo buổi tập mới (Đã hoàn thiện)
const createWorkout = async (req, res) => {
  console.log('ID nhận được từ Client:', req.body.id);
  try {
    // 🔒 Lấy userId an toàn từ HttpOnly Cookie thông qua middleware verifyToken
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để lưu buổi tập!' });
    }

    const {
      id, equipmentType, workoutStartTime, meals,
      weightKg, waistCm, phases, totalDistanceKm,
      pauseDuration, fatigueLevel, waterConsumedMl,
      notes, activeTime, calories
    } = req.body;

    if (!id || !equipmentType || !phases || !Array.isArray(phases)) {
      return res.status(400).json({ success: false, message: "Thiếu ID, thiết bị hoặc giai đoạn tập!" });
    }

    const workoutDateObj = workoutStartTime ? new Date(workoutStartTime) : new Date();
    const metricDateOnly = new Date(Date.UTC(
      workoutDateObj.getFullYear(),
      workoutDateObj.getMonth(),
      workoutDateObj.getDate()
    ));

    const fatigueMapping = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'EXTREME': 4, 'VERY_HIGH': 5 };
    let fatigueNumber = fatigueMapping[fatigueLevel] || 3; 
    fatigueNumber = Math.max(1, Math.min(5, fatigueNumber));

    const startOfDay = new Date(metricDateOnly);
    const endOfDay = new Date(metricDateOnly);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const phasesData = phases.map((p, index) => ({
      id: crypto.randomUUID(),
      phaseNumber: p.phaseNumber || index + 1,
      name: p.name || `Pha ${index + 1}`,
      durationMinutes: p.durationMinutes ? Number(p.durationMinutes) : 0,
      speedKmh: p.speedKmh ? String(p.speedKmh) : "0",
      inclineDegree: p.inclineDegree ? String(p.inclineDegree) : "0",
      distanceKm: p.distanceKm !== undefined ? String(p.distanceKm) : null,
      segmentDistanceKm: p.segmentDistanceKm !== undefined ? String(p.segmentDistanceKm) : null,
      cumulativeDistanceKm: p.cumulativeDistanceKm !== undefined ? String(p.cumulativeDistanceKm) : null,
      isCoreEngaged: !!p.isCoreEngaged,
      subType: p.subType || "MAIN",
      resistanceLevel: p.resistanceLevel !== undefined ? String(p.resistanceLevel) : null,
      cadenceRpm: p.cadenceRpm ? Number(p.cadenceRpm) : null,
      strokeRateSpm: p.strokeRateSpm ? Number(p.strokeRateSpm) : null,
      stepsPerMin: p.stepsPerMin ? Number(p.stepsPerMin) : null,
    }));

    // 🚀 SỬ DỤNG TRANSACTION ĐỂ GOM NHÓM TẤT CẢ TRUY VẤN VÀ CHẠY CỰC NHANH
    const result = await prisma.$transaction(async (tx) => {
      // 1. Body Metrics Upsert
      if (weightKg !== undefined || waistCm !== undefined) {
        await tx.bodyMetric.upsert({
          where: { userId_metricDate: { userId, metricDate: metricDateOnly } },
          update: {
            weightKg: weightKg !== undefined && weightKg !== null ? String(weightKg) : undefined,
            waistCm: waistCm !== undefined && waistCm !== null ? String(waistCm) : undefined,
          },
          create: {
            id: crypto.randomUUID(),
            userId,
            metricDate: metricDateOnly,
            weightKg: weightKg !== undefined && weightKg !== null ? String(weightKg) : null,
            waistCm: waistCm !== undefined && waistCm !== null ? String(waistCm) : null,
          }
        });
      }

      // 2. Xử lý Meals theo ngày
      if (meals && Array.isArray(meals)) {
        const existingMeals = await tx.meal.findMany({
          where: { userId, mealDate: { gte: startOfDay, lt: endOfDay } },
          select: { id: true }
        });

        if (existingMeals.length > 0) {
          const mealIds = existingMeals.map(m => m.id);
          await tx.mealFoodItem.deleteMany({ where: { mealId: { in: mealIds } } });
          await tx.meal.deleteMany({ where: { id: { in: mealIds } } });
        }

        for (const m of meals) {
          await tx.meal.create({
            data: {
              id: crypto.randomUUID(),
              userId,
              mealDate: metricDateOnly,
              category: m.category || 'Khác',
              mealTime: m.mealTime || new Date().toLocaleTimeString(),
              totalCalories: m.totalCalories ? String(m.totalCalories) : "0",
              foodItems: {
                create: m.foodItems ? m.foodItems.map((item) => ({
                  id: crypto.randomUUID(),
                  foodName: item.foodName,
                  grams: String(item.grams || 0),
                  calories: String(item.calories || 0),
                })) : []
              }
            }
          });
        }
      }

      // 3. Upsert Workout & Phases
      const workout = await tx.workout.upsert({
        where: { id },
        update: {
          equipmentType,
          workoutStartTime: new Date(workoutStartTime),
          totalDistanceKm: totalDistanceKm ? String(totalDistanceKm) : null,
          pauseDuration: pauseDuration ? Number(pauseDuration) : 0,
          fatigueLevel: fatigueNumber,
          waterConsumedMl: waterConsumedMl ? Number(waterConsumedMl) : 0,
          notes: notes || '',
          activeTime: activeTime ? Number(activeTime) : 0,
          calories: calories ? String(calories) : "0",
          workoutPhases: {
            deleteMany: {},
            create: phasesData
          }
        },
        create: {
          id,
          userId,
          equipmentType,
          workoutStartTime: new Date(workoutStartTime),
          totalDistanceKm: totalDistanceKm ? String(totalDistanceKm) : null,
          pauseDuration: pauseDuration ? Number(pauseDuration) : 0,
          fatigueLevel: fatigueNumber,
          waterConsumedMl: waterConsumedMl ? Number(waterConsumedMl) : 0,
          notes: notes || '',
          activeTime: activeTime ? Number(activeTime) : 0,
          calories: calories ? String(calories) : "0",
          workoutPhases: { create: phasesData },
        },
        include: { workoutPhases: true },
      });

      const savedMeals = await tx.meal.findMany({
        where: { userId, mealDate: metricDateOnly },
        include: { foodItems: true }
      });

      const savedBodyMetric = await tx.bodyMetric.findUnique({
        where: { userId_metricDate: { userId, metricDate: metricDateOnly } }
      });

      return { workout, savedMeals, savedBodyMetric };
    }, {
      maxWait: 10000, 
      timeout: 20000  
    });

    return res.status(200).json({ 
      success: true,
      message: 'Lưu buổi tập và thông số ngày thành công!', 
      workout: result.workout,
      meals: result.savedMeals,
      bodyMetric: result.savedBodyMetric
    });

  } catch (error) {
    console.error('Error creating workout (Transaction failed):', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu buổi tập', error: error.message });
  }
};
const updateWorkout = async (req, res) => {
  try {
    // 🔒 Lấy userId từ middleware xác thực (HttpOnly Cookie)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để thực hiện thao tác này!' 
      });
    }

    const { id } = req.params; // ID của buổi tập cần sửa
    const {
      workoutStartTime,
      activeTime,
      calories,
      totalDistanceKm,
      fatigueLevel,
      waterConsumedMl,
      notes,
      weightKg,
      waistCm,
      workoutPhases
    } = req.body;

    // 1. Kiểm tra xem buổi tập có tồn tại và thuộc về user này không
    const existingWorkout = await prisma.workout.findFirst({
      where: { id, userId }
    });

    if (!existingWorkout) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy buổi tập hoặc bạn không có quyền chỉnh sửa!' 
      });
    }

    // 2. Thực hiện cập nhật dữ liệu bảng Workout bằng Transaction để đảm bảo tính toàn vẹn
    const updatedWorkout = await prisma.$transaction(async (tx) => {
      // Cập nhật thông tin chính của buổi tập
      const workout = await tx.workout.update({
        where: { id },
        data: {
          workoutStartTime: workoutStartTime ? new Date(workoutStartTime) : undefined,
          activeTime: activeTime !== undefined ? Number(activeTime) : undefined,
          calories: calories !== undefined ? String(calories) : undefined,
          totalDistanceKm: totalDistanceKm !== undefined ? Number(totalDistanceKm) : undefined,
          fatigueLevel: fatigueLevel !== undefined ? Number(fatigueLevel) : undefined,
          waterConsumedMl: waterConsumedMl !== undefined ? Number(waterConsumedMl) : undefined,
          notes: notes !== undefined ? notes : undefined,
        },
        include: {
          workoutPhases: true,
        }
      });

      // Nếu có gửi danh sách phases lên, cập nhật lại các phases liên quan
      if (workoutPhases && Array.isArray(workoutPhases)) {
        for (const phase of workoutPhases) {
          if (phase.id) {
            await tx.workoutPhase.update({
              where: { id: phase.id },
              data: {
                durationMinutes: Number(phase.durationMinutes),
                speedKmh: Number(phase.speedKmh),
                inclineDegree: Number(phase.inclineDegree),
                distanceKm: Number(phase.distanceKm),
              }
            });
          }
        }
      }

      // 3. Đồng bộ cập nhật chỉ số cơ thể (BodyMetric) nếu người dùng có nhập cân nặng hoặc vòng eo theo ngày tập
      if (weightKg !== null || waistCm !== null) {
        const workoutDateObj = new Date(workout.workoutStartTime);
        const metricDateUTC = new Date(Date.UTC(
          workoutDateObj.getFullYear(),
          workoutDateObj.getMonth(),
          workoutDateObj.getDate()
        ));

        await tx.bodyMetric.upsert({
          where: {
            userId_metricDate: {
              userId,
              metricDate: metricDateUTC
            }
          },
          update: {
            weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
            waistCm: waistCm !== undefined ? Number(waistCm) : undefined,
          },
          create: {
            id: crypto.randomUUID(), // 👈 Đã thêm ID tự sinh cho nhánh tạo mới BodyMetric, giải quyết dứt điểm lỗi thiếu ID
            userId,
            metricDate: metricDateUTC,
            weightKg: weightKg ? Number(weightKg) : 0,
            waistCm: waistCm ? Number(waistCm) : 0,
          }
        });
      }

      return workout;
    });

    return res.json({ 
      success: true, 
      message: 'Cập nhật buổi tập thành công!', 
      data: updatedWorkout 
    });

  } catch (error) {
    console.error('Error updating workout:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
// 3. Hàm xóa buổi tập (Đã bảo mật quyền sở hữu & xử lý cascade phases)
const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    // 🔒 Lấy userId an toàn từ HttpOnly Cookie thông qua middleware verifyToken
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập!' });
    }

    // Kiểm tra xem workout có tồn tại và thực sự thuộc về user này không
    const existingWorkout = await prisma.workout.findFirst({
      where: { id: id, userId: userId }
    });

    if (!existingWorkout) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy buổi tập hoặc bạn không có quyền xóa!' });
    }

    // 1. Xóa các giai đoạn tập (WorkoutPhase) liên quan trước
    await prisma.workoutPhase.deleteMany({ 
      where: { workoutId: id } 
    });

    // 2. Tiến hành xóa buổi tập chính
    await prisma.workout.delete({
      where: { id: id }
    });

    return res.json({ success: true, message: 'Đã xóa buổi tập thành công!' });
  } catch (error) {
    console.error('Lỗi xóa buổi tập:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = { getWorkouts, createWorkout , updateWorkout, deleteWorkout };