const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const crypto = require('crypto');

const getMeals = async (req, res) => {
  try {
    // 🔒 Lấy userId trực tiếp từ middleware verifyToken (đã giải mã từ HttpOnly Cookie)
    const userId = req.user?.id;
    
    // Kiểm tra an toàn bảo mật
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để xem nhật ký dinh dưỡng!' 
      });
    }
    
    // Truy vấn danh sách bữa ăn kèm theo danh sách món ăn chi tiết (foodItems)
    const meals = await prisma.meal.findMany({
      where: { userId }, 
      take: 20, // Giới hạn số lượng bản ghi trả về
      include: {
        foodItems: true // 👈 Lấy kèm các món ăn trong bữa từ bảng meal_food_items
      },
      orderBy: { mealDate: 'desc' } // Sắp xếp theo ngày mới nhất
    });

    // Map dữ liệu trả về cho client đúng chuẩn schema
    const enrichedMeals = meals.map((meal) => {
      const totalCal = parseFloat(meal.totalCalories) || 0;

      return {
        id: meal.id,
        mealDate: meal.mealDate,
        category: meal.category,       // Ví dụ: Sáng, Trưa, Tối,...
        mealTime: meal.mealTime,       // Ví dụ: 07:30
        totalCalories: totalCal,
        foodItems: meal.foodItems.map(item => ({
          id: item.id,
          foodName: item.foodName,
          grams: parseFloat(item.grams) || 0,
          calories: parseFloat(item.calories) || 0,
        })),
      };
    });

    return res.json({ success: true, data: enrichedMeals });
  } catch (error) {
    console.error('Error getting meals:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
const createMeal = async (req, res) => {
  try {
    // 🔒 Lấy userId trực tiếp từ middleware verifyToken
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để thêm nhật ký dinh dưỡng!' 
      });
    }

    // Lấy dữ liệu gửi lên từ client (req.body)
    const { mealDate, category, mealTime, foodItems } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!category || !foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp loại bữa ăn và ít nhất một món ăn!' 
      });
    }

    // 🧮 Tự động tính tổng calo của bữa ăn dựa trên danh sách món gửi lên
    const totalCalories = foodItems.reduce((sum, item) => {
      return sum + (parseFloat(item.calories) || 0);
    }, 0);

    // 🚀 Tạo Meal và các foodItems liên quan bằng Prisma (Nested Write)
    const newMeal = await prisma.meal.create({
      data: {
        userId,
        mealDate: mealDate ? new Date(mealDate) : new Date(), // Mặc định là ngày giờ hiện tại nếu không truyền
        category,                                           // Ví dụ: "Bữa Sáng", "Bữa Trưa"...
        mealTime: mealTime || '07:30',                      // Thời gian ăn mặc định
        totalCalories,
        foodItems: {
          create: foodItems.map((item) => ({
            foodName: item.foodName,
            grams: parseFloat(item.grams) || 0,
            calories: parseFloat(item.calories) || 0,
          }))
        }
      },
      include: {
        foodItems: true // Trả về kèm danh sách món ăn sau khi tạo thành công
      }
    });

    // Trả về kết quả thành công cho client
    return res.status(201).json({ 
      success: true, 
      message: 'Thêm bữa ăn thành công!',
      data: newMeal 
    });

  } catch (error) {
    console.error('Error creating meal:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
const updateMeal = async (req, res) => {}  
const deleteMeal = async (req, res) => {}   
module.exports = {getMeals, createMeal, updateMeal, deleteMeal};