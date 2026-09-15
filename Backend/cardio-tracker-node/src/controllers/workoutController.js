const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    res.json({ success: true, data: workouts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getWorkouts };