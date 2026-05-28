// Customer Module
const CustomerModule = {
  getAll(filters = {}) {
    let customers = StorageService.getAll('crb_users')
      .filter(u => u.role === 'customer' && !u.deleted);

    if (filters.status === 'active') {
      customers = customers.filter(u => u.isActive !== false);
    }

    if (filters.status === 'locked') {
      customers = customers.filter(u => u.isActive === false);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      customers = customers.filter(u =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    }

    if (filters.sortByPoints) {
      customers.sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));
    }

    return customers;
  },

  getById(id) {
    return StorageService.getById('crb_users', id);
  },

  validate(data, editingId = null) {
    const fullName = data.fullName?.trim();
    const phone = data.phone?.trim();
    const email = data.email?.trim();

    if (!fullName) return 'Vui lòng nhập họ tên khách hàng';
    if (!phone) return 'Vui lòng nhập số điện thoại khách hàng';

    if (!/^[0-9]{10}$/.test(phone)) {
      return 'Số điện thoại phải gồm đúng 10 chữ số';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Email không đúng định dạng';
    }

    const users = StorageService.getAll('crb_users');
    const duplicate = users.find(u =>
      u.id !== editingId &&
      !u.deleted &&
      (
        (phone && u.phone === phone) ||
        (email && u.email === email)
      )
    );

    if (duplicate) return 'Số điện thoại hoặc email đã tồn tại trong hệ thống';

    return '';
  },

  create(data) {
    const error = this.validate(data);
    if (error) return { error };

    const customer = StorageService.save('crb_users', {
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      address: data.address?.trim() || '',
      note: data.note?.trim() || '',
      role: 'customer',
      passwordHash: btoa('default'),
      loyaltyPoints: 0,
      isActive: data.isActive !== false,
      deleted: false,
      bankAccount: { bankName: '', accountNumber: '' },
      avatar: '',
      editHistory: [
        {
          action: 'Thêm khách hàng',
          changedAt: new Date().toISOString(),
          changedBy: data.changedBy || 'system'
        }
      ],
      pointHistory: []
    });

    return { success: true, customer };
  },

  update(id, changes, changedBy = 'system') {
    const existing = StorageService.getById('crb_users', id);
    if (!existing) return { error: 'Không tìm thấy khách hàng' };

    const error = this.validate(changes, id);
    if (error) return { error };

    const history = existing.editHistory || [];

    history.push({
      action: 'Cập nhật thông tin khách hàng',
      changedAt: new Date().toISOString(),
      changedBy,
      previousValues: {
        fullName: existing.fullName,
        phone: existing.phone,
        email: existing.email,
        address: existing.address,
        note: existing.note,
        isActive: existing.isActive
      },
      newValues: {
        fullName: changes.fullName,
        phone: changes.phone,
        email: changes.email,
        address: changes.address,
        note: changes.note,
        isActive: changes.isActive
      }
    });

    StorageService.update('crb_users', id, {
      fullName: changes.fullName.trim(),
      phone: changes.phone.trim(),
      email: changes.email?.trim() || '',
      address: changes.address?.trim() || '',
      note: changes.note?.trim() || '',
      isActive: changes.isActive !== false,
      editHistory: history
    });

    return { success: true };
  },

  delete(id, changedBy = 'system') {
    const customer = StorageService.getById('crb_users', id);
    if (!customer) return { error: 'Không tìm thấy khách hàng' };

    const orders = OrderModule.getRentalOrders({ userId: id })
      .filter(o => !['da_huy', 'da_tra_do', 'hoan_thanh'].includes(o.status));

    const bookings = OrderModule.getFittingBookings({ userId: id })
      .filter(b => !['da_huy', 'hoan_thanh'].includes(b.status));

    if (orders.length > 0 || bookings.length > 0) {
      return {
        warning: true,
        message: `Không thể xóa khách hàng vì còn ${orders.length} đơn thuê và ${bookings.length} lịch thử đang xử lý.`
      };
    }

    const history = customer.editHistory || [];

    history.push({
      action: 'Khóa/Xóa khách hàng',
      changedAt: new Date().toISOString(),
      changedBy,
      previousStatus: customer.isActive,
      newStatus: false
    });

    StorageService.update('crb_users', id, {
      isActive: false,
      editHistory: history
    });

    return { success: true };
  },

  restore(id, changedBy = 'system') {
    const customer = StorageService.getById('crb_users', id);
    if (!customer) return { error: 'Không tìm thấy khách hàng' };

    const history = customer.editHistory || [];

    history.push({
      action: 'Khôi phục khách hàng',
      changedAt: new Date().toISOString(),
      changedBy,
      previousStatus: customer.isActive,
      newStatus: true
    });

    StorageService.update('crb_users', id, {
      isActive: true,
      deleted: false,
      editHistory: history
    });

    return { success: true };
  },

  getPointConfig() {
    const configs = StorageService.getAll('crb_point_config');
    return configs[0] || {
      moneyPerPoint: 10000,
      pointValue: 1000
    };
  },

  savePointConfig(config, changedBy = 'system') {
    const configs = StorageService.getAll('crb_point_config');
    const existing = configs[0];

    const data = {
      moneyPerPoint: Number(config.moneyPerPoint),
      pointValue: Number(config.pointValue),
      updatedAt: new Date().toISOString(),
      updatedBy: changedBy
    };

    if (existing) {
      StorageService.update('crb_point_config', existing.id, data);
    } else {
      StorageService.save('crb_point_config', data);
    }

    return { success: true };
  },

  addPoints(customerId, orderAmount, reason = 'Cộng điểm sau khi hoàn thành đơn thuê') {
    const customer = this.getById(customerId);
    if (!customer) return { error: 'Không tìm thấy khách hàng' };

    const config = this.getPointConfig();
    const points = Math.floor(Number(orderAmount) / Number(config.moneyPerPoint));

    if (points <= 0) return { error: 'Số điểm cộng không hợp lệ' };

    const pointHistory = customer.pointHistory || [];

    pointHistory.push({
      type: 'add',
      points,
      reason,
      createdAt: new Date().toISOString()
    });

    StorageService.update('crb_users', customerId, {
      loyaltyPoints: (customer.loyaltyPoints || 0) + points,
      pointHistory
    });

    return { success: true, points };
  },

  usePoints(customerId, points) {
    const customer = this.getById(customerId);
    if (!customer) return { error: 'Không tìm thấy khách hàng' };

    points = Number(points);

    if (points <= 0) return { error: 'Số điểm sử dụng không hợp lệ' };

    if (points > (customer.loyaltyPoints || 0)) {
      return { error: 'Khách hàng không đủ điểm để sử dụng' };
    }

    const config = this.getPointConfig();
    const discount = points * Number(config.pointValue);
    const pointHistory = customer.pointHistory || [];

    pointHistory.push({
      type: 'use',
      points: -points,
      discount,
      reason: 'Sử dụng điểm khi thanh toán',
      createdAt: new Date().toISOString()
    });

    StorageService.update('crb_users', customerId, {
      loyaltyPoints: (customer.loyaltyPoints || 0) - points,
      pointHistory
    });

    return { success: true, discount };
  }
};