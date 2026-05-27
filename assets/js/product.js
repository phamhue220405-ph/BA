// Product Module
const ProductModule = {
  getAll(filters = {}) {
    let products = StorageService.getAll('crb_products').filter(p => !p.isArchived && !p.deleted);
    if (filters.name) products = products.filter(p => p.name.toLowerCase().includes(filters.name.toLowerCase()));
    if (filters.categoryId) products = products.filter(p => p.categoryId === filters.categoryId);
    if (filters.size) products = products.filter(p => p.sizes && p.sizes.includes(filters.size));
    if (filters.color) products = products.filter(p => p.colors && p.colors.some(c => c.toLowerCase().includes(filters.color.toLowerCase())));
    return products;
  },

  getById(id) {
    return StorageService.getById('crb_products', id);
  },

  create(data) {
    const { name, categoryId, description, sizes, colors, rentalPricePerDay, depositAmount, images } = data;
    if (!name || !categoryId || !rentalPricePerDay) return { error: 'Thiếu thông tin bắt buộc' };
    const product = StorageService.save('crb_products', {
      name, categoryId, description: description || '',
      sizes: sizes || [], colors: colors || [],
      rentalPricePerDay: Number(rentalPricePerDay),
      depositAmount: Number(depositAmount) || 0,
      images: images || [],
      isArchived: false, history: []
    });
    return { success: true, product };
  },

  update(id, changes) {
    const existing = this.getById(id);
    if (!existing) return { error: 'Không tìm thấy sản phẩm' };
    const history = existing.history || [];
    history.push({ changedAt: new Date().toISOString(), previousValues: { ...existing } });
    const updated = StorageService.update('crb_products', id, { ...changes, history });
    return { success: true, product: updated };
  },

  archive(id) {
    StorageService.update('crb_products', id, { isArchived: true });
    return { success: true };
  },

  getCategories() {
    return StorageService.getAll('crb_categories').filter(c => !c.deleted);
  },

  createCategory(name) {
    const existing = this.getCategories().find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return { error: 'Danh mục đã tồn tại' };
    const cat = StorageService.save('crb_categories', { name, isDefault: false });
    return { success: true, category: cat };
  },

  updateCategory(id, name) {
    const dup = this.getCategories().find(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== id);
    if (dup) return { error: 'Tên danh mục đã tồn tại' };
    StorageService.update('crb_categories', id, { name });
    return { success: true };
  },

  deleteCategory(id) {
    const defaultCat = this.getCategories().find(c => c.isDefault);
    const targetId = defaultCat ? defaultCat.id : null;
    const products = StorageService.getAll('crb_products').filter(p => p.categoryId === id);
    products.forEach(p => StorageService.update('crb_products', p.id, { categoryId: targetId }));
    StorageService.softDelete('crb_categories', id);
    return { success: true };
  }
};


