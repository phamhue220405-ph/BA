// Customer Module
const CustomerModule = {
  getAll(filters = {}) {
    let customers = StorageService.getAll('crb_users').filter(u => u.role === 'customer' && !u.deleted);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      customers = customers.filter(u =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    }
    if (filters.sortByPoints) customers.sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));
    return customers;
  },

  getById(id) {
    return StorageService.getById('crb_users', id);
  },

  create(data) {
    const { fullName, phone, email, address } = data;
    if (!fullName || (!phone && !email)) return { error: 'Thiếu thông tin bắt buộc' };
    const users = StorageService.getAll('crb_users');
    const dup = users.find(u => (phone && u.phone === phone) || (email && u.email === email));
    if (dup) return { error: 'Số điện thoại hoặc email đã tồn tại' };
    const customer = StorageService.save('crb_users', {
      fullName, phone: phone || '', email: email || '', address: address || '',
      role: 'customer', passwordHash: btoa('default_crb_salt'),
      loyaltyPoints: 0, isActive: true, deleted: false,
      bankAccount: { bankName: '', accountNumber: '' }, avatar: ''
    });
    return { success: true, customer };
  },

  update(id, changes) {
    const existing = StorageService.getById('crb_users', id);
    if (!existing) return { error: 'Không tìm thấy khách hàng' };
    const history = existing.editHistory || [];
    history.push({ changedAt: new Date().toISOString(), previousValues: { fullName: existing.fullName, phone: existing.phone, email: existing.email, address: existing.address } });
    StorageService.update('crb_users', id, { ...changes, editHistory: history });
    return { success: true };
  },

  delete(id) {
    const orders = OrderModule.getRentalOrders({ userId: id }).filter(o => !['da_huy', 'da_tra_do'].includes(o.status));
    const bookings = OrderModule.getFittingBookings({ userId: id }).filter(b => b.status !== 'da_huy');
    if (orders.length > 0 || bookings.length > 0) {
      return { warning: true, message: `Khách hàng còn ${orders.length} đơn thuê và ${bookings.length} lịch thử đang hoạt động` };
    }
    StorageService.softDelete('crb_users', id);
    return { success: true };
  }
};


