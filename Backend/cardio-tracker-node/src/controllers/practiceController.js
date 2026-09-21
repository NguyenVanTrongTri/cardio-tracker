const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto'); // Dùng cho crypto.randomUUID() nếu cần sinh ID tự động

// 1. Hàm lấy danh sách cấu hình bài tập từ bảng practices
const getPractices = async (req, res) => {
  try {
    // 🔒 Lấy userId từ middleware verifyToken (nếu cần giới hạn bài tập theo user)
    // Hoặc nếu bảng Practice là dữ liệu chung công khai, bạn có thể bỏ qua bước check userId này.
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để thực hiện thao tác này!' 
      });
    }

    const { onlyEnabled } = req.query;
    const whereCondition = onlyEnabled === 'true' ? { enabled: true } : {};

    const practices = await prisma.practice.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json({ 
      success: true, 
      data: practices 
    });
  } catch (error) {
    console.error('Error getting practices:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy danh sách bài tập', 
      error: error.message 
    });
  }
};

// 2. Hàm thêm mới cấu hình bài tập (Dành cho Admin)
const createPractice = async (req, res) => {
  try {
    // 🔒 Nếu muốn bảo mật, kiểm tra xem user đã đăng nhập chưa
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để thực hiện thao tác này!' 
      });
    }

    const { id, name, shortName, tag, badgeColor, bgLight, description, enabled, configJson } = req.body;

    if (!id || !name || !shortName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu các thông tin bắt buộc (id, name, shortName)!' 
      });
    }

    const existingPractice = await prisma.practice.findUnique({
      where: { id }
    });

    if (existingPractice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã ID bài tập này đã tồn tại trong hệ thống!' 
      });
    }

    const newPractice = await prisma.practice.create({
      data: {
        id,
        name,
        shortName,
        tag: tag || null,
        badgeColor: badgeColor || null,
        bgLight: bgLight || null,
        description: description || null,
        enabled: enabled !== undefined ? enabled : true,
        configJson: configJson || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm mới bài tập thành công!',
      data: newPractice,
    });
  } catch (error) {
    console.error('Error creating practice:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm mới bài tập',
      error: error.message,
    });
  }
};

// 3. Hàm cập nhật cấu hình hoặc trạng thái bài tập (Dành cho Admin)
const updatePractice = async (req, res) => {
  try {
    // 🔒 Kiểm tra xác thực qua Cookie (nếu muốn bảo mật)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bạn cần đăng nhập để thực hiện thao tác này!' 
      });
    }

    const { id } = req.params;
    const { enabled, name, shortName, tag, badgeColor, bgLight, description, configJson } = req.body;

    const existingPractice = await prisma.practice.findUnique({
      where: { id }
    });

    if (!existingPractice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy bài tập với ID này!' 
      });
    }

    const updatedPractice = await prisma.practice.update({
      where: { id },
      data: {
        ...(enabled !== undefined && { enabled }),
        ...(name && { name }),
        ...(shortName && { shortName }),
        ...(tag !== undefined && { tag }),
        ...(badgeColor !== undefined && { badgeColor }),
        ...(bgLight !== undefined && { bgLight }),
        ...(description !== undefined && { description }),
        ...(configJson !== undefined && { configJson }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật bài tập thành công!',
      data: updatedPractice,
    });
  } catch (error) {
    console.error('Error updating practice:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bài tập',
      error: error.message,
    });
  }
};

module.exports = { 
  getPractices,
  createPractice,
  updatePractice
};