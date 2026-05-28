// Seed Data

(function seedDatabase() {

  // =========================
  // INIT STORAGE
  // =========================

  if (!localStorage.getItem('crb_initialized')) {

    // =========================
    // USERS
    // =========================

    const users = [

      // ADMIN
      {
        id: 1,
        fullName: 'Phạm Thu Hà',
        phone: '0901111111',
        email: 'admin@dieulinh.vn',
        address: 'Hà Nội',
        role: 'manager',
        passwordHash: btoa('12345678'),
        loyaltyPoints: 0,
        isActive: true,
        deleted: false,
        avatar: '',
        createdAt: new Date().toISOString()
      },

      // NHÂN VIÊN
      {
        id: 2,
        fullName: 'Bùi Thiện Phúc',
        phone: '0902222222',
        email: 'sale@dieulinh.vn',
        address: 'Hà Nội',
        role: 'sales',
        passwordHash: btoa('12345678'),
        loyaltyPoints: 0,
        isActive: true,
        deleted: false,
        avatar: '',
        createdAt: new Date().toISOString()
      },

      // KHÁCH HÀNG
      {
        id: 3,
        fullName: 'Nguyễn Minh Anh',
        phone: '0988888888',
        email: 'customer1@gmail.com',
        address: 'Cầu Giấy, Hà Nội',
        role: 'customer',
        passwordHash: btoa('12345678'),

        loyaltyPoints: 250,

        isActive: true,
        deleted: false,

        avatar: '',

        loyaltyHistory: [
          {
            type: 'earn',
            points: 250,
            description: 'Tích điểm từ đơn thuê',
            createdAt: new Date().toISOString()
          }
        ],

        editHistory: [],

        createdAt: new Date().toISOString()
      },

      {
        id: 4,
        fullName: 'Trần Thu Trang',
        phone: '0977777777',
        email: 'customer2@gmail.com',
        address: 'Đống Đa, Hà Nội',
        role: 'customer',
        passwordHash: btoa('12345678'),

        loyaltyPoints: 120,

        isActive: true,
        deleted: false,

        avatar: '',

        loyaltyHistory: [],

        editHistory: [],

        createdAt: new Date().toISOString()
      }

    ];

    localStorage.setItem(
      'crb_users',
      JSON.stringify(users)
    );

    // =========================
    // PRODUCTS
    // =========================

    const products = [

      {
        id: 1,
        name: 'Váy Dạ Hội Cao Cấp',
        category: 'Dạ hội',

        rentalPricePerDay: 350000,
        depositAmount: 1000000,

        stockQuantity: 5,

        status: 'available',

        images: [
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500'
        ],

        sizes: ['S', 'M', 'L'],
        colors: ['Đỏ', 'Đen'],

        createdAt: new Date().toISOString()
      },

      {
        id: 2,
        name: 'Áo Dài Truyền Thống',
        category: 'Áo dài',

        rentalPricePerDay: 250000,
        depositAmount: 500000,

        stockQuantity: 8,

        status: 'available',

        images: [
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500'
        ],

        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Trắng', 'Hồng'],

        createdAt: new Date().toISOString()
      },

      {
        id: 3,
        name: 'Vest Nam Hàn Quốc',
        category: 'Vest',

        rentalPricePerDay: 400000,
        depositAmount: 1200000,

        stockQuantity: 4,

        status: 'available',

        images: [
          'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500'
        ],

        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Xám'],

        createdAt: new Date().toISOString()
      }

    ];

    localStorage.setItem(
      'crb_products',
      JSON.stringify(products)
    );

    // =========================
    // CART
    // =========================

    localStorage.setItem(
      'crb_cart',
      JSON.stringify([])
    );

    // =========================
    // ĐƠN THUÊ
    // =========================

    const rentalOrders = [

      {
        id: 1,

        orderCode: 'DL1001',

        userId: 3,

        customerName: 'Nguyễn Minh Anh',
        customerPhone: '0988888888',
        customerEmail: 'customer1@gmail.com',
        customerAddress: 'Cầu Giấy, Hà Nội',

        deliveryMethod: 'store',
        paymentMethod: 'bank',

        items: [
          {
            productId: 1,
            productName: 'Váy Dạ Hội Cao Cấp',

            rentalStartDate: '2026-05-10',
            rentalEndDate: '2026-05-12',

            rentalDays: 2,

            pricePerDay: 350000,

            depositAmount: 1000000,

            subtotal: 700000
          }
        ],

        rentalTotal: 700000,
        depositTotal: 1000000,

        usedPoints: 0,
        pointDiscount: 0,

        totalAmount: 1700000,

        status: 'dang_thue',

        statusHistory: [
          {
            status: 'cho_xac_nhan',
            updatedAt: new Date().toISOString(),
            note: ''
          },
          {
            status: 'da_xac_nhan',
            updatedAt: new Date().toISOString(),
            note: ''
          },
          {
            status: 'dang_thue',
            updatedAt: new Date().toISOString(),
            note: ''
          }
        ],

        createdAt: new Date().toISOString()
      }

    ];

    localStorage.setItem(
      'crb_rental_orders',
      JSON.stringify(rentalOrders)
    );

    // =========================
    // LỊCH THỬ ĐỒ
    // =========================

    const fittingBookings = [

      {
        id: 1,

        userId: 3,

        customerName: 'Nguyễn Minh Anh',
        customerPhone: '0988888888',

        bookingDate: '2026-05-20',
        bookingTime: '18:00',

        productId: 1,
        productName: 'Váy Dạ Hội Cao Cấp',

        note: 'Muốn thử size M',

        status: 'cho_xac_nhan',

        createdAt: new Date().toISOString()
      }

    ];

    localStorage.setItem(
      'crb_fitting_bookings',
      JSON.stringify(fittingBookings)
    );

    // =========================
    // CẤU HÌNH TÍCH ĐIỂM
    // =========================

    const loyaltyConfig = {
      moneyPerPoint: 10000, // 10k = 1 điểm
      pointValue: 1000      // 1 điểm = 1k
    };

    localStorage.setItem(
      'crb_loyalty_config',
      JSON.stringify(loyaltyConfig)
    );

    // =========================
    // ĐÁNH DẤU ĐÃ KHỞI TẠO
    // =========================

    localStorage.setItem(
      'crb_initialized',
      'true'
    );

    console.log('Seed database completed');
  }

})();