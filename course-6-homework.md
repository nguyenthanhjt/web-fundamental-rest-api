# Course 6 — Authentication với access token và refresh token

## Cách chạy

1. Sao chép `.env.example` thành `.env`, rồi đặt `JWT_ACCESS_SECRET` là một chuỗi ngẫu nhiên dài. Không dùng giá trị mặc định khi deploy.
2. Khởi động PostgreSQL: `docker compose up -d`.
3. Cài dependency (nếu chưa có) và chạy API: `npm install`, sau đó `npm run start:dev`.

API chạy tại `http://localhost:3000/api/v1`. TypeORM tự tạo bảng `users` khi chạy môi trường không phải production. Production nên tắt `synchronize` và dùng migration.

## API xác thực

| Endpoint | Body | Kết quả |
| --- | --- | --- |
| `POST /auth/register` | `{ "email": "user@example.com", "password": "password123" }` | Tạo tài khoản và trả token pair |
| `POST /auth/login` | như trên | Trả token pair mới |
| `POST /auth/refresh` | `{ "refreshToken": "..." }` | Kiểm tra refresh token và xoay token pair |
| `POST /auth/logout` | không có | Cần `Authorization: Bearer <accessToken>`; thu hồi refresh token hiện hành |

Response đăng nhập/đăng ký/refresh có dạng:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "<user-id>.<random-secret>",
  "accessTokenExpiresIn": 900
}
```

Bookings yêu cầu access token cho toàn bộ endpoint. Các thao tác ghi review (`POST`, `PUT`, `PATCH`) yêu cầu access token; endpoint đọc service/review vẫn công khai. Riêng `DELETE /bookings/:id` và `DELETE /reviews/:id` cần quyền `ADMIN`. Gửi access token theo header:

```http
Authorization: Bearer <accessToken>
```

## Cơ chế hoạt động

1. Khi register/login, mật khẩu được băm bằng `scrypt` với salt riêng. Database không lưu mật khẩu thô.
2. Server tạo **access token** JWT HS256 có `sub`, `email`, `iat`, `exp`; thời hạn mặc định 15 phút. Guard xác thực chữ ký và thời hạn ở mọi endpoint được bảo vệ.
3. `TokenService` đồng thời tạo **refresh token** opaque, ngẫu nhiên và một lần dùng. Hash SHA-256 cùng family, thời hạn, claims và trạng thái đã dùng được lưu trong bảng `auth_refresh_tokens`.
4. Khi gọi `/auth/refresh`, `TokenService` kiểm tra refresh token qua `TypeOrmRefreshTokenStore`, đánh dấu token cũ đã dùng và phát token pair mới. Nếu refresh token cũ bị dùng lại, cả family bị revoke để xử lý tình huống token bị đánh cắp.
5. Logout gọi `revokeAll(userId)` để thu hồi mọi refresh-token family của user. Access token đã phát hành chỉ sống tối đa 15 phút; sau đó không thể làm mới phiên nữa.

## Lý do chọn giải pháp

Access JWT ngắn hạn giúp API kiểm tra request không cần truy vấn database trên mỗi lần gọi, phù hợp REST API và dễ mở rộng ngang. Nếu access token bị lộ, khoảng tác động được giới hạn bởi thời hạn ngắn.

Refresh token là chuỗi ngẫu nhiên, không phải JWT, được package lưu server-side dưới dạng hash để có thể thu hồi, rotation và phát hiện reuse. Cách này tránh phải lưu refresh token thô trong database; nếu database lộ, kẻ tấn công không thể dùng trực tiếp hash để đổi token. Đổi lại hệ thống phải truy vấn database khi refresh — đây là chi phí nhỏ vì refresh không xảy ra ở mỗi request.

Trong frontend production, refresh token nên đặt trong cookie `HttpOnly`, `Secure`, `SameSite` thay vì body/local storage để giảm rủi ro XSS. Bài này nhận nó ở body để có thể kiểm thử trực tiếp bằng Postman/curl; HTTPS vẫn là bắt buộc khi triển khai thật.

## Authorization: Role-Based Access Control (RBAC)

Ngoài authentication, API áp dụng RBAC với hai vai trò được lưu trong cột `users.role`:

| Role | Quyền |
| --- | --- |
| `USER` | Đăng nhập, tạo/cập nhật booking và tạo/cập nhật review |
| `ADMIN` | Có toàn bộ quyền của `USER`, đồng thời được xóa booking và review |

Tài khoản đăng ký mới luôn nhận role `USER`; client không thể tự gửi role trong request đăng ký. Để cấp một tài khoản làm quản trị viên trong môi trường phát triển, chạy SQL sau trong PostgreSQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

Phần authentication dùng `@nestjs/authentication`: `AuthenticationModule`, `JwtBearerProvider`, `PasswordHasher` và `TokenService`. Package này ký/xác minh JWT, băm mật khẩu bằng scrypt, phát refresh token opaque một lần dùng và phát hiện token bị dùng lại. Refresh-token store được hiện thực bằng TypeORM/PostgreSQL, nên rotation và revoke vẫn hoạt động khi ứng dụng chạy lại.

Phần authorization dùng `@nestjs/authorization`: các policy `BookingPolicy` và `ReviewPolicy` được áp vào endpoint bằng `@Can(...)`. Policy nhận user đã được `JwtBearerProvider` tải từ database, vì thế role không được tin từ payload JWT; thay đổi/hạ quyền có hiệu lực ngay cả với access token cũ. Authentication thất bại trả `401`; user đã đăng nhập nhưng policy từ chối nhận `403`.

RBAC phù hợp bài toán hiện tại vì quyền ít, dễ đọc và tập trung tại endpoint.
