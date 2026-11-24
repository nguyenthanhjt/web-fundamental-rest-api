## 1. Giải pháp

- Xác thực stateless authentication bằng JWT, dùng `@nestjs/passport` (triển khai `LocalStrategy` và `JwtStrategy`) và `@nestjs/jwt` để phát hành và xác minh Bearer token.
- Phân quyền RBAC qua decorator `@Auth(...roles)`. Hỗ trợ 2 vai trò `USER` và `ADMIN`
- Kiểm soát sở hữu theo `userId`, với `USER` chỉ được thao tác trên tài nguyên của chính mình, `ADMIN` được bỏ qua kiểm tra sở hữu.
- Bảo mật mật khẩu bằng băm một chiều `bcrypt`

## 2. Cơ chế hoạt động

- Đăng ký & Đăng nhập: `POST /auth/register` kiểm tra đầu vào, chống trùng `username`, băm mật khẩu bằng `bcrypt` và gán mặc định role `USER`. `POST /auth/login` xác thực thông tin qua `LocalStrategy` và trả về JWT `access_token`.
- Guard Pipeline (`@Auth`): `JwtAuthGuard` giải mã Bearer token từ header `Authorization` và gắn thông tin user vào `req.user` (`401` nếu thiếu/sai/hết hạn); sau đó `RolesGuard` kiểm tra vai trò theo metadata `@Roles` (`403` nếu không đủ quyền).

## 3. Lý do lựa chọn giải pháp

- JWT Stateless + Passport: Không cần lưu session trên server, phù hợp REST API và tận dụng sẵn kiến trúc Guard/Strategy của NestJS.
- Custom decorator `@Auth(...roles)`: Tránh lặp `@UseGuards` + `@Roles`
- Dùng `bcrypt`: Bảo vệ mật khẩu bằng băm một chiều, chống tấn công từ điển và rainbow table.

## 4. Ma trận phân quyền

### Booking

<table>
  <thead>
    <tr>
      <th>Route</th>
      <th>Handler</th>
      <th>Auth</th>
      <th>Role</th>
      <th>Đặc tả</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GET /api/v1/bookings</td>
      <td>getAllBookings</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>ADMIN thấy tất cả, USER chỉ thấy booking của mình</td>
    </tr>
    <tr>
      <td>GET /api/v1/bookings/:id</td>
      <td>getBookingById</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Chỉ người dùng đã đăng nhập mới có thể xem booking của mình hoặc admin có thể xem tất cả booking</td>
    </tr>
    <tr>
      <td>POST /api/v1/bookings</td>
      <td>createBooking</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Chỉ người dùng đã đăng nhập mới có thể tạo booking</td>
    </tr>
    <tr>
      <td>PUT /api/v1/bookings/:id</td>
      <td>updateBooking</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Chỉ người dùng đã đăng nhập mới có thể cập nhật booking của mình hoặc admin có thể cập nhật tất cả booking</td>
    </tr>
    <tr>
      <td>PATCH /api/v1/bookings/:id</td>
      <td>patchBooking</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Chỉ người dùng đã đăng nhập mới có thể cập nhật booking của mình hoặc admin có thể cập nhật tất cả booking</td>
    </tr>
    <tr>
      <td>DELETE /api/v1/bookings/:id</td>
      <td>deleteBooking</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Chỉ người dùng đã đăng nhập mới có thể xóa booking của mình hoặc admin có thể xóa tất cả booking</td>
    </tr>
  </tbody>
</table>

### Service

<table>
  <thead>
    <tr>
      <th>Route</th>
      <th>Handler</th>
      <th>Auth</th>
      <th>Role</th>
      <th>Đặc tả</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GET /api/v1/services</td>
      <td>getAllServices</td>
      <td>N</td>
      <td>PUBLIC</td>
      <td>Công khai danh sách dịch vụ</td>
    </tr>
    <tr>
      <td>GET /api/v1/services/:id</td>
      <td>getServiceById</td>
      <td>N</td>
      <td>PUBLIC</td>
      <td>Công khai chi tiết dịch vụ (<code>404</code> nếu dịch vụ không tồn tại)</td>
    </tr>
  </tbody>
