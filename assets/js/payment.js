// Payment Module
const PaymentModule = {
  processPayment(orderId, method, amount) {
    const order = OrderModule.getRentalOrderById(orderId);
    if (!order) return { error: 'Không tìm thấy đơn hàng' };
    StorageService.update('crb_rental_orders', orderId, {
      paymentMethod: method,
      paymentStatus: 'paid',
      status: 'da_xac_nhan',
      statusHistory: [...(order.statusHistory || []), { status: 'da_xac_nhan', timestamp: new Date().toISOString(), updatedBy: order.userId }]
    });
    return { success: true };
  },

  applyPromoCode(orderId, code) {
    const order = OrderModule.getRentalOrderById(orderId);
    if (!order) return { error: 'Không tìm thấy đơn hàng' };
    const promos = StorageService.getAll('crb_promotions');
    const now = new Date();
    const promo = promos.find(p => p.code === code && p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now);
    if (!promo) return { error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' };
    if (order.subtotal < promo.minOrderValue) return { error: `Đơn hàng tối thiểu ${formatCurrency(promo.minOrderValue)} để áp dụng mã này` };
    let discount = 0;
    if (promo.discountType === 'percentage') discount = Math.floor(order.subtotal * promo.discountValue / 100);
    else discount = promo.discountValue;
    const newTotal = order.totalAmount - discount;
    StorageService.update('crb_rental_orders', orderId, { discountAmount: discount, promotionCode: code, totalAmount: newTotal });
    StorageService.update('crb_promotions', promo.id, { usageCount: (promo.usageCount || 0) + 1 });
    return { success: true, discount, newTotal };
  },

  applyLoyaltyPoints(orderId, userId, points) {
    const order = OrderModule.getRentalOrderById(orderId);
    const user = StorageService.getById('crb_users', userId);
    if (!order || !user) return { error: 'Không tìm thấy thông tin' };
    const config = StorageService.getRaw('crb_loyalty_config') || { rate: 10000, maxPct: 20 };
    const maxDiscount = Math.floor(order.totalAmount * config.maxPct / 100);
    const pointValue = points * config.rate / 1000; // 1 point = rate/1000 VND
    const discount = Math.min(pointValue, maxDiscount);
    if (user.loyaltyPoints < points) return { error: 'Không đủ điểm tích lũy' };
    StorageService.update('crb_rental_orders', orderId, { loyaltyPointsUsed: points, totalAmount: order.totalAmount - discount });
    StorageService.update('crb_users', userId, { loyaltyPoints: user.loyaltyPoints - points });
    return { success: true, discount };
  },

  processDepositRefund(orderId) {
    StorageService.update('crb_rental_orders', orderId, { depositStatus: 'refunded' });
    return { success: true };
  },

  registerBankAccount(userId, bankData) {
    StorageService.update('crb_users', userId, { bankAccount: bankData });
    return { success: true };
  }
};


