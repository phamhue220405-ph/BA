// Promotion Module
const PromotionModule = {
  // Promo Codes
  getAllCodes(filters = {}) {
    let codes = StorageService.getAll('crb_promotions').filter(p => !p.deleted);
    const now = new Date();
    if (filters.status === 'active') codes = codes.filter(p => p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now);
    else if (filters.status === 'scheduled') codes = codes.filter(p => new Date(p.startDate) > now);
    else if (filters.status === 'expired') codes = codes.filter(p => new Date(p.endDate) < now);
    if (filters.search) codes = codes.filter(p => p.code.toLowerCase().includes(filters.search.toLowerCase()));
    return codes;
  },

  createCode(data) {
    const { code, discountType, discountValue, minOrderValue, startDate, endDate } = data;
    if (!code || !discountType || !discountValue || !startDate || !endDate) return { error: 'Thiếu thông tin bắt buộc' };
    if (!Validator.isDateBefore(startDate, endDate)) return { error: 'Ngày bắt đầu phải trước ngày kết thúc' };
    const promo = StorageService.save('crb_promotions', {
      code: code.toUpperCase(), discountType, discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0, startDate, endDate,
      usageCount: 0, isActive: true
    });
    return { success: true, promo };
  },

  updateCode(id, changes) {
    if (changes.startDate && changes.endDate && !Validator.isDateBefore(changes.startDate, changes.endDate)) {
      return { error: 'Ngày bắt đầu phải trước ngày kết thúc' };
    }
    StorageService.update('crb_promotions', id, changes);
    return { success: true };
  },

  deleteCode(id) {
    StorageService.softDelete('crb_promotions', id);
    return { success: true };
  },

  // Posts
  getAllPosts(onlyPublished = false) {
    let posts = StorageService.getAll('crb_posts').filter(p => !p.deleted);
    if (onlyPublished) posts = posts.filter(p => p.isPublished);
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createPost(data) {
    const { title, content, images } = data;
    if (!title || !content) return { error: 'Thiếu tiêu đề hoặc nội dung' };
    const session = StorageService.getSession();
    const post = StorageService.save('crb_posts', {
      title, content, images: images || [],
      isPublished: true, createdBy: session?.userId || ''
    });
    return { success: true, post };
  },

  updatePost(id, changes) {
    StorageService.update('crb_posts', id, changes);
    return { success: true };
  },

  deletePost(id) {
    StorageService.softDelete('crb_posts', id);
    return { success: true };
  }
};