</table>

### Review

<table>
  <thead>
    <tr>
      <th>Route</th>
      <th>Handler</th>
      <th>Auth</th>
      <th>Role</th>
      <th>Điều kiện phạm vi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GET /api/v1/services/:serviceId/reviews</td>
      <td>getReviewsByServiceId</td>
      <td>N</td>
      <td>PUBLIC</td>
      <td>Công khai danh sách đánh giá theo dịch vụ (<code>404</code> nếu dịch vụ không tồn tại)</td>
    </tr>
    <tr>
      <td>POST /api/v1/services/:serviceId/reviews</td>
      <td>createReview</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Người dùng đã đăng nhập tạo đánh giá, server gán <code>userId</code> từ JWT</td>
    </tr>
    <tr>
      <td>GET /api/v1/reviews/:id</td>
      <td>getReviewById</td>
      <td>N</td>
      <td>PUBLIC</td>
      <td>Công khai xem chi tiết đánh giá (<code>404</code> nếu không tồn tại)</td>
    </tr>
    <tr>
      <td>PUT /api/v1/reviews/:id</td>
      <td>updateReview</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Chỉ chủ sở hữu (<code>userId</code>) hoặc <code>ADMIN</code> được thay thế đánh giá</td>
    </tr>
    <tr>
      <td>PATCH /api/v1/reviews/:id</td>
      <td>patchReview</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Chỉ chủ sở hữu (<code>userId</code>) hoặc <code>ADMIN</code> được cập nhật đánh giá</td>
    </tr>
    <tr>
      <td>DELETE /api/v1/reviews/:id</td>
      <td>deleteReview</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Chỉ chủ sở hữu (<code>userId</code>) hoặc <code>ADMIN</code> được xóa đánh giá</td>
    </tr>
  </tbody>
</table>

### Auth & User

Thêm tài khoản người dùng mới (`USER`) và đăng nhập (`PUBLIC`) không yêu cầu xác thực. `user` gồm các thuộc tính: `id`, `username`, `password`, `role` (`USER` / `ADMIN`), `createdAt`, `updatedAt` (các response trả về loại bỏ trường `password`).

<table>
  <thead>
    <tr>
      <th>Route</th>
      <th>Handler</th>
      <th>Auth</th>
      <th>Role</th>
      <th>Điều kiện phạm vi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>POST /api/v1/auth/register</td>
      <td>register</td>
      <td>N</td>
      <td>PUBLIC</td>
      <td>Tạo tài khoản mới (<code>USER</code>), trim <code>username</code>, hash mật khẩu bằng <code>bcrypt</code>, chống trùng (<code>409</code>)</td>
    </tr>
    <tr>
      <td>POST /api/v1/auth/login</td>
      <td>login</td>
      <td>N</td>
      <td>PUBLIC</td>
      <td>Xác thực <code>username</code> / <code>password</code> qua <code>LocalStrategy</code> và trả về JWT <code>access_token</code></td>
    </tr>
    <tr>
      <td>GET /api/v1/users</td>
      <td>getAllUsers</td>
      <td>Y</td>
      <td>ADMIN</td>
      <td>Chỉ admin mới có thể xem danh sách người dùng</td>
    </tr>
    <tr>
      <td>GET /api/v1/users/me</td>
      <td>getCurrentUser</td>
      <td>Y</td>
      <td>USER, ADMIN</td>
      <td>Người dùng đã đăng nhập có thể xem thông tin của chính mình</td>
    </tr>
    <tr>
      <td>GET /api/v1/users/:id</td>
      <td>getUserById</td>
      <td>Y</td>
      <td>ADMIN</td>
      <td>Chỉ admin mới có thể xem thông tin người dùng</td>
    </tr>
  </tbody>
</table>

## 5. Khởi chạy & Tài khoản mẫu

- Tài khoản mẫu: `user1` / `password1` (`USER`), `admin1` / `password2` (`ADMIN`).
- Chạy & kiểm tra: `npm run start:dev`, `npx tsc --noEmit && npm run lint && npm run build`.
