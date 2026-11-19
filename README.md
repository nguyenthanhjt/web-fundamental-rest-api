# Course 6 — Booking API (NestJS, Authentication & Authorization, TypeORM)

Hệ thống API đặt lịch dịch vụ (Booking API) phát triển trên nền tảng NestJS, sử dụng cơ sở dữ liệu PostgreSQL (thông qua TypeORM) và áp dụng cơ chế xác thực **Stateless Authentication (JWT)** cùng kiểm soát quyền truy cập **Authorization**.

Prefix chung của toàn bộ API: `/api/v1`.

Tài liệu bài tập: [EXERCISE.md](EXERCISE.md) · [EXERCISE.en.md](EXERCISE.en.md).

---

## 1. Cấu hình Môi trường & Credentials (`.env`)

Dự án sử dụng các biến môi trường để cấu hình kết nối database và chữ ký bảo mật JWT. 

### Bước 1: Tạo file `.env` từ file mẫu `.env.example`
```bash
cp .env.example .env
```

### Bước 2: Điền thông tin Credentials trong `.env`

File `.env` gồm các tham số sau:

| Biến | Ý nghĩa | Mặc định gợi ý | Ghi chú |
| :--- | :--- | :--- | :--- |
| `PORT` | Cổng HTTP server lắng nghe | `3000` | Tùy chọn |
| `DB_HOST` | Địa chỉ máy chủ PostgreSQL | `localhost` | Dùng `localhost` khi chạy dev |
| `DB_PORT` | Cổng kết nối PostgreSQL | `5432` | Cổng mặc định của PostgreSQL |
| `DB_USER` | Tên đăng nhập database | `postgres` | Hoặc user bạn tạo trong Docker |
| `DB_PASSWORD` | Mật khẩu database | `postgres` | Khớp với mật khẩu DB |
| `DB_NAME` | Tên cơ sở dữ liệu | `course-6` | Tên database của dự án |
| `DB_SYNCHRONIZE` | Tự động đồng bộ cấu trúc bảng | `true` | Chỉ bật `true` trong môi trường dev |
| `JWT_SECRET` | Khóa bí mật ký và xác thực JWT | *Xem lưu ý bên dưới* | **Bắt buộc: tối thiểu 32 ký tự** |

> [!IMPORTANT]
> **Quy định về `JWT_SECRET`**:
> Package `@nestjs/authentication` sử dụng thuật toán HMAC SHA-256 (`HS256`) theo tiêu chuẩn RFC 7518. Do đó, `JWT_SECRET` **bắt buộc phải có độ dài tối thiểu 32 ký tự (32 bytes)**. Nếu ngắn hơn, server sẽ báo lỗi khi khởi động.
> 
> *Ví dụ:* `super-secret-key-with-at-least-32-characters-length`

---

## 2. Khởi chạy Database

Chạy PostgreSQL bằng Docker Container:

```bash
docker run --name course-6-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=course-6 \
  -p 5432:5432 \
  -d postgres:16-alpine
```

*(Đảm bảo `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` khớp với thông tin bạn cấu hình trong `.env`).*

---

## 3. Cài đặt & Khởi động Server

```bash
# Cài đặt dependencies
pnpm install

# Chạy ở chế độ development (watch mode)
pnpm start:dev

# Hoặc chạy thông thường
pnpm start
```

Server sẽ chạy tại: `http://localhost:3000`

---

## 4. Danh sách Routes & APIs

Hệ thống được bảo vệ bởi cơ chế Global Guard của `@nestjs/authentication`. Mọi endpoint không đánh dấu `@Public()` đều yêu cầu gửi kèm Bearer Token qua header:
```http
Authorization: Bearer <your_access_token>
```

### 4.1. Authentication (`/api/v1/auth`)

| Method | Path | Quyền | Body | Phản hồi thành công | Lỗi |
|:---|:---|:---|:---|:---|:---|
| `POST` | `/api/v1/auth/sign-up` | Public | `{ "name": string, "email": string, "password": string }` | `201 Created` - Trả về user info | `400` email trùng / sai định dạng |
| `POST` | `/api/v1/auth/sign-in` | Public | `{ "email": string, "password": string }` | `200 OK` - `{ accessToken, expiresIn, refreshToken }` | `400` sai email hoặc mật khẩu |
| `POST` | `/api/v1/auth/refresh` | Public | `{ "refreshToken": string }` (chuỗi token) | `200 OK` - Cặp token mới | `400` / `401` token không hợp lệ hoặc hết hạn |

### 4.2. Users (`/api/v1/users`)

| Method | Path | Quyền | Body | Phản hồi thành công | Lỗi |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/users` | **Protected** | Không | `200 OK` - Thông tin user hiện tại (`id`, `name`, `email`) | `401 Unauthorized` |

### 4.3. Services (`/api/v1/services`)

| Method | Path | Quyền | Body | Phản hồi thành công | Lỗi |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/services` | Public | Không | `200 OK` - Danh sách dịch vụ | |
| `GET` | `/api/v1/services/:id` | Public | Không | `200 OK` - Chi tiết 1 dịch vụ | `404 Not Found` |
| `GET` | `/api/v1/services/:serviceId/reviews` | Public | Không | `200 OK` - Danh sách reviews của dịch vụ | `404 Not Found` (nếu dịch vụ không tồn tại) |
| `POST` | `/api/v1/services/:serviceId/reviews` | **Protected** | `{ "rating": number (1-5), "comment"?: string }` | `201 Created` - Tạo review (gắn với `authorId` của user) | `400` thiếu/sai rating, `401` chưa đăng nhập, `404` sai serviceId |

### 4.4. Reviews (`/api/v1/reviews`)

