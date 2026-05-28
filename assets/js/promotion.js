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
    const { code, discountType, discountValue, minOrderValue, startDate, endDate, usageLimit, target, categoryId, productIds } = data;
    if (!code || !discountType || !discountValue || !startDate || !endDate) return { error: 'Thiếu thông tin bắt buộc' };
    if (usageLimit !== undefined && usageLimit !== '' && (isNaN(Number(usageLimit)) || Number(usageLimit) < 0)) return { error: 'Số lượng mã không hợp lệ' };
    const allowedTargets = ['order', 'shipping', 'product'];
    if (target !== undefined && target !== '' && allowedTargets.indexOf(target) === -1) return { error: 'Loại áp dụng không hợp lệ' };
    if (target === 'product' && !categoryId) return { error: 'Vui lòng chọn danh mục sản phẩm' };
    if (!Validator.isDateBefore(startDate, endDate)) return { error: 'Ngày bắt đầu phải trước ngày kết thúc' };
    const promo = StorageService.save('crb_promotions', {
      code: code.toUpperCase(), discountType, discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0, startDate, endDate,
      usageLimit: usageLimit === '' || usageLimit === undefined ? null : Number(usageLimit),
      target: target && target !== '' ? target : 'order',
      categoryId: target === 'product' ? (categoryId || null) : null,
      productIds: target === 'product' ? (Array.isArray(productIds) ? productIds : []) : [],
      usageCount: 0, isActive: true
    });
    return { success: true, promo };
  },

  updateCode(id, changes) {
    if (changes.startDate && changes.endDate && !Validator.isDateBefore(changes.startDate, changes.endDate)) {
      return { error: 'Ngày bắt đầu phải trước ngày kết thúc' };
    }
    if (changes.usageLimit !== undefined && changes.usageLimit !== '' && (isNaN(Number(changes.usageLimit)) || Number(changes.usageLimit) < 0)) {
      return { error: 'Số lượng mã không hợp lệ' };
    }
    const allowedTargets = ['order', 'shipping', 'product'];
    if (changes.target !== undefined && changes.target !== '' && allowedTargets.indexOf(changes.target) === -1) return { error: 'Loại áp dụng không hợp lệ' };
    if (changes.target === 'product' && !changes.categoryId) return { error: 'Vui lòng chọn danh mục sản phẩm' };
    if (changes.usageLimit !== undefined) changes.usageLimit = changes.usageLimit === '' ? null : Number(changes.usageLimit);
    // Normalize product fields
    if (changes.target !== 'product') { changes.categoryId = null; changes.productIds = []; }
    else { changes.productIds = Array.isArray(changes.productIds) ? changes.productIds : []; }
    StorageService.update('crb_promotions', id, changes);
    return { success: true };
  },

  deleteCode(id) {
    StorageService.softDelete('crb_promotions', id);
    return { success: true };
  },

  // Posts
  getAllPosts(filters = {}) {
    let posts = StorageService.getAll('crb_posts').filter(p => !p.deleted);
    if (filters.onlyPublished) posts = posts.filter(p => p.isPublished);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase().includes(q) : false)
      );
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      if (!isNaN(start)) {
        posts = posts.filter(p => new Date(p.createdAt) >= start);
      }
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      if (!isNaN(end)) {
        end.setHours(23, 59, 59, 999);
        posts = posts.filter(p => new Date(p.createdAt) <= end);
      }
    }
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createPost(data) {
    const { title, content, images, categoryId, tags, isPublished } = data;
    const plainContent = (content || '').replace(/<[^>]+>/g, '').trim();
    if (!title || !content || !categoryId) return { error: 'Thiếu tiêu đề, nội dung hoặc danh mục' };
    if (title.trim().length > 120) return { error: 'Tiêu đề không được vượt quá 120 ký tự' };
    if (plainContent.length < 150) return { error: 'Nội dung phải tối thiểu 150 ký tự' };
    const post = StorageService.save('crb_posts', {
      title: title.trim(),
      content,
      images: Array.isArray(images) ? images : [],
      categoryId,
      tags: Array.isArray(tags) ? tags : [],
      isPublished: isPublished === undefined ? true : !!isPublished,
      createdBy: StorageService.getSession()?.userId || ''
    });
    return { success: true, post };
  },

  updatePost(id, changes) {
    if (changes.title && changes.title.trim().length > 120) {
      return { error: 'Tiêu đề không được vượt quá 120 ký tự' };
    }
    if (changes.content && changes.content.replace(/<[^>]+>/g, '').trim().length < 150) {
      return { error: 'Nội dung phải tối thiểu 150 ký tự' };
    }
    if (changes.categoryId !== undefined && !changes.categoryId) {
      return { error: 'Vui lòng chọn danh mục' };
    }
    if (changes.tags && !Array.isArray(changes.tags)) {
      changes.tags = String(changes.tags).split(',').map(t => t.trim()).filter(Boolean);
    }
    if (changes.images && !Array.isArray(changes.images)) {
      changes.images = Array.isArray(changes.images) ? changes.images : [];
    }
    StorageService.update('crb_posts', id, changes);
    return { success: true };
  },

  deletePost(id) {
    StorageService.softDelete('crb_posts', id);
    return { success: true };
  }
};


