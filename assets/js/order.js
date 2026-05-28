// Order Module
const OrderModule = {

  // =========================
  // ĐƠN THUÊ TRANG PHỤC
  // =========================

  getRentalOrders(filters = {}) {
    let orders = StorageService.getAll('crb_rental_orders')
      .filter(o => !o.deleted);

    // lọc theo user
    if (filters.userId) {
      orders = orders.filter(o => o.userId === filters.userId);
    }

    // lọc theo trạng thái
    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status);
    }

    // tìm kiếm
    if (filters.search) {
      const q = filters.search.toLowerCase();

      orders = orders.filter(o =>
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q) ||
        o.customerEmail?.toLowerCase().includes(q)
      );
    }

    // mới nhất trước
    orders.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return orders;
  },

  getRentalOrderById(id) {
    return StorageService.getById('crb_rental_orders', id);
  },

  createRentalOrder(data) {

    const {
      userId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      deliveryMethod,
      paymentMethod,
      items,
      rentalTotal,
      depositTotal,
      usedPoints = 0,
      pointDiscount = 0,
      totalAmount
    } = data;

    if (!customerName || !customerPhone) {
      return { error: 'Thiếu thông tin khách hàng' };
    }

    if (!items || !items.length) {
      return { error: 'Đơn thuê không có sản phẩm' };
    }

    const orderCode = 'DL' + Date.now();

    const order = StorageService.save('crb_rental_orders', {
      orderCode,

      userId,

      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      customerAddress: customerAddress || '',

      deliveryMethod,
      paymentMethod,

      items,

      rentalTotal,
      depositTotal,

      usedPoints,
      pointDiscount,

      totalAmount,

      status: 'cho_xac_nhan',

      createdAt: new Date().toISOString(),

      statusHistory: [
        {
          status: 'cho_xac_nhan',
          updatedAt: new Date().toISOString(),
          note: 'Khởi tạo đơn thuê'
        }
      ]
    });

    return {
      success: true,
      order
    };
  },

  updateRentalOrder(id, changes) {

    const existing = this.getRentalOrderById(id);

    if (!existing) {
      return { error: 'Không tìm thấy đơn thuê' };
    }

    // lưu lịch sử trạng thái
    let statusHistory = existing.statusHistory || [];

    if (changes.status && changes.status !== existing.status) {

      statusHistory.push({
        status: changes.status,
        updatedAt: new Date().toISOString(),
        note: changes.note || ''
      });

      changes.statusHistory = statusHistory;
    }

    StorageService.update(
      'crb_rental_orders',
      id,
      changes
    );

    return {
      success: true
    };
  },

  cancelRentalOrder(id) {

    const order = this.getRentalOrderById(id);

    if (!order) {
      return { error: 'Không tìm thấy đơn thuê' };
    }

    if (order.status === 'da_huy') {
      return { error: 'Đơn thuê đã bị hủy' };
    }

    this.updateRentalOrder(id, {
      status: 'da_huy',
      note: 'Khách hàng hủy đơn'
    });

    return {
      success: true
    };
  },

  completeRentalOrder(id) {

    const order = this.getRentalOrderById(id);

    if (!order) {
      return { error: 'Không tìm thấy đơn thuê' };
    }

    this.updateRentalOrder(id, {
      status: 'da_tra_do',
      note: 'Hoàn thành đơn thuê'
    });

    // =========================
    // TÍCH ĐIỂM
    // =========================

    if (window.CustomerModule?.addPoints) {

      const config = CustomerModule.getPointConfig
        ? CustomerModule.getPointConfig()
        : {
            moneyPerPoint: 10000
          };

      const earnedPoints = Math.floor(
        Number(order.totalAmount || 0) /
        Number(config.moneyPerPoint || 10000)
      );

      if (earnedPoints > 0) {

        CustomerModule.addPoints(
          order.userId,
          earnedPoints,
          `Tích điểm từ đơn thuê ${order.orderCode}`
        );
      }
    }

    return {
      success: true
    };
  },

  // =========================
  // ĐẶT LỊCH THỬ ĐỒ
  // =========================

  getFittingBookings(filters = {}) {

    let bookings = StorageService.getAll('crb_fitting_bookings')
      .filter(b => !b.deleted);

    if (filters.userId) {
      bookings = bookings.filter(
        b => b.userId === filters.userId
      );
    }

    if (filters.status) {
      bookings = bookings.filter(
        b => b.status === filters.status
      );
    }

    bookings.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return bookings;
  },

  createFittingBooking(data) {

    const {
      userId,
      customerName,
      customerPhone,
      bookingDate,
      bookingTime,
      productId,
      productName,
      note
    } = data;

    if (
      !customerName ||
      !customerPhone ||
      !bookingDate ||
      !bookingTime
    ) {
      return {
        error: 'Thiếu thông tin đặt lịch'
      };
    }

    // kiểm tra trùng lịch
    const exists = this.getFittingBookings()
      .find(b =>
        b.bookingDate === bookingDate &&
        b.bookingTime === bookingTime &&
        b.status !== 'da_huy'
      );

    if (exists) {
      return {
        error: 'Khung giờ đã được đặt'
      };
    }

    const booking = StorageService.save(
      'crb_fitting_bookings',
      {
        userId,

        customerName,
        customerPhone,

        bookingDate,
        bookingTime,

        productId,
        productName,

        note: note || '',

        status: 'cho_xac_nhan',

        createdAt: new Date().toISOString()
      }
    );

    return {
      success: true,
      booking
    };
  },

  updateFittingBooking(id, changes) {

    const existing = StorageService.getById(
      'crb_fitting_bookings',
      id
    );

    if (!existing) {
      return {
        error: 'Không tìm thấy lịch thử'
      };
    }

    StorageService.update(
      'crb_fitting_bookings',
      id,
      changes
    );

    return {
      success: true
    };
  },

  cancelFittingBooking(id) {

    return this.updateFittingBooking(id, {
      status: 'da_huy'
    });
  },

  // =========================
  // DASHBOARD
  // =========================

  getStatistics() {

    const orders = this.getRentalOrders();

    const revenue = orders
      .filter(o => o.status !== 'da_huy')
      .reduce((sum, o) =>
        sum + Number(o.totalAmount || 0),
      0);

    const totalOrders = orders.length;

    const activeOrders = orders.filter(o =>
      ['cho_xac_nhan', 'da_xac_nhan', 'dang_thue']
        .includes(o.status)
    ).length;

    const completedOrders = orders.filter(
      o => o.status === 'da_tra_do'
    ).length;

    return {
      revenue,
      totalOrders,
      activeOrders,
      completedOrders
    };
  }
};