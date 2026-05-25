// Seed initial data
function seedData() {
  if (localStorage.getItem('crb_seeded')) return;

  // Categories
  const cats = [
    { id: 'cat1', name: 'Áo dài', isDefault: false, createdAt: new Date().toISOString() },
    { id: 'cat2', name: 'Váy cưới', isDefault: false, createdAt: new Date().toISOString() },
    { id: 'cat3', name: 'Trang phục dạ hội', isDefault: false, createdAt: new Date().toISOString() },
    { id: 'cat4', name: 'Chưa phân loại', isDefault: true, createdAt: new Date().toISOString() },
  ];
  localStorage.setItem('crb_categories', JSON.stringify(cats));

  // Products
  const products = [
    { id: 'p1', name: 'Áo dài cưới đỏ thêu hoa', categoryId: 'cat1', description: 'Áo dài cưới truyền thống màu đỏ, thêu hoa tinh xảo, phù hợp cho ngày cưới.', sizes: ['S', 'M', 'L', 'XL'], colors: ['Đỏ', 'Hồng'], rentalPricePerDay: 350000, depositAmount: 1500000, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4e5b?w=400'], isArchived: false, history: [], createdAt: new Date().toISOString() },
    { id: 'p2', name: 'Váy cưới công chúa trắng', categoryId: 'cat2', description: 'Váy cưới phong cách công chúa, đuôi dài, ren tinh tế.', sizes: ['S', 'M', 'L'], colors: ['Trắng', 'Kem'], rentalPricePerDay: 800000, depositAmount: 3000000, images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=400'], isArchived: false, history: [], createdAt: new Date().toISOString() },
    { id: 'p3', name: 'Đầm dạ hội xanh sapphire', categoryId: 'cat3', description: 'Đầm dạ hội sang trọng màu xanh sapphire, phù hợp tiệc tối.', sizes: ['S', 'M', 'L', 'XL'], colors: ['Xanh sapphire', 'Đen'], rentalPricePerDay: 500000, depositAmount: 2000000, images: ['https://images.unsplash.com/photo-1566479179817-c0b5b4b4b4b4?w=400'], isArchived: false, history: [], createdAt: new Date().toISOString() },
    { id: 'p4', name: 'Áo dài tím hoa văn', categoryId: 'cat1', description: 'Áo dài màu tím với hoa văn truyền thống, thanh lịch.', sizes: ['S', 'M', 'L'], colors: ['Tím', 'Tím nhạt'], rentalPricePerDay: 280000, depositAmount: 1200000, images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400'], isArchived: false, history: [], createdAt: new Date().toISOString() },
    { id: 'p5', name: 'Váy cưới đuôi cá', categoryId: 'cat2', description: 'Váy cưới kiểu đuôi cá ôm sát, tôn dáng hoàn hảo.', sizes: ['S', 'M', 'L'], colors: ['Trắng', 'Ngà'], rentalPricePerDay: 900000, depositAmount: 3500000, images: ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400'], isArchived: false, history: [], createdAt: new Date().toISOString() },
    { id: 'p6', name: 'Đầm dạ hội đỏ rượu', categoryId: 'cat3', description: 'Đầm dạ hội màu đỏ rượu quyến rũ, thiết kế vai trần.', sizes: ['S', 'M', 'L', 'XL'], colors: ['Đỏ rượu', 'Đỏ'], rentalPricePerDay: 450000, depositAmount: 1800000, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400'], isArchived: false, history: [], createdAt: new Date().toISOString() },
    { id: 'p7', name: 'Áo dài xanh ngọc', categoryId: 'cat1', description: 'Áo dài màu xanh ngọc tươi sáng, phù hợp lễ hội.', sizes: ['S', 'M', 'L', 'XL'], colors: ['Xanh ngọc', 'Xanh lá'], rentalPricePerDay: 300000, depositAmount: 1300000, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4e5b?w=400'], isArchived: false, history: [], createdAt: new Date().toISOString() },
    { id: 'p8', name: 'Đầm dạ hội vàng gold', categoryId: 'cat3', description: 'Đầm dạ hội màu vàng gold lộng lẫy, phù hợp tiệc sang trọng.', sizes: ['S', 'M', 'L'], colors: ['Vàng gold', 'Vàng champagne'], rentalPricePerDay: 600000, depositAmount: 2500000, images: ['https://images.unsplash.com/photo-1566479179817-c0b5b4b4b4b4?w=400'], isArchived: false, history: [], createdAt: new Date().toISOString() },
  ];
  localStorage.setItem('crb_products', JSON.stringify(products));

  // Inventory
  const inventory = [];
  products.forEach(p => {
    p.sizes.forEach(size => {
      inventory.push({ id: `inv_${p.id}_${size}`, productId: p.id, size, quantity: Math.floor(Math.random() * 5) + 2, status: 'active', conditionNotes: 'Tốt', conditionImage: '', history: [], updatedAt: new Date().toISOString() });
    });
  });
  localStorage.setItem('crb_inventory', JSON.stringify(inventory));

  // Users
  const users = [
    { id: 'u_admin', fullName: 'Quản trị viên', email: 'admin@store.com', phone: '0901000001', passwordHash: btoa('Admin@123_crb_salt'), role: 'admin', address: '123 Đường ABC, TP.HCM', avatar: '', loyaltyPoints: 0, bankAccount: { bankName: '', accountNumber: '' }, isActive: true, deleted: false, createdAt: new Date().toISOString() },
    { id: 'u_manager', fullName: 'Nguyễn Thị Quản Lý', email: 'manager@store.com', phone: '0901000002', passwordHash: btoa('Manager@123_crb_salt'), role: 'manager', address: '', avatar: '', loyaltyPoints: 0, bankAccount: { bankName: '', accountNumber: '' }, isActive: true, deleted: false, createdAt: new Date().toISOString() },
    { id: 'u_sales', fullName: 'Trần Văn Bán Hàng', email: 'sales@store.com', phone: '0901000003', passwordHash: btoa('Sales@123_crb_salt'), role: 'sales', address: '', avatar: '', loyaltyPoints: 0, bankAccount: { bankName: '', accountNumber: '' }, isActive: true, deleted: false, createdAt: new Date().toISOString() },
    { id: 'u_warehouse', fullName: 'Lê Thị Kho', email: 'warehouse@store.com', phone: '0901000004', passwordHash: btoa('Warehouse@123_crb_salt'), role: 'warehouse', address: '', avatar: '', loyaltyPoints: 0, bankAccount: { bankName: '', accountNumber: '' }, isActive: true, deleted: false, createdAt: new Date().toISOString() },
    { id: 'u_marketing', fullName: 'Phạm Văn Marketing', email: 'marketing@store.com', phone: '0901000005', passwordHash: btoa('Marketing@123_crb_salt'), role: 'marketing', address: '', avatar: '', loyaltyPoints: 0, bankAccount: { bankName: '', accountNumber: '' }, isActive: true, deleted: false, createdAt: new Date().toISOString() },
    { id: 'u_customer', fullName: 'Nguyễn Văn Khách', email: 'customer@test.com', phone: '0901234567', passwordHash: btoa('Test@123_crb_salt'), role: 'customer', address: '456 Đường XYZ, TP.HCM', avatar: '', loyaltyPoints: 150, bankAccount: { bankName: 'Vietcombank', accountNumber: '1234567890' }, isActive: true, deleted: false, createdAt: new Date().toISOString() },
  ];
  localStorage.setItem('crb_users', JSON.stringify(users));

  // Shipping methods
  const shipping = [
    { id: 'sh1', name: 'Giao hàng nhanh', estimatedDays: 1, regions: ['TP.HCM', 'Hà Nội', 'Đà Nẵng'], costs: [{ region: 'TP.HCM', cost: 30000 }, { region: 'Hà Nội', cost: 50000 }, { region: 'Đà Nẵng', cost: 40000 }], status: 'active', createdAt: new Date().toISOString() },
    { id: 'sh2', name: 'Giao hàng tiêu chuẩn', estimatedDays: 3, regions: ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'], costs: [{ region: 'TP.HCM', cost: 20000 }, { region: 'Hà Nội', cost: 35000 }, { region: 'Đà Nẵng', cost: 28000 }, { region: 'Cần Thơ', cost: 25000 }], status: 'active', createdAt: new Date().toISOString() },
  ];
  localStorage.setItem('crb_shipping_methods', JSON.stringify(shipping));

  // Promotions
  const promos = [
    { id: 'promo1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderValue: 500000, startDate: new Date(Date.now() - 86400000).toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString(), usageCount: 5, isActive: true, createdAt: new Date().toISOString() },
    { id: 'promo2', code: 'SUMMER50K', discountType: 'fixed', discountValue: 50000, minOrderValue: 300000, startDate: new Date(Date.now() - 86400000).toISOString(), endDate: new Date(Date.now() + 15 * 86400000).toISOString(), usageCount: 12, isActive: true, createdAt: new Date().toISOString() },
  ];
  localStorage.setItem('crb_promotions', JSON.stringify(promos));

  // Posts
  const posts = [
    { id: 'post1', title: 'Bộ sưu tập áo dài mùa cưới 2025', content: '<p>Chào mừng bạn đến với bộ sưu tập áo dài cưới mới nhất của chúng tôi. Với hơn 50 mẫu áo dài được thiết kế tinh tế, chúng tôi tự hào mang đến cho bạn những lựa chọn hoàn hảo cho ngày trọng đại.</p><p>Đặt lịch thử ngay hôm nay để nhận ưu đãi đặc biệt!</p>', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4e5b?w=600'], isPublished: true, createdBy: 'u_marketing', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'post2', title: 'Khuyến mãi thuê váy cưới tháng 6', content: '<p>Nhân dịp mùa cưới tháng 6, chúng tôi giảm giá 15% cho tất cả các đơn thuê váy cưới. Sử dụng mã <strong>WELCOME10</strong> khi thanh toán để nhận ưu đãi.</p>', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600'], isPublished: true, createdBy: 'u_marketing', createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];
  localStorage.setItem('crb_posts', JSON.stringify(posts));

  // Config
  localStorage.setItem('crb_loyalty_config', JSON.stringify({ rate: 10000, maxPct: 20 }));
  localStorage.setItem('crb_low_stock_threshold', JSON.stringify(3));
  localStorage.setItem('crb_audit_log', JSON.stringify([]));

  localStorage.setItem('crb_seeded', '1');
  console.log('[Seed] Dữ liệu mẫu đã được khởi tạo');
}

seedData();


