// ===== Admin Common =====

// All staff can see all pages; edit rights controlled separately
const EDIT_PERMISSIONS = {
  'orders':            ['admin', 'manager', 'sales'],
  'fitting-bookings':  ['admin', 'manager', 'sales'],
  'products':          ['admin', 'manager', 'warehouse'],
  'categories':        ['admin', 'manager', 'warehouse'],
  'inventory':         ['admin', 'manager', 'warehouse'],
  'customers':         ['admin', 'manager', 'sales'],
  'staff':             ['admin'],
  'shipping':          ['admin', 'manager'],
  'shipping-costs':    ['admin', 'manager'],
  'shipping-orders':   ['admin', 'manager', 'warehouse', 'sales'],
  'promotions':        ['admin', 'manager', 'marketing'],
  'posts':             ['admin', 'manager', 'marketing'],
  'settings':          ['admin'],
};

function canEdit(pageId, role) {
  var allowed = EDIT_PERMISSIONS[pageId] || ['admin'];
  return allowed.indexOf(role) !== -1;
}

// IDs belonging to each group
var SHIPPING_IDS   = ['shipping-overview', 'shipping', 'shipping-costs', 'shipping-orders'];
var PROMO_IDS      = ['promotions', 'posts'];

var ROLE_LABELS = {
  admin: 'Quan tri vien', manager: 'Quan ly', accountant: 'Ke toan',
  warehouse: 'Nhan vien kho', sales: 'Nhan vien ban hang', marketing: 'Marketing'
};
var ROLE_LABELS_VI = {
  admin: 'Quản trị viên', manager: 'Quản lý', accountant: 'Kế toán',
  warehouse: 'Nhân viên kho', sales: 'Nhân viên bán hàng', marketing: 'Marketing'
};

function renderAdminSidebar(activeId, session) {
  var shippingOpen   = SHIPPING_IDS.indexOf(activeId) !== -1;
  var promotionsOpen = PROMO_IDS.indexOf(activeId) !== -1;
  var role = session.role;

  // Build nav HTML using string concatenation to avoid template literal issues
  var nav = '';

  // --- Tong quan ---
  nav += '<div class="sidebar-section">Tổng quan</div>';
  nav += sidebarLink('dashboard', '📊', 'Dashboard', '/admin/index.html', activeId);

  // --- Van hanh ---
  nav += '<div class="sidebar-section">Vận hành</div>';
  nav += sidebarLink('orders', '📦', 'Đơn thuê', '/admin/orders.html', activeId);
  nav += sidebarLink('fitting-bookings', '📅', 'Lịch thử', '/admin/fitting-bookings.html', activeId);

  // --- Kho hang ---
  nav += '<div class="sidebar-section">Kho hàng</div>';
  nav += sidebarLink('products', '👗', 'Sản phẩm', '/admin/products.html', activeId);
  nav += sidebarLink('categories', '🏷', 'Danh mục', '/admin/categories.html', activeId);
  nav += sidebarLink('inventory', '📋', 'Tồn kho', '/admin/inventory.html', activeId);

  // --- Khach hang ---
  nav += '<div class="sidebar-section">Khách hàng</div>';
  nav += sidebarLink('customers', '👥', 'Khách hàng', '/admin/customers.html', activeId);
  nav += sidebarLink('staff', '👤', 'Nhân viên', '/admin/staff.html', activeId);

  // --- Van chuyen group ---
  nav += '<div class="sidebar-section">Vận chuyển & Khuyến mại</div>';
  nav += sidebarGroup('shipping-group', '🚚', 'Vận chuyển', shippingOpen, [
    { id: 'shipping-overview', icon: '📊', label: 'Tổng quan',        href: '/admin/shipping-overview.html' },
    { id: 'shipping',          icon: '🚚', label: 'Phương thức VC',   href: '/admin/shipping.html' },
    { id: 'shipping-costs',    icon: '💰', label: 'Chi phí VC',       href: '/admin/shipping-costs.html' },
    { id: 'shipping-orders',   icon: '📬', label: 'Đơn vận chuyển',   href: '/admin/shipping-orders.html' },
  ], activeId);

  // --- Khuyen mai group ---
  nav += sidebarGroup('promotions-group', '🎁', 'Khuyến mại', promotionsOpen, [
    { id: 'promotions', icon: '🎟', label: 'Mã khuyến mại', href: '/admin/promotions.html' },
    { id: 'posts',      icon: '📰', label: 'Bài viết',      href: '/admin/posts.html' },
  ], activeId);

  // --- Cai dat ---
  nav += sidebarLink('settings', '⚙️', 'Cài đặt', '/admin/settings.html', activeId);

  var roleLabel = ROLE_LABELS_VI[role] || role;

  return '<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>'
    + '<aside class="admin-sidebar" id="adminSidebar">'
    +   '<button class="sidebar-collapse-btn" id="sidebarCollapseBtn" onclick="toggleCollapse()" title="Thu/mở sidebar">‹</button>'
    +   '<div class="sidebar-header">'
    +     '<div class="sidebar-brand">'
    +       '<img src="/assets/images/logo.png" alt="Diệu Linh" class="site-logo site-logo-small">'
    +     '</div>'
    +   '</div>'
    +   '<a href="/admin/profile.html" class="sidebar-user">'
    +     '<div style="display:flex;align-items:center;gap:10px">'
    +       '<div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">👤</div>'
    +       '<div class="sidebar-user-info">'
    +         '<div class="sidebar-user-name">' + session.fullName + '</div>'
    +         '<div class="sidebar-user-role">' + roleLabel + '</div>'
    +       '</div>'
    +     '</div>'
    +   '</a>'
    +   '<nav class="sidebar-nav">' + nav + '</nav>'
    +   '<div class="sidebar-footer">'
    +     '<button class="sidebar-logout" onclick="doAdminLogout()">🚪 <span class="sidebar-logout-label">Đăng xuất</span></button>'
    +   '</div>'
    + '</aside>';
}

