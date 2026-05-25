# LuxRent - Website Đặt Lịch Thử & Thuê Trang Phục

Website thuần HTML/CSS/JavaScript, không cần backend. Dữ liệu lưu trong `localStorage`.

## Cách chạy

Mở `index.html` bằng trình duyệt hoặc dùng Live Server (VS Code extension).

> **Lưu ý:** Cần chạy qua HTTP server (Live Server, `npx serve`, v.v.) vì các trang dùng đường dẫn tuyệt đối (`/customer/...`, `/admin/...`).

```bash
# Dùng npx serve
npx serve .

# Hoặc Python
python -m http.server 8080
```

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Khách hàng | customer@test.com | Test@123 |
| Admin | admin@store.com | Admin@123 |
| Quản lý | manager@store.com | Manager@123 |
| Nhân viên bán hàng | sales@store.com | Sales@123 |
| Nhân viên kho | warehouse@store.com | Warehouse@123 |
| Marketing | marketing@store.com | Marketing@123 |

## Cấu trúc

```
├── index.html              # Trang chủ khách hàng
├── customer/               # Giao diện khách hàng
│   ├── login.html          # Đăng nhập / Đăng ký
│   ├── products.html       # Danh sách sản phẩm
│   ├── product-detail.html # Chi tiết sản phẩm
│   ├── cart.html           # Giỏ hàng
│   ├── fitting-booking.html# Đặt lịch thử (miễn phí)
│   ├── checkout.html       # Thanh toán đơn thuê
│   ├── orders.html         # Lịch sử đơn hàng
│   ├── order-detail.html   # Chi tiết đơn hàng
│   ├── profile.html        # Hồ sơ cá nhân
│   └── news.html           # Tin tức & Khuyến mãi
├── admin/                  # Giao diện quản trị (xanh-trắng)
│   ├── login.html          # Đăng nhập admin
│   ├── index.html          # Dashboard
│   ├── orders.html         # Quản lý đơn hàng
│   ├── fitting-bookings.html # Quản lý lịch thử
│   ├── products.html       # Quản lý sản phẩm
│   ├── categories.html     # Quản lý danh mục
│   ├── inventory.html      # Quản lý tồn kho
│   ├── customers.html      # Quản lý khách hàng
│   ├── staff.html          # Quản lý nhân viên
│   ├── shipping.html       # Quản lý vận chuyển
│   ├── promotions.html     # Quản lý mã khuyến mãi
│   ├── posts.html          # Quản lý bài viết
│   └── settings.html       # Cài đặt hệ thống
└── assets/
    ├── css/                # Stylesheet
    └── js/                 # JavaScript modules
```

## Tính năng chính

### Khách hàng
- Đăng ký / Đăng nhập với OTP (mô phỏng - xem console)
- Duyệt & tìm kiếm trang phục theo danh mục, size, màu
- **Đặt lịch thử**: Miễn phí, không cần thanh toán
- **Thuê trang phục**: Thêm giỏ hàng → Checkout → Thanh toán (mô phỏng)
- Theo dõi trạng thái đơn hàng
- Tích điểm & đổi điểm
- Xem tin tức & mã khuyến mãi

### Admin
- Dashboard tổng quan vận hành
- Quản lý đơn thuê & lịch thử
- Quản lý sản phẩm, danh mục, tồn kho
- Quản lý khách hàng & nhân viên (RBAC)
- Quản lý vận chuyển & khuyến mãi
- Báo cáo doanh thu
