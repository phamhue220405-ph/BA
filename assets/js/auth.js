// Auth Module
const AuthModule = {
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  verifyOTP(inputOtp, storedOtp, expiresAt) {
    if (new Date() > new Date(expiresAt)) return false;
    return inputOtp === storedOtp;
  },

  hashPassword(pwd) {
    return btoa(pwd + '_crb_salt');
  },

  register(formData) {
    const { fullName, email, phone, password, confirmPassword } = formData;
    if (!Validator.isRequired(fullName)) return { error: 'Vui lòng nhập họ tên' };
    if (!email && !phone) return { error: 'Vui lòng nhập email hoặc số điện thoại' };
    if (email && !Validator.isEmail(email)) return { error: 'Email không hợp lệ' };
    if (phone && !Validator.isPhone(phone)) return { error: 'Số điện thoại không hợp lệ' };
    if (!Validator.isMinLength(password, 8)) return { error: 'Mật khẩu tối thiểu 8 ký tự' };
    if (!Validator.isPasswordMatch(password, confirmPassword)) return { error: 'Mật khẩu xác nhận không khớp' };

    const users = StorageService.getAll('crb_users');
    const duplicate = users.find(u => (email && u.email === email) || (phone && u.phone === phone));
    if (duplicate) return { error: 'DUPLICATE_CREDENTIAL', message: 'Email hoặc số điện thoại đã được đăng ký' };

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    StorageService.setRaw('crb_pending_reg', { formData: { ...formData, passwordHash: this.hashPassword(password) }, otp, expiresAt });
    console.log(`[OTP Simulation] Mã OTP của bạn: ${otp}`);
    return { success: true, otp }; // In real app, send via email/SMS
  },

  confirmRegister(inputOtp) {
    const pending = StorageService.getRaw('crb_pending_reg');
    if (!pending) return { error: 'Không tìm thấy yêu cầu đăng ký' };
    if (!this.verifyOTP(inputOtp, pending.otp, pending.expiresAt)) {
      return { error: 'OTP không đúng hoặc đã hết hạn' };
    }
    const { formData } = pending;
    const user = StorageService.save('crb_users', {
      fullName: formData.fullName,
      email: formData.email || '',
      phone: formData.phone || '',
      passwordHash: formData.passwordHash,
      role: 'customer',
      address: '',
      avatar: '',
      loyaltyPoints: 0,
      bankAccount: { bankName: '', accountNumber: '' },
      isActive: true,
      deleted: false,
    });
    localStorage.removeItem('crb_pending_reg');
    return { success: true, user };
  },

  login(identifier, password, remember = false) {
    const users = StorageService.getAll('crb_users');
    const user = users.find(u =>
      !u.deleted && (u.email === identifier || u.phone === identifier)
    );
    if (!user || user.passwordHash !== this.hashPassword(password)) {
      return { error: 'Thông tin đăng nhập không chính xác' };
    }
    if (!user.isActive) return { error: 'Tài khoản đã bị vô hiệu hóa' };

    const session = { userId: user.id, role: user.role, fullName: user.fullName, email: user.email };
    StorageService.setSession(session);
    return { success: true, session, user };
  },

  logout() {
    StorageService.clearSession();
    window.location.href = '/customer/login.html';
  },

  hasRole(allowedRoles) {
    const session = StorageService.getSession();
    if (!session) return false;
    if (typeof allowedRoles === 'string') return session.role === allowedRoles;
    return allowedRoles.includes(session.role);
  },

  redirectByRole(role) {
    if (role === 'customer') window.location.href = '/index.html';
    else window.location.href = '/admin/index.html';
  },

  updateProfile(userId, data) {
    const { fullName, phone, address, avatar } = data;
    if (!Validator.isRequired(fullName)) return { error: 'Vui lòng nhập họ tên' };
    if (phone && !Validator.isPhone(phone)) return { error: 'Số điện thoại không hợp lệ' };
    const updated = StorageService.update('crb_users', userId, { fullName, phone, address, avatar });
    if (!updated) return { error: 'Không tìm thấy tài khoản' };
    const session = StorageService.getSession();
    if (session) StorageService.setSession({ ...session, fullName });
    return { success: true };
  },

  changePassword(userId, currentPwd, newPwd) {
    const user = StorageService.getById('crb_users', userId);
    if (!user) return { error: 'Không tìm thấy tài khoản' };
    if (user.passwordHash !== this.hashPassword(currentPwd)) return { error: 'Mật khẩu hiện tại không đúng' };
    if (!Validator.isMinLength(newPwd, 8)) return { error: 'Mật khẩu mới tối thiểu 8 ký tự' };
    StorageService.update('crb_users', userId, { passwordHash: this.hashPassword(newPwd) });
    return { success: true };
  },

  requireAuth(redirectTo = '/customer/login.html') {
    const session = StorageService.getSession();
    if (!session) { window.location.href = redirectTo; return null; }
    return session;
  },

  requireAdminAuth(allowedRoles = ['admin', 'manager', 'accountant', 'warehouse', 'sales', 'marketing']) {
    const session = StorageService.getSession();
    if (!session) { window.location.href = '/admin/login.html'; return null; }
    // All staff can VIEW any page — only edit actions are restricted per page
    if (session.role === 'customer') {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:24px;color:#ef4444;">⛔ Tài khoản khách hàng không có quyền truy cập</div>';
      return null;
    }
    return session;
  }
};


