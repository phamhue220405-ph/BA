// StorageService - Central localStorage management
class StorageService {
  static getAll(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error(`StorageService.getAll(${key}):`, e);
      return [];
    }
  }

  static getById(key, id) {
    const items = this.getAll(key);
    return items.find(item => String(item.id) === String(id)) || null;
  }

  static save(key, item) {
    try {
      const items = this.getAll(key);
      const newItem = { ...item, id: item.id || this.generateId(), createdAt: item.createdAt || new Date().toISOString() };
      items.push(newItem);
      localStorage.setItem(key, JSON.stringify(items));
      return newItem;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        Toast.show('Bộ nhớ trình duyệt đầy, vui lòng xóa dữ liệu cũ', 'error');
      }
      throw e;
    }
  }

  static update(key, id, changes) {
    try {
      const items = this.getAll(key);
      const idx = items.findIndex(item => String(item.id) === String(id));
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...changes, updatedAt: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(items));
      return items[idx];
    } catch (e) {
      console.error(`StorageService.update(${key}, ${id}):`, e);
      return null;
    }
  }

  static delete(key, id) {
    try {
      const items = this.getAll(key).filter(item => String(item.id) !== String(id));
      localStorage.setItem(key, JSON.stringify(items));
      return true;
    } catch (e) {
      return false;
    }
  }

  static softDelete(key, id) {
    return this.update(key, id, { deleted: true, deletedAt: new Date().toISOString() });
  }

  static setSession(userData) {
    localStorage.setItem('crb_session', JSON.stringify(userData));
  }

  static getSession() {
    try {
      const raw = localStorage.getItem('crb_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  static clearSession() {
    localStorage.removeItem('crb_session');
  }

  static generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  static generateOrderRef(prefix = 'RO') {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${date}-${rand}`;
  }

  static setRaw(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static getRaw(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
}


