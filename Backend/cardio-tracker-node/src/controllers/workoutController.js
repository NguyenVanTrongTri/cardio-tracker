const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto'); // Dùng cho crypto.randomUUID()

// 1. Hàm lấy danh sách buổi tập
const getWorkouts = async (req, res) => {
  try {
    const userId = req.user?.id; // Nên lọc theo userId của user đang đăng nhập (nếu cần bảo mật)
    
    const workouts = await prisma.workout.findMany({
      where: userId ? { userId } : undefined, // Lọc theo user nếu có token
      take: 10,
      include: {
        workoutPhases: true, // Chỉ lấy phases thuộc về workout
      },
      orderBy: { workoutStartTime: 'desc' }
    });

    return res.json({ success: true, data: workouts });
  } catch (error) {
    console.error('Error getting workouts:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
// 2. Hàm tạo buổi tập mới (Đã hoàn thiện)
const createWorkout = async (req, res) => {
  console.log('ID nhận được từ Client:', req.body.id);
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để lưu buổi tập!' });
    }

    const {
      id, equipmentType, workoutStartTime, meals,
      weightKg, waistCm, phases, totalDistanceKm,
      pauseDuration, fatigueLevel, waterConsumedMl,
      notes, activeTime, calories
    } = req.body;

    if (!id || !equipmentType || !phases || !Array.isArray(phases)) {
      return res.status(400).json({ message: "Thiếu ID, thiết bị hoặc giai đoạn tập!" });
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

      // Lấy dữ liệu trả về trong cùng transaction
      const savedMeals = await tx.meal.findMany({
        where: { userId, mealDate: metricDateOnly },
        include: { foodItems: true }
      });

      const savedBodyMetric = await tx.bodyMetric.findUnique({
        where: { userId_metricDate: { userId, metricDate: metricDateOnly } }
      });

      return { workout, savedMeals, savedBodyMetric };
    });

    return res.status(200).json({ 
      message: 'Lưu buổi tập và thông số ngày thành công!', 
      workout: result.workout,
      meals: result.savedMeals,
      bodyMetric: result.savedBodyMetric
    });

  } catch (error) {
    console.error('Error creating workout (Transaction failed):', error);
    return res.status(500).json({ message: 'Lỗi server khi lưu buổi tập', error: error.message });
  }
};
const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập!' });
    }

    // Xóa các dữ liệu liên quan trước (nếu cần do constraint) hoặc dùng cascade delete
    await prisma.workoutPhase.deleteMany({ where: { workoutId: id } });
    await prisma.meal.deleteMany({ where: { workoutId: id } });

    // Xóa buổi tập
    const deleted = await prisma.workout.delete({
      where: { id: id, userId: userId }
    });

    return res.json({ success: true, message: 'Đã xóa buổi tập!' });
  } catch (error) {
    console.error('Lỗi xóa buổi tập:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = { getWorkouts, createWorkout , deleteWorkout };