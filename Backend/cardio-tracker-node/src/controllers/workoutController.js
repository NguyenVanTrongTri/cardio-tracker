const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto'); // Dùng cho crypto.randomUUID()

// 1. Hàm lấy danh sách buổi tập
const getWorkouts = async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      take: 10,
      include: {
        user: { select: { fullName: true, email: true } },
        workoutPhases: true,
        meals: { include: { foodItems: true } }
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
      id, // ID phiên tập do Client gửi lên
      equipmentType,
      workoutStartTime,
      meals,
      weightKg,
      waistCm,
      phases,
      totalDistanceKm,
      pauseDuration,
      fatigueLevel,
      waterConsumedMl,
      notes,
      activeTime,
      calories
    } = req.body;

    if (!id || !equipmentType || !phases || !Array.isArray(phases)) {
      return res.status(400).json({ message: "Thiếu ID, thiết bị hoặc giai đoạn tập!" });
    }

    // Xác định ngày tập (lấy phần Date chuẩn dạng YYYY-MM-DD từ workoutStartTime hoặc thời điểm hiện tại)
    const workoutDateObj = workoutStartTime ? new Date(workoutStartTime) : new Date();
    const metricDateOnly = new Date(Date.UTC(
      workoutDateObj.getFullYear(),
      workoutDateObj.getMonth(),
      workoutDateObj.getDate()
    ));

    // Map fatigue
    const fatigueMapping = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'EXTREME': 4, 'VERY_HIGH': 5 };
    let fatigueNumber = fatigueMapping[fatigueLevel] || 3; 
    if (fatigueNumber < 1) fatigueNumber = 1;
    if (fatigueNumber > 5) fatigueNumber = 5;

    // 1. XỬ LÝ BODY METRICS THEO NGÀY (Nếu người dùng có truyền cân nặng hoặc vòng eo)
    if (weightKg !== undefined || waistCm !== undefined) {
      await prisma.bodyMetric.upsert({
        where: {
          userId_metricDate: {
            userId: userId,
            metricDate: metricDateOnly
          }
        },
        update: {
          weightKg: weightKg !== undefined && weightKg !== null ? String(weightKg) : undefined,
          waistCm: waistCm !== undefined && waistCm !== null ? String(waistCm) : undefined,
        },
        create: {
          id: crypto.randomUUID(),
          userId: userId,
          metricDate: metricDateOnly,
          weightKg: weightKg !== undefined && weightKg !== null ? String(weightKg) : null,
          waistCm: waistCm !== undefined && waistCm !== null ? String(waistCm) : null,
        }
      });
    }

    // 2. XỬ LÝ MEALS THEO NGÀY (Xóa các bữa cũ trong ngày và tạo mới toàn bộ bữa ăn của ngày đó)
    if (meals && Array.isArray(meals)) {
      // Tìm và xóa các bữa ăn cũ của user trong đúng ngày hôm đó
      const startOfDay = new Date(metricDateOnly);
      const endOfDay = new Date(metricDateOnly);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const existingMeals = await prisma.meal.findMany({
        where: {
          userId: userId,
          mealDate: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        select: { id: true }
      });

      if (existingMeals.length > 0) {
        const mealIds = existingMeals.map(m => m.id);
        // Xóa các món ăn bên trong các bữa cũ trước
        await prisma.mealFoodItem.deleteMany({
          where: { mealId: { in: mealIds } }
        });
        // Xóa các bữa cũ
        await prisma.meal.deleteMany({
          where: { id: { in: mealIds } }
        });
      }

      // Tạo mới danh sách bữa ăn cho ngày hôm đó
      if (meals.length > 0) {
        for (const m of meals) {
          await prisma.meal.create({
            data: {
              id: crypto.randomUUID(),
              userId: userId,
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
    }

    // 3. CHUẨN BỊ DỮ LIỆU PHASES CHO WORKOUT
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

    // 4. XỬ LÝ LƯU HOẶC CẬP NHẬT PHIÊN TẬP (WORKOUT) ĐỘC LẬP
    const workout = await prisma.workout.upsert({
      where: { id: id },
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
        
        // Xóa phases cũ và tạo mới
        workoutPhases: {
          deleteMany: {},
          create: phasesData
        }
      },
      create: {
        id, // ID Client gửi lên
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
      include: {
        workoutPhases: true,
      },
    });

    // Lấy thêm thông tin meals và bodyMetrics của ngày hôm đó để trả về response cho client nếu cần
    const savedMeals = await prisma.meal.findMany({
      where: { userId: userId, mealDate: metricDateOnly },
      include: { foodItems: true }
    });

    const savedBodyMetric = await prisma.bodyMetric.findUnique({
      where: {
        userId_metricDate: {
          userId: userId,
          metricDate: metricDateOnly
        }
      }
    });

    return res.status(200).json({ 
      message: 'Lưu buổi tập và thông số ngày thành công!', 
      workout,
      meals: savedMeals,
      bodyMetric: savedBodyMetric
    });

  } catch (error) {
    console.error('Error creating workout:', error);
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