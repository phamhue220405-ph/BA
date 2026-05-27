// Cart Module
const CartModule = {
  getCart(userId) {
    const all = StorageService.getAll('crb_cart');
    return all.filter(item => item.userId === userId && !item.deleted);
  },

  addItem(userId, productId, size, color, startDate, endDate) {
    const product = ProductModule.getById(productId);
    if (!product) return { error: 'Sản phẩm không tồn tại' };
    const days = calcRentalDays(startDate, endDate);
    const item = StorageService.save('crb_cart', {
      userId, productId,
      productName: product.name,
      productImage: product.images && product.images[0] ? product.images[0] : '',
      size, color,
      rentalStartDate: startDate,
      rentalEndDate: endDate,
      rentalDays: days,
      pricePerDay: product.rentalPricePerDay,
      depositAmount: product.depositAmount,
      subtotal: days * product.rentalPricePerDay,
    });
    this.updateCartBadge(userId);
    return { success: true, item };
  },

  updateItem(userId, itemId, changes) {
    const item = StorageService.getById('crb_cart', itemId);
    if (!item || item.userId !== userId) return { error: 'Không tìm thấy sản phẩm trong giỏ' };
    if (changes.rentalStartDate || changes.rentalEndDate) {
      const start = changes.rentalStartDate || item.rentalStartDate;
      const end = changes.rentalEndDate || item.rentalEndDate;
      changes.rentalDays = calcRentalDays(start, end);
      changes.subtotal = changes.rentalDays * item.pricePerDay;
    }
    StorageService.update('crb_cart', itemId, changes);
    this.updateCartBadge(userId);
    return { success: true };
  },

  removeItem(userId, itemId) {
    StorageService.softDelete('crb_cart', itemId);
    this.updateCartBadge(userId);
    return { success: true };
  },

  clearCart(userId) {
    const items = this.getCart(userId);
    items.forEach(item => StorageService.softDelete('crb_cart', item.id));
    this.updateCartBadge(userId);
  },

  getTotal(userId) {
    const items = this.getCart(userId);
    const rentalTotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const depositTotal = items.reduce((sum, i) => sum + i.depositAmount, 0);
    return { rentalTotal, depositTotal, total: rentalTotal + depositTotal, count: items.length };
  },

  getItemCount(userId) {
    return this.getCart(userId).length;
  },

  updateCartBadge(userId) {
    const count = this.getItemCount(userId);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => { b.textContent = count; b.style.display = count > 0 ? 'flex' : 'none'; });
  }
};


