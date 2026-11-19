# Báo Cáo Bài Tập Course 6: Authentication & Authorization

Tài liệu mô tả giải pháp, cơ chế hoạt động và lý do lựa chọn giải pháp trong bài tập Course 6 (Booking API).

---

## 1. Mô tả giải pháp

Hệ thống được nâng cấp từ phiên bản Course 4 (vốn chưa có xác thực và chỉ lưu dữ liệu tạm thời trên RAM) với 3 giải pháp trọng tâm:

* **Chuyển đổi sang cơ sở dữ liệu thật**: Tích hợp PostgreSQL và TypeORM, mô hình hóa các bảng `users`, `services`, `bookings` và `reviews`.
* **Xác thực người dùng không trạng thái (Stateless Authentication)**: 
  * Sử dụng thư viện chính thức `@nestjs/authentication` để quản lý việc đăng ký, đăng nhập và cấp phát token.
  * Mật khẩu người dùng được băm (hash) an toàn bằng thuật toán Scrypt (`PasswordHasher`).
  * Sử dụng JSON Web Token (JWT) làm `accessToken` để định danh người dùng qua từng request, đi kèm `refreshToken` để cấp lại token khi hết hạn mà không bắt người dùng đăng nhập lại.
* **Kiểm soát quyền truy cập theo quan hệ sở hữu (ReBAC / Ownership)**:
  * Sử dụng `AuthenticationGuard` làm **Global Guard**: Mặc định mọi API đều bắt buộc phải đăng nhập (gửi kèm JWT token), trừ các API mở được đánh dấu bằng `@Public()`.
  * Phân quyền dựa trên quyền sở hữu tài nguyên: Gắn mối quan hệ giữa người dùng với booking (`customerId`) và review (`authorId`). Người dùng chỉ có quyền xem, sửa, xóa dữ liệu do chính mình tạo ra.

---

## 2. Cơ chế hoạt động

Hệ thống hoạt động theo 3 luồng chính:

### a. Đăng ký & Đăng nhập
1. **Đăng ký (`/auth/sign-up`)**: Nhận email, tên và mật khẩu -> Mật khẩu được băm và lưu vào database -> Trả về thông tin user (đã ẩn mật khẩu).
2. **Đăng nhập (`/auth/sign-in`)**: Nhận email và mật khẩu -> Tìm user và xác minh mật khẩu đã băm -> Nếu đúng, server tạo cặp `accessToken` (chứa `id` người dùng trong claim `sub`) và `refreshToken` gửi về cho client.

### b. Xác thực yêu cầu (Authentication Flow)
1. Với mỗi request gọi đến các API cần bảo vệ, client đính kèm token vào header: `Authorization: Bearer <accessToken>`.
2. `JwtProvider` (kế thừa `JwtBearerProvider`) giải mã và xác minh chữ ký token bằng `JWT_SECRET`:
   * **Nếu hợp lệ**: Trích xuất `sub` (ID người dùng), nạp thông tin user vào context request (lấy ra qua decorator `@CurrentUser()`).
   * **Nếu không có token hoặc token sai/hết hạn**: Hệ thống tự động từ chối với mã lỗi `401 Unauthorized`.
3. Các route công khai như xem danh sách dịch vụ hoặc đăng nhập/đăng ký được gắn `@Public()`, `AuthenticationGuard` sẽ bỏ qua bước kiểm tra này.

### c. Kiểm soát quyền truy cập (Authorization Flow)
1. **Khi tạo mới tài nguyên** (đặt lịch, viết đánh giá): Server tự động lấy ID của người dùng đang đăng nhập từ token để gán vào `customerId` hoặc `authorId`. Client không thể tự ý truyền ID của người khác.
2. **Khi xem, cập nhật hoặc xóa tài nguyên**:
   * Hệ thống tìm tài nguyên trong database theo ID truyền vào.
   * So sánh ID chủ sở hữu của tài nguyên với ID của người gửi request:
     * **Trùng khớp**: Cho phép tiếp tục thực hiện hành động.
     * **Không trùng khớp**: Chặn lại ngay và trả về lỗi `403 Forbidden`.
   * Đối với danh sách đặt lịch (`GET /bookings`), hệ thống lọc trực tiếp từ database chỉ lấy các bản ghi thuộc về user hiện tại.

---

## 3. Lý do lựa chọn

1. **Lựa chọn Stateless JWT thay vì Stateful Session (Cookie)**:
   * **Không tốn tài nguyên server**: Server không cần lưu trạng thái phiên làm việc trong bộ nhớ RAM hay Redis, giúp tiết kiệm bộ nhớ và dễ dàng mở rộng nhiều server (scale ngang).
   * **Đúng chuẩn REST API**: Mỗi request hoàn toàn độc lập và tự chứa đủ thông tin xác thực.

2. **Lựa chọn thư viện `@nestjs/authentication`**:
   * Đây là thư viện chính chủ của NestJS, tích hợp mượt mà với Dependency Injection, Global Guards và chuẩn ESM.
   * Tích hợp sẵn cơ chế mã hóa mật khẩu mạnh (`PasswordHasher`) và cơ chế quản lý vòng đời Refresh Token theo chuẩn bảo mật, tránh phải cài đặt nhiều thư viện rời rạc bên ngoài.

3. **Lựa chọn mô hình ReBAC (Phân quyền theo quyền sở hữu) thay vì RBAC (Phân quyền theo vai trò)**:
   * Bản chất nghiệp vụ của hệ thống Booking là **"người nào quản lý dữ liệu của người đó"**.
   * Mô hình RBAC (Role-Based như `ADMIN`, `USER`) không giải quyết được bài toán ngăn cản "User A chỉnh sửa hoặc xóa lịch đặt của User B". 
   * ReBAC kiểm tra trực tiếp quan hệ sở hữu (`owner == currentUser`) giúp giải quyết triệt để lỗi bảo mật truy cập trái phép tài nguyên (IDOR - Insecure Direct Object References).
