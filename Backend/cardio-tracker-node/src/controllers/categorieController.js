const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { symlinkSync } = require('fs');

const getCateLog = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Xây dựng điều kiện lọc: Lấy món chung (userId = null) hoặc món riêng của user hiện tại
    const whereCondition = {
      OR: [
        { userId: null },                      // Món ăn dùng chung của hệ thống (do Admin tạo và để trống userId)
        ...(userId ? [{ userId: userId }] : []) // Món ăn riêng tư do chính user hiện tại tạo
      ]
    };

    const categories = await prisma.mealCategory.findMany({
      where: whereCondition,
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting meal categories:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export default getCateLog;
const createCateLog = async (req, res) => {
  try {
    // 🔒 Lấy userId từ middleware xác thực
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để thực hiện thao tác này!' 
      });
    }

    // Lấy các thông tin từ request body (bao gồm cả thông tin món ăn mới)
    const { name, category, caloriesPer100g, icon, badgeColor, sortOrder } = req.body;

    // Validate dữ liệu bắt buộc
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tên món ăn/danh mục (name) không được để trống!' 
      });
    }

    // Tạo một ID ngẫu nhiên độc nhất
    const categoryId = `food_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Lưu vào cơ sở dữ liệu thông qua Prisma
    const newCategory = await prisma.mealCategory.create({
      data: {
        id: categoryId,
        userId: userId,
        name: name,
        category: category || null, // Nhóm dinh dưỡng (Tinh bột, Đạm, Rau xanh...)
        caloriesPer100g: caloriesPer100g !== undefined && caloriesPer100g !== '' ? Number(caloriesPer100g) : null, // Số calo trên 100g
        icon: icon || null,
        badgeColor: badgeColor || null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm thành công!',
      data: newCategory,
    });
    
  } catch (error) {
    console.error('Error creating meal category/food:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
const updateCateLog = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để thực hiện thao tác này!' 
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu ID danh mục cần cập nhật!' 
      });
    }

    const existingCategory = await prisma.mealCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy danh mục bữa ăn!' 
      });
    }

    if (existingCategory.userId && existingCategory.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền chỉnh sửa danh mục này!' 
      });
    }

    // [FIX]: Lấy thêm các trường cần thiết từ request body
    const { name, icon, badgeColor, sortOrder, caloriesPer100g, category } = req.body;

    // [FIX]: Thêm các trường vào lệnh cập nhật của Prisma
    const updatedCategory = await prisma.mealCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(badgeColor !== undefined && { badgeColor }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        ...(caloriesPer100g !== undefined && { caloriesPer100g: Number(caloriesPer100g) }), // Thêm trường này
        ...(category !== undefined && { category }), // Thêm trường này
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật danh mục thành công!',
      data: updatedCategory,
    });

  } catch (error) {
    console.error('Error updating meal category:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
const deleteCateLog = async (req, res) => {
  try {
    // 🔒 Lấy userId từ middleware xác thực
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để thực hiện thao tác này!' 
      });
    }

    // Lấy category ID từ URL params (ví dụ: /api/categories/:id)
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu ID danh mục cần xóa!' 
      });
    }

    // Kiểm tra xem danh mục có tồn tại trong database không
    const existingCategory = await prisma.mealCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy danh mục bữa ăn!' 
      });
    }

    // Kiểm tra quyền sở hữu (tránh user A xóa nhầm danh mục của user B)
    if (existingCategory.userId && existingCategory.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền xóa danh mục này!' 
      });
    }

    // Thực hiện xóa danh mục thông qua Prisma
    await prisma.mealCategory.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Xóa danh mục thành công!',
    });

  } catch (error) {
    console.error('Error deleting meal category:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {getCateLog, createCateLog, updateCateLog, deleteCateLog};