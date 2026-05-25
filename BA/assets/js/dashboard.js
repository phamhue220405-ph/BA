// Dashboard Module
const DashboardModule = {
  getSummary() {
    const orders = StorageService.getAll('crb_rental_orders');
    const bookings = StorageService.getAll('crb_fitting_bookings');
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return {
      activeOrders: orders.filter(o => !['da_huy', 'da_tra_do'].includes(o.status)).length,
      todayFittings: bookings.filter(b => b.preferredDate === today && b.status !== 'da_huy').length,
      dueSoon: orders.filter(o => o.status === 'dang_thue' && o.agreedReturnDate && new Date(o.agreedReturnDate) <= in48h && new Date(o.agreedReturnDate) > now).length,
      overdue: orders.filter(o => o.status === 'dang_thue' && o.agreedReturnDate && new Date(o.agreedReturnDate) < now).length,
      totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.subtotal || 0), 0),
    };
  },

  getOverdueOrders() {
    const now = new Date();
    return StorageService.getAll('crb_rental_orders').filter(o =>
      o.status === 'dang_thue' && o.agreedReturnDate && new Date(o.agreedReturnDate) < now
    );
  },

  getDailyTasks(staffId, role) {
    const today = new Date().toISOString().slice(0, 10);
    const tasks = [];
    if (['admin', 'manager', 'sales'].includes(role)) {
      const pendingOrders = StorageService.getAll('crb_rental_orders').filter(o => o.status === 'cho_xac_nhan');
      tasks.push(...pendingOrders.map(o => ({ type: 'order', label: `Xác nhận đơn ${o.orderRef}`, id: o.id })));
      const todayFittings = StorageService.getAll('crb_fitting_bookings').filter(b => b.preferredDate === today && b.status === 'cho_xac_nhan');
      tasks.push(...todayFittings.map(b => ({ type: 'fitting', label: `Lịch thử ${b.bookingRef} - ${b.customerName}`, id: b.id })));
    }
    if (['admin', 'manager', 'warehouse'].includes(role)) {
      const readyToShip = StorageService.getAll('crb_rental_orders').filter(o => o.status === 'da_xac_nhan');
      tasks.push(...readyToShip.map(o => ({ type: 'ship', label: `Chuẩn bị giao đơn ${o.orderRef}`, id: o.id })));
    }
    return tasks;
  },

  getRevenueReport(period = 'month') {
    const orders = StorageService.getAll('crb_rental_orders').filter(o => o.paymentStatus === 'paid');
    const now = new Date();
    let filtered = orders;
    if (period === 'day') filtered = orders.filter(o => o.createdAt?.slice(0, 10) === now.toISOString().slice(0, 10));
    else if (period === 'week') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      filtered = orders.filter(o => new Date(o.createdAt) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = orders.filter(o => new Date(o.createdAt) >= monthAgo);
    }
    return {
      count: filtered.length,
      revenue: filtered.reduce((s, o) => s + (o.subtotal || 0), 0),
      orders: filtered
    };
  },

  searchOrders(query, filters = {}) {
    return OrderModule.getRentalOrders({ ...filters, search: query });
  }
};


