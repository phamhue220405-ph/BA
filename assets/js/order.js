// Order Module
const OrderModule = {
  // ===== RENTAL ORDERS =====
  createRentalOrder(userId, cartItems, deliveryInfo, shippingMethodId, shippingCost, orderSource, paymentStatus = 'pending') {
    const subtotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
    const depositTotal = cartItems.reduce((s, i) => s + i.depositAmount, 0);
    const agreedReturnDate = cartItems.reduce((latest, i) => {
      return i.rentalEndDate > latest ? i.rentalEndDate : latest;
    }, cartItems[0]?.rentalEndDate || '');

    const order = StorageService.save('crb_rental_orders', {
      orderRef: StorageService.generateOrderRef('RO'),
      shippingTrackingRef: StorageService.generateOrderRef('TR'),
      userId,
      customerName: deliveryInfo.recipientName,
      items: cartItems,
      deliveryInfo,
      shippingMethodId: shippingMethodId || null,
      shippingCost: shippingCost || 0,
      orderSource: orderSource || null,
      subtotal,
      depositTotal,
      discountAmount: 0,
      promotionCode: null,
      loyaltyPointsUsed: 0,
      totalAmount: subtotal + depositTotal + (shippingCost || 0),
      paymentMethod: null,
      paymentStatus: paymentStatus || 'pending',
      depositStatus: 'held',
      status: 'cho_xac_nhan',
      deliveryStatus: 'cho_xac_nhan',
      returnAddress: null,
      latePenalty: 0,
      agreedReturnDate,
      actualReturnDate: null,
      statusHistory: [{ status: 'cho_xac_nhan', timestamp: new Date().toISOString(), updatedBy: userId }],
    });
    return { success: true, order };
  },

  getRentalOrders(filters = {}) {
    let orders = StorageService.getAll('crb_rental_orders')
      .filter(o => !o.deleted)
      .map(o => ({
        ...o,
        deliveryStatus: o.deliveryStatus || this.getDeliveryStatusForOrderStatus(o.status)
      }));

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
    const order = StorageService.getById('crb_rental_orders', id);
    if (!order) return null;
    if (!order.deliveryStatus) {
      order.deliveryStatus = this.getDeliveryStatusForOrderStatus(order.status);
    }
    return order;
  },

  getDeliveryStatusForOrderStatus(orderStatus) {
    const map = {
      cho_xac_nhan: 'cho_xac_nhan',
      da_xac_nhan: 'dang_chuan_bi',
      dang_giao: 'dang_giao',
      da_giao: 'da_giao',
      dang_thue: 'da_giao',
      da_tra_do: 'da_giao',
      da_huy: 'da_huy'
    };
    return map[orderStatus] || 'cho_xac_nhan';
  },

  updateRentalStatus(id, newStatus, staffId) {
    const order = this.getRentalOrderById(id);
    if (!order) return { error: 'Không tìm thấy đơn hàng' };
    const history = order.statusHistory || [];
    history.push({ status: newStatus, timestamp: new Date().toISOString(), updatedBy: staffId });
    const changes = {
      status: newStatus,
      statusHistory: history,
      deliveryStatus: this.getDeliveryStatusForOrderStatus(newStatus)
    };
    if (newStatus === 'da_tra_do') {
      changes.actualReturnDate = new Date().toISOString();
      changes.depositStatus = 'refunded';
      changes.paymentStatus = 'refunded';
      // Add loyalty points
      const config = StorageService.getRaw('crb_loyalty_config') || { rate: 10000, maxPct: 20 };
      const pts = Math.floor(order.totalAmount / config.rate);
      const user = StorageService.getById('crb_users', order.userId);
      if (user) StorageService.update('crb_users', order.userId, { loyaltyPoints: (user.loyaltyPoints || 0) + pts });
    }
    StorageService.update('crb_rental_orders', id, changes);
    return { success: true };
  },

  updateRentalPaymentStatus(id, paymentStatus, staffId) {
    const order = this.getRentalOrderById(id);
    if (!order) return { error: 'Không tìm thấy đơn hàng' };
    const changes = { paymentStatus };
    if (paymentStatus === 'refunded') {
      changes.depositStatus = order.depositStatus === 'held' ? 'refunded' : order.depositStatus;
    }
    StorageService.update('crb_rental_orders', id, changes);
    return { success: true };
  },

  updateRentalOrder(id, changes) {
    const order = this.getRentalOrderById(id);
    if (!order) return { error: 'Không tìm thấy đơn hàng' };
    const updated = { ...changes };
    if (changes.status) {
      updated.deliveryStatus = this.getDeliveryStatusForOrderStatus(changes.status);
    }
    StorageService.update('crb_rental_orders', id, { ...updated, updatedAt: new Date().toISOString() });
    return { success: true };
  },

  cancelRentalOrder(id, cancelledBy) {
    const order = this.getRentalOrderById(id);
    if (!order) return { error: 'Không tìm thấy đơn thuê' };
    if (order.status === 'da_huy') return { error: 'Đơn thuê đã bị hủy' };

    const history = order.statusHistory || [];
    history.push({ status: 'da_huy', timestamp: new Date().toISOString(), updatedBy: cancelledBy || order.userId });

    StorageService.update('crb_rental_orders', id, {
      status: 'da_huy',
      deliveryStatus: 'da_huy',
      statusHistory: history,
      note: 'Khách hàng hủy đơn',
      updatedAt: new Date().toISOString()
    });

    return { success: true };
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