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
    let orders = StorageService.getAll('crb_rental_orders');
    if (filters.userId) orders = orders.filter(o => o.userId === filters.userId);
    if (filters.status) orders = orders.filter(o => o.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(o =>
        o.orderRef?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.deliveryInfo?.phone?.includes(q)
      );
    }
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getRentalOrderById(id) {
    return StorageService.getById('crb_rental_orders', id);
  },

  updateRentalStatus(id, newStatus, staffId) {
    const order = this.getRentalOrderById(id);
    if (!order) return { error: 'Không tìm thấy đơn hàng' };
    const history = order.statusHistory || [];
    history.push({ status: newStatus, timestamp: new Date().toISOString(), updatedBy: staffId });
    const changes = { status: newStatus, statusHistory: history };
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

  cancelRentalOrder(id, cancelledBy) {
    const order = this.getRentalOrderById(id);
    if (!order) return { error: 'Không tìm thấy đơn hàng' };
    if (['dang_giao', 'dang_thue', 'da_tra_do'].includes(order.status)) {
      return { error: 'Không thể hủy đơn ở trạng thái này' };
    }
    const history = order.statusHistory || [];
    history.push({ status: 'da_huy', timestamp: new Date().toISOString(), updatedBy: cancelledBy });
    StorageService.update('crb_rental_orders', id, {
      status: 'da_huy',
      statusHistory: history,
      depositStatus: order.paymentStatus === 'paid' ? 'refunded' : order.depositStatus
    });
    return { success: true };
  },

  convertFittingToRental(fittingId) {
    const booking = this.getFittingBookingById(fittingId);
    if (!booking) return { error: 'Không tìm thấy lịch thử' };
    return { success: true, prefill: { userId: booking.userId, customerName: booking.customerName, phone: booking.customerPhone, products: booking.products } };
  },

  // ===== FITTING BOOKINGS =====
  checkSlotAvailability(date, timeSlot, maxPerSlot = 3) {
    const bookings = StorageService.getAll('crb_fitting_bookings').filter(
      b => b.preferredDate === date && b.timeSlot === timeSlot && b.status !== 'da_huy'
    );
    return bookings.length < maxPerSlot;
  },

  createFittingBooking(userId, data) {
    const { customerName, customerPhone, products, preferredDate, timeSlot, notes } = data;
    if (!customerName || !preferredDate || !timeSlot) return { error: 'Thiếu thông tin bắt buộc' };
    if (!this.checkSlotAvailability(preferredDate, timeSlot)) {
      return { error: 'Khung giờ này đã đầy, vui lòng chọn khung giờ khác' };
    }
    const booking = StorageService.save('crb_fitting_bookings', {
      bookingRef: StorageService.generateOrderRef('FB'),
      userId, customerName, customerPhone: customerPhone || '',
      products: products || [], preferredDate, timeSlot,
      status: 'cho_xac_nhan', notes: notes || ''
    });
    return { success: true, booking };
  },

  getFittingBookings(filters = {}) {
    let bookings = StorageService.getAll('crb_fitting_bookings');
    if (filters.userId) bookings = bookings.filter(b => b.userId === filters.userId);
    if (filters.status) bookings = bookings.filter(b => b.status === filters.status);
    if (filters.date) bookings = bookings.filter(b => b.preferredDate === filters.date);
    return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getFittingBookingById(id) {
    return StorageService.getById('crb_fitting_bookings', id);
  },

  updateFittingBooking(id, changes) {
    if (changes.preferredDate && changes.timeSlot) {
      if (!this.checkSlotAvailability(changes.preferredDate, changes.timeSlot)) {
        return { error: 'Khung giờ này đã đầy' };
      }
    }
    StorageService.update('crb_fitting_bookings', id, changes);
    return { success: true };
  },

  cancelFittingBooking(id) {
    StorageService.update('crb_fitting_bookings', id, { status: 'da_huy' });
    return { success: true };
  },

  // ===== RETURN =====
  initiateReturn(orderId, returnAddress) {
    const order = this.getRentalOrderById(orderId);
    if (!order) return { error: 'Không tìm thấy đơn hàng' };
    const penalty = this.calculateLatePenalty(orderId);
    StorageService.update('crb_rental_orders', orderId, { returnAddress, latePenalty: penalty });
    return { success: true, penalty };
  },

  calculateLatePenalty(orderId) {
    const order = this.getRentalOrderById(orderId);
    if (!order) return 0;
    const agreed = new Date(order.agreedReturnDate);
    const actual = new Date();
    if (actual <= agreed) return 0;
    const overdueDays = Math.ceil((actual - agreed) / (1000 * 60 * 60 * 24));
    const dailyRate = order.items?.reduce((s, i) => s + i.pricePerDay, 0) || 0;
    return overdueDays * dailyRate;
  }
};


