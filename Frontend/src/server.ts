import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors()); // Cấu hình CORS
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock in-memory auth store for server-side verification
  const serverUsers = [
    {
      id: 'usr-trongtri',
      email: '1',
      password: '1',
      fullName: 'Nguyễn Minh Trí',
      heightCm: 170,
      weightKg: 70,
      gender: 'MALE',
      birthYear: 1996,
      targetWaistCm: 80.0,
      targetWeightKg: 67.0,
      targetDate: '2026-10-31',
      createdAt: '2026-08-01T08:00:00Z',
    }
  ];
  const resetOtps = new Map<string, { otp: string; expiresAt: number }>();

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = serverUsers.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase());
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không chính xác" });
    }
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token: `tok_${Date.now()}` });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, fullName, heightCm, weightKg, gender, birthYear } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng cung cấp email và mật khẩu" });
    }
    const exists = serverUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return res.status(409).json({ error: "Email đã tồn tại" });
    }
    const newUser = {
      id: `usr_${Date.now()}`,
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName || 'Thành Viên Mới',
      heightCm: Number(heightCm) || 170,
      weightKg: Number(weightKg) || 70,
      gender: gender || 'MALE',
      birthYear: Number(birthYear) || 1998,
      targetWaistCm: 80.0,
      targetWeightKg: 68.0,
      targetDate: '2026-12-31',
      createdAt: new Date().toISOString()
    };
    serverUsers.push(newUser);
    const { password: _, ...safeUser } = newUser;
    res.json({ success: true, user: safeUser, token: `tok_${Date.now()}` });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const normEmail = (email || '').trim().toLowerCase();
    const user = serverUsers.find(u => u.email.toLowerCase() === normEmail);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản với email này" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    resetOtps.set(normEmail, { otp, expiresAt: Date.now() + 15 * 60 * 1000 });
    res.json({ success: true, otp, message: "Mã OTP đặt lại mật khẩu đã được tạo" });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email, otp, newPassword } = req.body;
    const normEmail = (email || '').trim().toLowerCase();
    const record = resetOtps.get(normEmail);
    if (!record || record.otp !== (otp || '').trim() || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }
    const user = serverUsers.find(u => u.email.toLowerCase() === normEmail);
    if (user) {
      user.password = newPassword;
      resetOtps.delete(normEmail);
      return res.json({ success: true, message: "Đã cập nhật mật khẩu mới thành công" });
    }
    res.status(404).json({ error: "Không tìm thấy người dùng" });
  });

  // Vite middleware cho development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