| Method | Path | Quyền | Body | Phản hồi thành công | Lỗi |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/reviews/:id` | Public | Không | `200 OK` - Chi tiết review | `404 Not Found` |
| `PUT` | `/api/v1/reviews/:id` | **Protected** (Owner) | `{ "rating": number (1-5), "comment"?: string }` | `200 OK` - Thay thế nội dung review | `400`, `401`, `403` không phải chủ bài review, `404` |
| `PATCH` | `/api/v1/reviews/:id` | **Protected** (Owner) | `{ "rating"?: number, "comment"?: string }` | `200 OK` - Cập nhật một phần review | `400` empty body, `401`, `403` không phải chủ bài review, `404` |
| `DELETE` | `/api/v1/reviews/:id` | **Protected** (Owner) | Không | `204 No Content` | `401`, `403` không phải chủ bài review, `404` |

### 4.5. Bookings (`/api/v1/bookings`)

*Toàn bộ API Bookings đều yêu cầu xác thực. Người dùng chỉ xem, cập nhật và xóa các booking do chính mình tạo ra (`customerId`).*

| Method | Path | Quyền | Body | Phản hồi thành công | Lỗi |
|:---|:---|:---|:---|:---|:---|
| `POST` | `/api/v1/bookings` | **Protected** | `{ "serviceId": string, "date": "YYYY-MM-DD", "timeSlot": "HH:mm", "customerName": string }` | `201 Created` - Server gán `id`, `customerId`, `status: PENDING` | `400` thiếu trường, `401`, `404` sai serviceId |
| `GET` | `/api/v1/bookings` | **Protected** | Không | `200 OK` - Danh sách booking của user hiện tại | `401 Unauthorized` |
| `GET` | `/api/v1/bookings/:id` | **Protected** (Owner) | Không | `200 OK` - Chi tiết booking | `401`, `403` không phải chủ booking, `404` |
| `PUT` | `/api/v1/bookings/:id` | **Protected** (Owner) | `{ "serviceId": string, "date": string, "timeSlot": string, "customerName": string }` | `200 OK` - Cập nhật toàn bộ booking | `400`, `401`, `403`, `404` |
| `PATCH` | `/api/v1/bookings/:id` | **Protected** (Owner) | `{ "serviceId"?: string, "date"?: string, "timeSlot"?: string, "customerName"?: string }` | `200 OK` - Cập nhật một phần booking | `400` empty body, `401`, `403`, `404` |
| `DELETE` | `/api/v1/bookings/:id` | **Protected** (Owner) | Không | `204 No Content` | `401`, `403`, `404` |

---

## 5. Hướng dẫn thử nghiệm API (Try the API với `curl`)

### Bước 1: Đăng ký tài khoản (`Sign-up`)
```bash
curl -X POST http://localhost:3000/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Nguyen",
    "email": "alex@example.com",
    "password": "password123"
  }'
```

### Bước 2: Đăng nhập lấy JWT Token (`Sign-in`)
```bash
curl -X POST http://localhost:3000/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "password123"
  }'
```
*Kết quả trả về sẽ có `accessToken` và `refreshToken`. Lưu `accessToken` để sử dụng ở các bước sau.*

### Bước 3: Đặt biến TOKEN (Linux/macOS terminal hoặc thay trực tiếp vào curl)
```bash
export TOKEN="<access_token_nhận_được_ở_bước_2>"
```

### Bước 4: Lấy thông tin user hiện tại (`Me`)
```bash
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### Bước 5: Xem danh sách dịch vụ (Public)
```bash
curl http://localhost:3000/api/v1/services
curl http://localhost:3000/api/v1/services/svc_001
```

### Bước 6: Đặt lịch dịch vụ (`Bookings` - Yêu cầu Token)
```bash
# Tạo booking
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "svc_001",
    "date": "2026-11-20",
    "timeSlot": "14:00",
    "customerName": "Alex Nguyen"
  }'

# Xem danh sách booking của bạn
curl http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN"

# Xem chi tiết booking (ví dụ bkg_001)
curl http://localhost:3000/api/v1/bookings/bkg_001 \
  -H "Authorization: Bearer $TOKEN"

# Cập nhật booking (PATCH)
curl -X PATCH http://localhost:3000/api/v1/bookings/bkg_001 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timeSlot": "15:00"
  }'

# Hủy booking (DELETE)
curl -X DELETE http://localhost:3000/api/v1/bookings/bkg_001 \
  -H "Authorization: Bearer $TOKEN"
```

### Bước 7: Đánh giá dịch vụ (`Reviews` - Yêu cầu Token khi tạo/sửa/xóa)
```bash
# Tạo review cho dịch vụ svc_001
curl -X POST http://localhost:3000/api/v1/services/svc_001/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Dịch vụ rất chu đáo và đúng giờ!"
  }'

# Xem danh sách review của dịch vụ svc_001 (Public)
curl http://localhost:3000/api/v1/services/svc_001/reviews

# Xem chi tiết một review (Public, ví dụ rvw_001)
curl http://localhost:3000/api/v1/reviews/rvw_001

# Chỉnh sửa review của chính mình (ví dụ rvw_001)
curl -X PATCH http://localhost:3000/api/v1/reviews/rvw_001 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Dịch vụ tốt, phục vụ nhanh chóng"
  }'

# Xóa review của chính mình
curl -X DELETE http://localhost:3000/api/v1/reviews/rvw_001 \
  -H "Authorization: Bearer $TOKEN"
```

### Dữ liệu mẫu (Seed Data)
Các mã dịch vụ mẫu có sẵn trong hệ thống: `svc_001`, `svc_002`.
