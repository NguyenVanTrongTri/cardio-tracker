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
  try {
    // Kiểm tra user đã xác thực chưa
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để lưu buổi tập!' });
    }

    const {
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
      activeTime,   // Mới thêm: nhận từ client
      calories      // Mới thêm: nhận từ client
    } = req.body;

    // Validation cơ bản
    if (!equipmentType || !phases || !Array.isArray(phases)) {
      return res.status(400).json({ message: "Thiếu thông tin thiết bị hoặc giai đoạn tập!" });
    }

    // Map fatigue: Chuỗi -> Số (theo schema @db.TinyInt)
    const fatigueMapping = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'EXTREME': 4, 'VERY_HIGH': 5 };
    let fatigueNumber = fatigueMapping[fatigueLevel] || 3; 
    
    if (fatigueNumber < 1) fatigueNumber = 1;
    if (fatigueNumber > 5) fatigueNumber = 5;

    const newWorkout = await prisma.workout.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        equipmentType,
        workoutStartTime: new Date(workoutStartTime),
        
        // Decimal fields: Phải truyền dưới dạng String để Prisma parse chuẩn
        weightKg: weightKg ? String(weightKg) : null,
        waistCm: waistCm ? String(waistCm) : null,
        totalDistanceKm: totalDistanceKm ? String(totalDistanceKm) : null,
        
        pauseDuration: pauseDuration ? Number(pauseDuration) : 0,
        fatigueLevel: fatigueNumber,
        waterConsumedMl: waterConsumedMl ? Number(waterConsumedMl) : 0,
        notes: notes || '',
        
        // Các trường mới:
        activeTime: activeTime ? Number(activeTime) : 0,
        calories: calories ? String(calories) : "0", // Decimal

        // Defaults
        isZone2: false,
        cortisolAlert: false,
        preWorkoutAlert: false,
        
        workoutPhases: {
          create: phases.map((p, index) => ({
            id: crypto.randomUUID(),
            phaseNumber: p.phaseNumber || index + 1,
            name: p.name || `Pha ${index + 1}`,
            durationMinutes: p.durationMinutes ? Number(p.durationMinutes) : 0,
            
            // Decimal fields trong Phase
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
          })),
        },

        meals: meals && meals.length > 0 ? {
          create: meals.map((m) => ({
            id: crypto.randomUUID(),
            category: m.category,
            mealTime: m.mealTime || new Date().toLocaleTimeString(),
            totalCalories: m.totalCalories ? String(m.totalCalories) : "0", // Decimal
            foodItems: {
              create: m.foodItems ? m.foodItems.map((item) => ({
                id: crypto.randomUUID(),
                foodName: item.foodName,
                grams: String(item.grams) || "0", // Decimal
                calories: String(item.calories) || "0", // Decimal
              })) : []
            }
          }))
        } : undefined,
      },
      include: {
        workoutPhases: true,
        meals: {
          include: { foodItems: true }
        },
      },
    });

    return res.status(201).json({
      message: 'Lưu buổi tập thành công!',
      workout: newWorkout,
    });
  } catch (error) {
    console.error('Error creating workout:', error);
    return res.status(500).json({ message: 'Lỗi server khi lưu buổi tập', error: error.message });
  }
};

module.exports = { getWorkouts, createWorkout };