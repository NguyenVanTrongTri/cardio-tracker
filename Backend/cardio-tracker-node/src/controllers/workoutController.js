const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto'); // 👈 Bổ sung bắt buộc để dùng crypto.randomUUID()

const createWorkout = async (req, res) => {
  try {
    const userId = req.user.id; 
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
    } = req.body;

    const newWorkout = await prisma.workout.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        equipmentType,
        workoutStartTime: new Date(workoutStartTime),
        weightKg: weightKg ? Number(weightKg) : null,
        waistCm: waistCm ? Number(waistCm) : null,
        totalDistanceKm: totalDistanceKm ? Number(totalDistanceKm) : null,
        pauseDuration: pauseDuration ? Number(pauseDuration) : 0,
        fatigueLevel: fatigueLevel ? Number(fatigueLevel) : null,
        waterConsumedMl: waterConsumedMl ? Number(waterConsumedMl) : 0,
        notes: notes || '',
        isZone2: false,
        cortisolAlert: false,
        preWorkoutAlert: false,
        
        workoutPhases: {
          create: phases.map((p, index) => ({
            id: crypto.randomUUID(),
            phaseNumber: p.phaseNumber || index + 1,
            name: p.name || `Pha ${index + 1}`,
            durationMinutes: p.durationMinutes ? Number(p.durationMinutes) : 0,
            speedKmh: p.speedKmh ? Number(p.speedKmh) : 0,
            inclineDegree: p.inclineDegree ? Number(p.inclineDegree) : 0,
            distanceKm: p.distanceKm !== undefined ? Number(p.distanceKm) : null,
            segmentDistanceKm: p.segmentDistanceKm !== undefined ? Number(p.segmentDistanceKm) : null,
            cumulativeDistanceKm: p.cumulativeDistanceKm !== undefined ? Number(p.cumulativeDistanceKm) : null,
            isCoreEngaged: !!p.isCoreEngaged,
            subType: p.subType || null,
            resistanceLevel: p.resistanceLevel !== undefined ? Number(p.resistanceLevel) : null,
            cadenceRpm: p.cadenceRpm !== undefined ? Number(p.cadenceRpm) : null,
            strokeRateSpm: p.strokeRateSpm !== undefined ? Number(p.strokeRateSpm) : null,
            stepsPerMin: p.stepsPerMin !== undefined ? Number(p.stepsPerMin) : null,
          })),
        },

        meals: meals && meals.length > 0 ? {
          create: meals.map((m) => ({
            id: crypto.randomUUID(),
            category: m.category,
            mealTime: m.mealTime || new Date().toLocaleTimeString(),
            totalCalories: m.totalCalories ? Number(m.totalCalories) : 0,
            foodItems: {
              create: m.foodItems ? m.foodItems.map((item) => ({
                id: crypto.randomUUID(),
                foodName: item.foodName,
                grams: Number(item.grams) || 0,
                calories: Number(item.calories) || 0,
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

module.exports = { createWorkout };