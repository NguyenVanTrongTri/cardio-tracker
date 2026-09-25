const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
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
        id: `m-${crypto.randomUUID()}`,
        mealDate: mealDate ? new Date(mealDate) : new Date(), 
        category,                                           
        mealTime: mealTime || '07:30',                      
        totalCalories,
        // 🛠️ Thêm khối liên kết user này vào để Prisma nhận diện quan hệ
        user: {
          connect: { id: userId }
        },
        foodItems: {
          create: foodItems.map((item) => ({
            id: `fi-${crypto.randomUUID()}`,
            foodName: item.foodName,
            grams: parseFloat(item.grams) || 0,
            calories: parseFloat(item.calories) || 0,
          }))
        }
      },
      include: {
        foodItems: true 
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
const deleteMeal = async (req, res) => {
  try {
    // 🔒 Lấy userId trực tiếp từ middleware verifyToken
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để thực hiện thao tác này!' 
      });
    }

    // Lấy mealId từ params của URL (ví dụ: /api/meals/:id)
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu mã định danh bữa ăn cần xóa!' 
      });
    }

    // 🔍 Kiểm tra xem bữa ăn có tồn tại và có thuộc về user này hay không
    const existingMeal = await prisma.meal.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existingMeal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy bữa ăn hoặc bạn không có quyền xóa!' 
      });
    }

    // 🚀 Tiến hành xóa bữa ăn (Do đã cấu hình onDelete: Cascade ở schema cho bảng con foodItems nên các món ăn chi tiết sẽ tự động bị xóa theo)
    await prisma.meal.delete({
      where: {
        id: id,
      },
    });

    // Trả về kết quả thành công
    return res.status(200).json({ 
      success: true, 
      message: 'Xóa bữa ăn thành công!' 
    });

  } catch (error) {
    console.error('Error deleting meal:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = { deleteMeal }; 
module.exports = {getMeals, createMeal, updateMeal, deleteMeal};