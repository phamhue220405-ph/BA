// Validator
const Validator = {
  isRequired: (value) => value !== null && value !== undefined && String(value).trim() !== '',
  isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  isPhone: (value) => /^(0|\+84)[3-9]\d{8}$/.test(value),
  isPasswordMatch: (p1, p2) => p1 === p2,
  isMinLength: (value, min) => String(value).length >= min,
  isDateBefore: (date1, date2) => new Date(date1) < new Date(date2),
  isNotEmpty: (value) => String(value).trim() !== '',
  isPositiveNumber: (value) => !isNaN(value) && Number(value) > 0,
};

// Toast Notification
const Toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info') {
    this.init();
    const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.style.cssText = `background:${colors[type]};color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;min-width:280px;max-width:400px;animation:slideIn 0.3s ease;`;
    toast.innerHTML = `<span style="font-size:16px">${icons[type]}</span><span>${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

// Calculate rental days
function calcRentalDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

// Status labels
const STATUS_LABELS = {
  cho_xac_nhan: 'Chờ xác nhận',
  da_xac_nhan: 'Đã xác nhận',
  dang_giao: 'Đang giao',
  dang_thue: 'Đang thuê',
  da_tra_do: 'Đã trả đồ',
  da_huy: 'Đã hủy',
  dang_chuan_bi: 'Đang chuẩn bị',
  da_giao: 'Đã giao',
  hoan_thanh: 'Hoàn thành',
};

const STATUS_COLORS = {
  cho_xac_nhan: '#f59e0b',
  da_xac_nhan: '#3b82f6',
  dang_giao: '#8b5cf6',
  dang_thue: '#06b6d4',
  da_tra_do: '#22c55e',
  da_huy: '#ef4444',
  dang_chuan_bi: '#f97316',
  da_giao: '#10b981',
  hoan_thanh: '#22c55e',
};

// Alert dialog - show message and wait for OK
function showAlert(message, onOk) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:24px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <p style="margin:0 0 20px;font-size:16px;color:#374151;">${message}</p>
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button id="alert-ok" style="padding:8px 20px;border:none;border-radius:6px;background:#22c55e;color:#fff;cursor:pointer;font-size:14px;">OK</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#alert-ok').onclick = () => { overlay.remove(); if (onOk) onOk(); };
}

// Confirm dialog
function showConfirm(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:24px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <p style="margin:0 0 20px;font-size:16px;color:#374151;">${message}</p>
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button id="confirm-cancel" style="padding:8px 20px;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;font-size:14px;">Hủy</button>
        <button id="confirm-ok" style="padding:8px 20px;border:none;border-radius:6px;background:#ef4444;color:#fff;cursor:pointer;font-size:14px;">Xác nhận</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#confirm-cancel').onclick = () => overlay.remove();
  overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); onConfirm(); };
}

// Success dialog with OK button
function showSuccess(message, onOk) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:28px 24px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;">
      <div style="font-size:48px;margin-bottom:12px">✅</div>
      <p style="margin:0 0 24px;font-size:16px;color:#374151;font-weight:500;">${message}</p>
      <button id="success-ok" style="padding:10px 32px;border:none;border-radius:6px;background:#22c55e;color:#fff;cursor:pointer;font-size:15px;font-weight:600;">OK</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#success-ok').onclick = () => { overlay.remove(); if (onOk) onOk(); };
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(style);

// Debounce helper
function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// Get URL param helper
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}


