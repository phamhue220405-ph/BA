// Inventory Module
const InventoryModule = {
  getStock(productId, size) {
    const items = StorageService.getAll('crb_inventory');
    return items.find(i => i.productId === productId && i.size === size) || null;
  },

  getAllStock() {
    return StorageService.getAll('crb_inventory');
  },

  updateStock(productId, size, newQty, staffId) {
    const existing = this.getStock(productId, size);
    const previousQty = existing ? existing.quantity : 0;
    const historyEntry = { changedAt: new Date().toISOString(), changedBy: staffId, previousQty, newQty };
    if (existing) {
      const history = [...(existing.history || []), historyEntry];
      StorageService.update('crb_inventory', existing.id, {
        quantity: newQty,
        status: newQty === 0 ? 'ngung_ban' : 'active',
        history
      });
    } else {
      StorageService.save('crb_inventory', {
        productId, size, quantity: newQty,
        status: newQty === 0 ? 'ngung_ban' : 'active',
        conditionNotes: '', conditionImage: '',
        history: [historyEntry]
      });
    }
    const threshold = StorageService.getRaw('crb_low_stock_threshold') || 3;
    if (newQty > 0 && newQty <= threshold) {
      Toast.show(`Cảnh báo: Tồn kho thấp cho sản phẩm (còn ${newQty})`, 'warning');
    }
    return { success: true };
  },

  getLowStockItems(threshold) {
    const t = threshold || StorageService.getRaw('crb_low_stock_threshold') || 3;
    return StorageService.getAll('crb_inventory').filter(i => i.quantity > 0 && i.quantity <= t);
  },

  getProductHistory(productId) {
    return StorageService.getAll('crb_inventory').filter(i => i.productId === productId);
  },

  recordCondition(productId, size, notes, imageBase64) {
    const item = this.getStock(productId, size);
    if (item) StorageService.update('crb_inventory', item.id, { conditionNotes: notes, conditionImage: imageBase64 || '' });
    return { success: true };
  },

  checkConflicts(productId, startDate, endDate) {
    const orders = StorageService.getAll('crb_rental_orders').filter(o =>
      !['da_huy', 'da_tra_do'].includes(o.status) &&
      o.items?.some(i => i.productId === productId)
    );
    return orders.filter(o => {
      const oStart = o.items?.find(i => i.productId === productId)?.rentalStartDate;
      const oEnd = o.items?.find(i => i.productId === productId)?.rentalEndDate;
      if (!oStart || !oEnd) return false;
      return !(endDate <= oStart || startDate >= oEnd);
    });
  }
};