function sidebarLink(id, icon, label, href, activeId) {
  var cls = 'sidebar-link' + (id === activeId ? ' active' : '');
  return '<a href="' + href + '" class="' + cls + '" data-label="' + label + '">'
    + '<span class="sidebar-link-icon">' + icon + '</span>' + label
    + '</a>';
}

function sidebarGroup(groupId, icon, label, isOpen, children, activeId) {
  var childActive = children.some(function(c) { return c.id === activeId; });
  var btnCls = 'sidebar-group-btn' + (childActive ? ' active' : '');
  var arrow  = isOpen ? '▾' : '▸';
  var display = isOpen ? 'block' : 'none';

  var childrenHtml = '';
  children.forEach(function(c) {
    var cls = 'sidebar-link sidebar-child-link' + (c.id === activeId ? ' active' : '');
    childrenHtml += '<a href="' + c.href + '" class="' + cls + '" data-label="' + c.label + '">'
      + '<span class="sidebar-link-icon">' + c.icon + '</span>' + c.label
      + '</a>';
  });

  return '<div class="sidebar-group">'
    + '<button class="' + btnCls + '" onclick="toggleGroup(\'' + groupId + '\')" data-label="' + label + '">'
    +   '<span class="sidebar-link-icon">' + icon + '</span>'
    +   '<span style="flex:1">' + label + '</span>'
    +   '<span class="sidebar-group-arrow" id="arrow-' + groupId + '">' + arrow + '</span>'
    + '</button>'
    + '<div class="sidebar-group-children" id="group-' + groupId + '" style="display:' + display + '">'
    +   childrenHtml
    + '</div>'
    + '</div>';
}

function toggleGroup(groupId) {
  var el    = document.getElementById('group-' + groupId);
  var arrow = document.getElementById('arrow-' + groupId);
  if (!el) return;
  var isOpen = el.style.display !== 'none';
  el.style.display  = isOpen ? 'none' : 'block';
  if (arrow) arrow.textContent = isOpen ? '▸' : '▾';
}

function doAdminLogout() {
  StorageService.clearSession();
  window.location.href = '/admin/login.html';
}

function toggleSidebar() {
  var sb      = document.getElementById('adminSidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sb) sb.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}

function closeSidebar() {
  var sb      = document.getElementById('adminSidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sb) sb.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

function toggleCollapse() {
  var sb   = document.getElementById('adminSidebar');
  var main = document.querySelector('.admin-main');
  var btn  = document.getElementById('sidebarCollapseBtn');
  if (!sb) return;
  var collapsed = sb.classList.toggle('collapsed');
  if (main) main.classList.toggle('sidebar-collapsed', collapsed);
  if (btn)  btn.textContent = collapsed ? '›' : '‹';
  localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
}

// Inject mobile toggle button + restore collapse state
document.addEventListener('DOMContentLoaded', function() {
  // Mobile toggle
  var topbar = document.querySelector('.admin-topbar');
  if (topbar) {
    var btn = document.createElement('button');
    btn.className = 'sidebar-toggle';
    btn.innerHTML = '☰';
    btn.onclick = toggleSidebar;
    topbar.insertBefore(btn, topbar.firstChild);
  }
  // Restore collapse state
  if (localStorage.getItem('sidebarCollapsed') === '1') {
    var sb   = document.getElementById('adminSidebar');
    var main = document.querySelector('.admin-main');
    var colBtn = document.getElementById('sidebarCollapseBtn');
    if (sb) sb.classList.add('collapsed');
    if (main) main.classList.add('sidebar-collapsed');
    if (colBtn) colBtn.textContent = '›';
  }
});

// ===== Pagination =====
function paginate(items, page, perPage) {
  perPage = perPage || 20;
  var total      = items.length;
  var totalPages = Math.ceil(total / perPage);
  var start      = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: total, totalPages: totalPages, page: page, perPage: perPage
  };
}

function renderPagination(containerId, data, onPageChange) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var page = data.page, totalPages = data.totalPages, total = data.total, perPage = data.perPage;
  var start = (page - 1) * perPage + 1;
  var end   = Math.min(page * perPage, total);

  if (totalPages <= 1) {
    container.innerHTML = '<div class="pagination"><div class="pagination-info">Tổng: ' + total + '</div></div>';
    return;
  }

  var btns = '';
  btns += '<button class="page-btn" onclick="' + onPageChange + '(' + (page-1) + ')"' + (page<=1?' disabled':'') + '>‹</button>';
  for (var i = Math.max(1, page-2); i <= Math.min(totalPages, page+2); i++) {
    btns += '<button class="page-btn' + (i===page?' active':'') + '" onclick="' + onPageChange + '(' + i + ')">' + i + '</button>';
  }
  btns += '<button class="page-btn" onclick="' + onPageChange + '(' + (page+1) + ')"' + (page>=totalPages?' disabled':'') + '>›</button>';

  container.innerHTML = '<div class="pagination">'
    + '<div class="pagination-info">Hiển thị ' + start + '-' + end + ' / ' + total + '</div>'
    + '<div class="pagination-btns">' + btns + '</div>'
    + '</div>';
}



