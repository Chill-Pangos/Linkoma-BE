# 🏢 Linkoma Backend - Hệ thống quản lý chung cư

## 📖 Giới thiệu

Linkoma Backend là hệ thống quản lý chung cư được xây dựng với Node.js và Express.js. Hệ thống cung cấp các tính năng quản lý căn hộ, cư dân, dịch vụ, hóa đơn và dashboard cho admin.

## ✨ Tính năng chính

### 🏠 Quản lý căn hộ
- CRUD căn hộ và loại căn hộ
- Quản lý trạng thái căn hộ (available, rented, maintenance)
- Tự động đăng ký dịch vụ mặc định cho căn hộ mới

### 👥 Quản lý người dùng
- Xác thực và phân quyền JWT
- Phân quyền theo vai trò (admin, user)
- Quản lý thông tin cư dân

### 🔧 Quản lý dịch vụ
- **Dịch vụ mặc định**: Vệ sinh chung, Thu gom rác, Nước, Điện
- **Flow đăng ký dịch vụ**: Pending → Admin duyệt/từ chối → Active
- Chỉ dịch vụ Active mới có thể tạo hóa đơn

### 💰 Quản lý hóa đơn
- Tạo hóa đơn cho căn hộ với danh sách dịch vụ đã đăng ký
- Theo dõi trạng thái thanh toán
- Chi tiết sử dụng dịch vụ

### 📊 Dashboard Admin
- Thống kê doanh thu theo tháng
- Thống kê cư dân và tỷ lệ lấp đầy
- Tỷ lệ thu phí đúng hạn
- Phản hồi chưa xử lý và yêu cầu bảo trì
- Hoạt động gần đây với timestamp chính xác

## 🛠 Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MySQL với Sequelize ORM
- **Authentication**: JWT (JSON Web Token)
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Process Manager**: PM2

## 📦 Cài đặt và chạy project

### 1. Clone repository
```bash
git clone <repository-url>
cd linkoma-be
```

### 2. Cài đặt dependencies
```bash
yarn install
# hoặc
npm install
```

### 3. Cấu hình database

#### Tạo database MySQL:
```sql
CREATE DATABASE linkoma_db;
```

#### Tạo file `.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=linkoma_db
DB_USER=root
DB_PASSWORD=yourpassword

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (optional)
EMAIL_FROM=noreply@linkoma.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 4. Chạy project

#### Development mode:
```bash
yarn dev
# hoặc
npm run dev
```

#### Production mode:
```bash
yarn start
# hoặc
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 📚 API Documentation

API documentation có sẵn tại: `http://localhost:3000/v1/docs`

### Các endpoint chính:

#### Authentication:
- `POST /v1/auth/register` - Đăng ký
- `POST /v1/auth/login` - Đăng nhập
- `POST /v1/auth/refresh-tokens` - Làm mới token

#### Apartments:
- `GET /v1/apartments` - Danh sách căn hộ
- `POST /v1/apartments` - Tạo căn hộ mới
- `GET /v1/apartments/:id` - Chi tiết căn hộ
- `PATCH /v1/apartments/:id` - Cập nhật căn hộ

#### Service Registrations:
- `GET /v1/service-registrations/pending` - Đăng ký chờ duyệt
- `PATCH /v1/service-registrations/:id/approve` - Duyệt đăng ký
- `PATCH /v1/service-registrations/:id/reject` - Từ chối đăng ký
- `GET /v1/service-registrations/apartment/:id/active` - Dịch vụ active

#### Invoices:
- `GET /v1/invoices/apartment/:id/info` - Thông tin căn hộ cho tạo hóa đơn
- `POST /v1/invoices/create-improved` - Tạo hóa đơn cải tiến
- `GET /v1/invoices` - Danh sách hóa đơn

#### Admin Dashboard:
- `GET /v1/admin/dashboard-vn` - Dashboard tổng hợp
- `GET /v1/admin/dashboard/main-stats` - Thống kê chính
- `GET /v1/admin/dashboard/quick-overview` - Tổng quan nhanh
- `GET /v1/admin/dashboard/recent-activities-vn` - Hoạt động gần đây

## 🔄 Flow đăng ký dịch vụ

1. **Căn hộ mới**: Tự động đăng ký 4 dịch vụ mặc định (Active)
2. **Dịch vụ bổ sung**: 
   - User đăng ký → Status: `Pending`
   - Admin duyệt → Status: `Active`
   - Admin từ chối → Status: `Rejected`
3. **Tạo hóa đơn**: Chỉ dịch vụ `Active` mới hiển thị

## 🗂 Cấu trúc thư mục

```
src/
├── app.js                 # Express app configuration
├── index.js              # Server entry point
├── config/               # Database và cấu hình
├── controllers/          # Request handlers
├── middlewares/          # Custom middlewares
├── models/               # Sequelize models
├── routes/               # API routes
├── services/             # Business logic
├── utils/                # Utilities
├── validations/          # Input validation schemas
└── docs/                 # API documentation
```

## 🔑 Dịch vụ mặc định

Hệ thống tự động đăng ký 4 dịch vụ mặc định cho mọi căn hộ mới:

1. **Vệ sinh chung** - 50,000 VND/tháng
2. **Thu gom rác** - 30,000 VND/tháng  
3. **Nước** - 25,000 VND/khối
4. **Điện** - 3,500 VND/số

## 📊 Dashboard Features

### Main Stats:
- Doanh thu tháng (với % thay đổi)
- Số cư dân hiện tại
- Căn hộ có cư dân vs còn trống

### Quick Overview:
- Tỷ lệ lấp đầy (%)
- Tỷ lệ thu phí đúng hạn (%)
- Phản hồi chưa xử lý (số lượng)
- Yêu cầu bảo trì (số lượng)

### Recent Activities:
- Thanh toán hóa đơn (với timestamp)
- Yêu cầu bảo trì
- Cư dân mới chuyển vào

## 🚀 Deployment

### Sử dụng PM2:
```bash
# Cài đặt PM2
npm install -g pm2

# Start với PM2
pm2 start ecosystem.config.json

# Xem logs
pm2 logs

# Restart
pm2 restart linkoma-be
```

## 📝 License

This project is licensed under the MIT License.

---

🏢 **Linkoma** - Hệ thống quản lý chung cư thông minh
