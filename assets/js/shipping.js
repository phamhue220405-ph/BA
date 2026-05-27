// Shipping Module
const ShippingModule = {
  getAll(filters = {}) {
    let methods = StorageService.getAll('crb_shipping_methods').filter(m => !m.deleted);
    if (filters.status) methods = methods.filter(m => m.status === filters.status);
    if (filters.search) methods = methods.filter(m => m.name.toLowerCase().includes(filters.search.toLowerCase()));
    return methods;
  },

  getActive() {
    return this.getAll({ status: 'active' });
  },

  getById(id) {
    return StorageService.getById('crb_shipping_methods', id);
  },

  create(data) {
    const { name, regions, costs, status, description } = data;
    if (!name) return { error: 'Thiếu tên phương thức vận chuyển' };
    // Prevent duplicate by name (case-insensitive)
    const existing = StorageService.getAll('crb_shipping_methods').filter(m => !m.deleted).find(m => m.name.toLowerCase() === name.toLowerCase());
    if (existing) return { error: 'Phương thức vận chuyển đã tồn tại' };
    const method = StorageService.save('crb_shipping_methods', {
      name,
      regions: regions || [], costs: costs || [],
      status: status || 'active',
      description: description || ''
    });
    return { success: true, method };
  },

  update(id, changes) {
    // If name is changing, ensure no other method uses the same name
    if (changes.name) {
      const name = changes.name;
      const others = StorageService.getAll('crb_shipping_methods').filter(m => !m.deleted && m.id !== id);
      if (others.find(m => m.name.toLowerCase() === name.toLowerCase())) return { error: 'Phương thức vận chuyển đã tồn tại' };
    }
    StorageService.update('crb_shipping_methods', id, changes);
    return { success: true };
  },

  suspend(id) {
    StorageService.update('crb_shipping_methods', id, { status: 'tam_ngung' });
    return { success: true };
  },

  activate(id) {
    StorageService.update('crb_shipping_methods', id, { status: 'active' });
    return { success: true };
  },

  delete(id) {
    StorageService.softDelete('crb_shipping_methods', id);
    return { success: true };
  },

  getCost(methodId, region) {
    const method = this.getById(methodId);
    if (!method) return 0;
    const costEntry = method.costs?.find(c => c.region === region);
    return costEntry ? costEntry.cost : 0;
  }
};


