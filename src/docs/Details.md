# Giải pháp xác thực và phân quyền

## 1. Bài toán và phạm vi

Ứng dụng quản lý dịch vụ, đặt lịch và đánh giá. Hệ thống cần xác định danh tính người gửi yêu cầu và kiểm soát quyền truy cập vào các API, tài nguyên theo vai trò và quyền sở hữu.

Các yêu cầu chính:

- Khách chưa đăng nhập được xem danh sách dịch vụ và đánh giá.
- Người dùng đã đăng nhập (`USER`) được tạo, xem và quản lý các lượt đặt dịch vụ của mình.
- Người dùng đã đăng nhập được tạo đánh giá và sửa, xóa đánh giá của mình.
- Quản trị viên (`ADMIN`) được quản lý người dùng và có quyền xem, sửa, xóa mọi lượt đặt dịch vụ và đánh giá.
- Người dùng không được tự xác định danh tính hoặc quyền sở hữu tài nguyên thông qua dữ liệu gửi lên từ client.
- Các API yêu cầu đăng nhập phải xác thực Access Token trước khi xử lý.
- Hệ thống sử dụng Stateless Authentication, không duy trì session đăng nhập phía server.

Tài liệu mô tả giải pháp đang được triển khai trong mã nguồn, tập trung vào JWT Authentication, Refresh Token Rotation, Role-based Authorization và kiểm tra quyền sở hữu tài nguyên.

**Phạm vi triển khai hiện tại:** Dữ liệu người dùng, dịch vụ, lượt đặt và đánh giá đang được lưu tạm trong các mảng ở bộ nhớ. Refresh Token cũng được quản lý bằng In-memory Store. Đây là lựa chọn phục vụ giai đoạn phát triển và kiểm thử chức năng, chưa phải cấu hình lưu trữ dành cho môi trường production.

## 2. Giải pháp được sử dụng

Ứng dụng kết hợp **JWT Authentication**, **Refresh Token Rotation** và **Role-based Authorization kết hợp Resource Ownership**.

- Authentication xác định người gửi yêu cầu là ai thông qua Access Token.
- Authorization kiểm tra vai trò của người dùng và quyền sở hữu tài nguyên trước khi cho phép thao tác.
- Refresh Token hỗ trợ cấp mới Access Token khi Access Token hết hạn mà không yêu cầu người dùng đăng nhập lại.

### 2.1. Các thành phần chính

| Thành phần | Trách nhiệm |
| --- | --- |
| `src/app.module.ts` | Khởi tạo các module của hệ thống và cấu hình `ConfigModule` |
| `src/main.ts` | Khởi tạo ứng dụng và cấu hình `ValidationPipe` toàn cục |
| `src/auth/auth.module.ts` | Đăng ký JWT Module, AuthService và các Guard |
| `src/auth/auth.controller.ts` | Cung cấp các API đăng ký, đăng nhập, refresh token và lấy thông tin người dùng |
| `src/auth/auth.service.ts` | Xử lý đăng nhập, kiểm tra mật khẩu, phát hành và làm mới token |
| `src/auth/guards/jwt-auth.guard.ts` | Trích xuất và xác thực Access Token |
| `src/auth/guards/roles.guard.ts` | Kiểm tra vai trò được phép truy cập API |
| `src/auth/decorators/current-user.decorator.ts` | Lấy thông tin người dùng đã xác thực từ request |
| `src/auth/decorators/roles.decorator.ts` | Khai báo các vai trò được phép truy cập endpoint |
| `src/auth/enums/role.enum.ts` | Định nghĩa các vai trò `USER` và `ADMIN` |
| `src/auth/refresh-token/refresh-token.store.ts` | Định nghĩa giao diện quản lý Refresh Token |
| `src/auth/refresh-token/in-memory-refresh-token.store.ts` | Lưu hash Refresh Token, kiểm tra và tiêu thụ token trong bộ nhớ |
| `src/users/users.service.ts` | Quản lý tài khoản, mã hóa mật khẩu và thu hồi Refresh Token khi đổi mật khẩu |
| `src/bookings/bookings.service.ts` | Kiểm tra quyền sở hữu lượt đặt dịch vụ |
| `src/reviews/reviews.service.ts` | Kiểm tra quyền sở hữu đánh giá |
| `src/mock-data/` | Cung cấp dữ liệu mẫu phục vụ phát triển và kiểm thử |

### 2.2. Cơ chế xác thực và phân quyền

**Authentication bằng JWT**

Sau khi đăng nhập thành công, hệ thống phát hành hai loại token:

- Access Token: dùng để xác thực các yêu cầu truy cập API.
- Refresh Token: dùng để yêu cầu cấp mới cặp token khi cần thiết.

Access Token được ký bằng `JWT_ACCESS_SECRET`, Refresh Token được ký bằng `JWT_REFRESH_SECRET`. Hai loại token sử dụng khóa bí mật riêng biệt để tách biệt mục đích sử dụng.

Access Token có thời hạn mặc định 15 phút (`15m`), Refresh Token có thời hạn mặc định 7 ngày (`7d`). Các giá trị này có thể cấu hình thông qua biến môi trường.

Payload Access Token gồm:

```ts
{
  sub: user.id,
  email: user.email,
  role: user.role
}
```

Payload Refresh Token gồm:

```ts
{
  sub: user.id
}
```

Trong đó:
- `sub`: ID của người dùng.
- `email`: email người dùng.
- `role`: vai trò của người dùng.

Refresh Token được cấp thêm `jti` bằng `randomUUID()` để tạo định danh riêng cho mỗi token.

**Authorization bằng Role và Resource Ownership**

Hệ thống định nghĩa hai vai trò:

```ts
export enum Role {
  User = 'user',
  Admin = 'admin',
}
```

Các endpoint được bảo vệ bằng `JWTAuthGuard` và `RolesGuard`. Ngoài kiểm tra vai trò, các thao tác trên Booking và Review còn kiểm tra ID người sở hữu tài nguyên.

Ví dụ, điều kiện truy cập một Booking:

```ts
private assertCanAccess(
  booking: Booking,
  user: CurrentUserData,
): void {
  if (
    user.role !== Role.Admin &&
    booking.userId !== user.sub
  ) {
    throw new ForbiddenException(
      'You do not have access to this booking',
    );
  }
}
```

Điều kiện trên cho phép:
- ADMIN truy cập Booking của mọi người dùng.
- USER chỉ truy cập Booking có `userId` trùng với ID của mình.

ReviewsService áp dụng cùng nguyên tắc với trường `review.userId`.

## 3. Cơ chế hoạt động

### 3.1. Đăng ký và đăng nhập

**Đăng ký: `POST /auth/register`**

1. Client gửi thông tin đăng ký gồm `name`, `email` và `password`.
2. `RegisterDto` kiểm tra dữ liệu đầu vào, bao gồm email hợp lệ, mật khẩu tối thiểu 8 và tối đa 72 ký tự.
3. `UsersService.create()` chuẩn hóa email bằng cách chuyển về chữ thường và loại bỏ khoảng trắng ở hai đầu.
4. Hệ thống kiểm tra email đã tồn tại hay chưa. Nếu trùng, trả về `409 Conflict`.
5. Mật khẩu được mã hóa bằng BCrypt với salt rounds bằng 10.
6. Người dùng mới luôn được gán vai trò `Role.User`, không lấy Role từ dữ liệu client.
7. Hệ thống lưu người dùng vào mảng `users` và trả về thông tin công khai thông qua `toPublicUser()`, không bao gồm `passwordHash`.

**Đăng nhập: `POST /auth/login`**

1. Client gửi email và password.
2. `AuthService.login()` tìm người dùng theo email.
3. Hệ thống sử dụng `bcrypt.compare()` để so sánh mật khẩu gửi lên với mật khẩu đã mã hóa.
4. Nếu email không tồn tại hoặc mật khẩu không chính xác, trả về `401 Unauthorized` với thông báo chung `Invalid credentials`.
5. Nếu hợp lệ, hệ thống gọi `issueTokens()` để phát hành Access Token và Refresh Token.
6. Refresh Token được lưu dưới dạng SHA-256 hash trong `InMemoryRefreshTokenStore`.
7. Server trả về `access_token` và `refresh_token` cho client.

### 3.2. Xác thực yêu cầu bằng Access Token

Sau khi đăng nhập, client gửi Access Token trong HTTP Header:

```http
Authorization: Bearer <access_token>
```

Luồng xử lý:

1. Request đi vào endpoint có gắn `JWTAuthGuard`.
2. Guard lấy Access Token từ header `Authorization`.
3. Nếu không có token hoặc không đúng dạng Bearer, trả về `401 Unauthorized`.
4. `JwtService.verifyAsync()` xác thực chữ ký và thời hạn token bằng `JWT_ACCESS_SECRET`.
5. Nếu token không hợp lệ hoặc hết hạn, trả về `401 Unauthorized`.
6. Nếu hợp lệ, payload được gắn vào `request.user`.
7. Controller sử dụng `@CurrentUser()` để lấy thông tin người dùng đã xác thực.

Ví dụ:

```ts
@Get('me')
@UseGuards(JWTAuthGuard, RolesGuard)
me(@CurrentUser() user: CurrentUserData) {
  return user;
}
```

`CurrentUserData` gồm:

```ts
export interface CurrentUserData {
  sub: string;
  email: string;
  role: Role;
}
```

Hệ thống sử dụng JWT nên không cần lưu session đăng nhập hoặc tra cứu session phía server cho mỗi yêu cầu. Thông tin xác thực được kiểm tra trực tiếp từ token.

Đây là cơ chế Stateless Authentication đối với Access Token.

### 3.3. Làm mới token (Refresh Token Rotation)

Khi Access Token hết hạn, client sử dụng Refresh Token để yêu cầu cấp mới token thông qua:

`POST /auth/refresh`

Luồng xử lý:

1. Client gửi Refresh Token trong request body:

```json
{
  "refresh_token": "<refresh_token>"
}
```

2. `AuthService.refresh()` xác thực Refresh Token bằng `JWT_REFRESH_SECRET`.
3. Nếu token không hợp lệ hoặc hết hạn, hệ thống trả về `401 Unauthorized`.
4. Nếu token hợp lệ, hệ thống gọi `refreshTokenStore.consume()` để kiểm tra và tiêu thụ token.
5. `InMemoryRefreshTokenStore` băm token bằng SHA-256, sau đó tìm bản ghi có `userId`, hash tương ứng và thời gian hết hạn còn hiệu lực.
6. Nếu tìm thấy, bản ghi bị xóa khỏi mảng lưu trữ để token cũ không thể sử dụng lại.
7. Hệ thống kiểm tra người dùng tương ứng còn tồn tại hay không.
8. Nếu người dùng tồn tại, hệ thống phát hành một cặp Access Token và Refresh Token mới.
9. Refresh Token mới được lưu dưới dạng hash và token cũ không còn được chấp nhận.

Nếu token đã được sử dụng trước đó hoặc không có bản ghi tương ứng trong Store, hệ thống xem đây là trường hợp Refresh Token reuse và thu hồi toàn bộ Refresh Token của người dùng thông qua `revokeAllByUser()`.

Cơ chế Rotation giúp hạn chế khả năng tái sử dụng Refresh Token đã bị đánh cắp hoặc đã được sử dụng.

**Lưu ý:** Refresh Token có trạng thái được quản lý phía server, khác với Access Token. Việc lưu trạng thái này không làm thay đổi cơ chế xác thực stateless của Access Token.

### 3.4. Đăng xuất và thu hồi token

Ở phiên bản hiện tại, hệ thống chưa triển khai API Logout riêng.

Giao diện `RefreshTokenStore` hiện hỗ trợ:

```ts
save(userId, token, expiresAt)
consume(userId, token)
revokeAllByUser(userId)
```

Trong đó, `revokeAllByUser()` cho phép xóa toàn bộ Refresh Token của một người dùng.

Hệ thống hiện sử dụng cơ chế thu hồi này khi:
- Phát hiện Refresh Token reuse.
- Người dùng không còn tồn tại khi thực hiện refresh.
- Người dùng thay đổi mật khẩu trong `UsersService.update()`.

Việc thu hồi Refresh Token không làm Access Token đã phát hành mất hiệu lực ngay lập tức. Access Token vẫn có thể được sử dụng đến khi hết hạn, với thời gian mặc định là 15 phút.

### 3.5. Phân quyền theo vai trò

Hệ thống sử dụng `Roles` decorator để khai báo vai trò được phép truy cập endpoint.

Ví dụ:

```ts
@Post()
@Roles([Role.Admin])
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

`RolesGuard` sử dụng `Reflector` để lấy các Role được khai báo tại handler hoặc controller.

Luồng xử lý:

1. `JWTAuthGuard` xác thực Access Token.
2. Payload được gắn vào `request.user`.
3. `RolesGuard` lấy danh sách Role được yêu cầu từ decorator.
4. Nếu không có Role phù hợp, hệ thống trả về `403 Forbidden`.
5. Nếu vai trò hợp lệ, request được tiếp tục xử lý.

Các controller được bảo vệ trực tiếp bằng `@UseGuards(JWTAuthGuard, RolesGuard)`. Hệ thống chưa cấu hình Global Guard, do đó những endpoint không gắn Guard sẽ được truy cập công khai.

### 3.6. Kiểm tra quyền sở hữu tài nguyên

Ngoài phân quyền theo Role, hệ thống kiểm tra quyền sở hữu tại Service để đảm bảo người dùng không thể truy cập hoặc thay đổi dữ liệu của người khác.

**Đối với Booking**

Trong `BookingsService`:

- `findAll()`: ADMIN xem tất cả Booking; USER chỉ xem Booking có `userId` trùng với ID của mình.
- `findOne()`: Tìm Booking theo ID, sau đó kiểm tra quyền sở hữu.
- `create()`: Lấy `userId` từ danh tính đã xác thực, không lấy từ request body.
- `replace()`, `update()`: Kiểm tra quyền trước khi thay đổi dữ liệu.
- `remove()`: Kiểm tra quyền trước khi xóa.

**Đối với Review**

Trong `ReviewsService`:

- `findByService()`: Cho phép xem danh sách đánh giá của dịch vụ.
- `findOne()`: Cho phép xem chi tiết đánh giá.
- `create()`: Lấy `userId` từ người dùng đã xác thực.
- `replace()`, `update()`: Chỉ cho phép tác giả hoặc ADMIN thay đổi.
- `remove()`: Chỉ cho phép tác giả hoặc ADMIN xóa.

Điều kiện kiểm tra quyền:

```ts
private assertCanAccess(
  review: Review,
  user: CurrentUserData,
): void {
  if (
    user.role !== Role.Admin &&
    review.userId !== user.sub
  ) {
    throw new ForbiddenException(
      'You do not have access to this review',
    );
  }
}
```

Việc kiểm tra quyền được thực hiện trước khi thay đổi dữ liệu. Nhờ đó, người dùng không thể chỉ thay đổi ID trên URL để thao tác với tài nguyên của người khác (IDOR).

### 3.7. Kiểm soát dữ liệu đầu vào

Ứng dụng cấu hình `ValidationPipe` toàn cục trong `main.ts`:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
);
```

Trong đó:

- `whitelist: true`: Loại bỏ các thuộc tính không được khai báo trong DTO.
- `transform: true`: Hỗ trợ chuyển đổi dữ liệu đầu vào sang kiểu DTO tương ứng.

Các DTO sử dụng `class-validator` để kiểm tra email, mật khẩu, rating và các trường dữ liệu liên quan.

Đối với việc xác lập chủ sở hữu Booking và Review, Service lấy ID từ `CurrentUserData` thay vì sử dụng ID do client cung cấp.

## 4. Ma trận quyền truy cập API

Các quyền dưới đây áp dụng khi dữ liệu đầu vào hợp lệ và tài nguyên tồn tại.

| API | Public | USER | ADMIN |
| --- | --- | --- | --- |
| `POST /auth/register` | Cho phép | Cho phép | Cho phép |
| `POST /auth/login` | Cho phép | Cho phép | Cho phép |
| `POST /auth/refresh` | Cho phép | Cho phép | Cho phép |
| `GET /auth/me` | 401 | Cho phép | Cho phép |
| `GET /services` | Cho phép | Cho phép | Cho phép |
| `GET /services/:id` | Cho phép | Cho phép | Cho phép |
| `GET /services/:serviceId/reviews` | Cho phép | Cho phép | Cho phép |
| `GET /reviews/:id` | Cho phép | Cho phép | Cho phép |
| `POST /services/:serviceId/reviews` | 401 | Cho phép | Cho phép |
| `PATCH /reviews/:id` | 401 | Chỉ đánh giá của mình | Cho phép mọi đánh giá |
| `PUT /reviews/:id` | 401 | Chỉ đánh giá của mình | Cho phép mọi đánh giá |
| `DELETE /reviews/:id` | 401 | Chỉ đánh giá của mình | Cho phép mọi đánh giá |
| `GET /bookings` | 401 | Chỉ Booking của mình | Tất cả Booking |
| `GET /bookings/:id` | 401 | Chỉ Booking của mình | Tất cả Booking |
| `POST /bookings` | 401 | Cho phép | Cho phép |
| `PUT /bookings/:id` | 401 | Chỉ Booking của mình | Mọi Booking |
| `PATCH /bookings/:id` | 401 | Chỉ Booking của mình | Mọi Booking |
| `DELETE /bookings/:id` | 401 | Chỉ Booking của mình | Mọi Booking |
| `POST /users` | 401 | 403 | Cho phép |
| `GET /users` | 401 | 403 | Cho phép |
| `GET /users/:id` | 401 | 403 | Cho phép |
| `PATCH /users/:id` | 401 | 403 | Cho phép |
| `DELETE /users/:id` | 401 | 403 | Cho phép |

Trong bảng:
- `401 Unauthorized`: Chưa xác thực hoặc token không hợp lệ.
- `403 Forbidden`: Đã xác thực nhưng không đủ quyền truy cập.
- Các API đăng ký, đăng nhập và refresh token là endpoint công khai, không yêu cầu Access Token.

## 5. Lý do lựa chọn giải pháp

### 5.1. Sử dụng JWT để triển khai Stateless Authentication

JWT cho phép server xác thực yêu cầu thông qua chữ ký và thời hạn của token mà không cần lưu session đăng nhập.

Điều này phù hợp với kiến trúc REST API vì mỗi request mang thông tin xác thực cần thiết trong HTTP Header.

Một số lợi ích:

- Không cần duy trì session đăng nhập phía server.
- Phù hợp với mô hình client-server độc lập.
- Dễ dàng mở rộng khi triển khai nhiều instance backend.
- Giảm sự phụ thuộc vào trạng thái đăng nhập lưu trên server.

### 5.2. Tách biệt Access Token và Refresh Token

Hai loại token có mục đích và thời hạn sử dụng khác nhau:

- Access Token có thời hạn ngắn, được sử dụng thường xuyên khi gọi API.
- Refresh Token có thời hạn dài hơn, chỉ được sử dụng để cấp mới token.

Việc sử dụng hai secret riêng biệt giúp tách biệt phạm vi sử dụng của từng loại token.

Refresh Token Rotation giúp hạn chế việc tái sử dụng token cũ và tăng khả năng kiểm soát vòng đời đăng nhập.

### 5.3. Sử dụng BCrypt để bảo vệ mật khẩu

Mật khẩu người dùng không được lưu dưới dạng văn bản thuần.

BCrypt được sử dụng để tạo password hash với salt rounds bằng 10. Khi đăng nhập, hệ thống sử dụng `bcrypt.compare()` để kiểm tra mật khẩu.

Đây là lựa chọn phù hợp để hạn chế rủi ro khi dữ liệu tài khoản bị lộ.

### 5.4. Kết hợp Role-based Authorization và Resource Ownership

Chỉ kiểm tra vai trò là chưa đủ để bảo vệ các tài nguyên thuộc sở hữu cá nhân.

Ví dụ, hai người dùng đều có Role `USER`, nhưng không thể vì cùng vai trò mà được phép sửa Booking hoặc Review của nhau.

Do đó, hệ thống kết hợp:

- Role-based Authorization: Xác định nhóm người dùng được phép thực hiện thao tác.
- Resource Ownership: Kiểm tra tài nguyên có thuộc người dùng đang gửi yêu cầu hay không.

Cách tiếp cận này giúp ngăn chặn truy cập trái phép vào dữ liệu của người dùng khác.

### 5.5. Tập trung xác thực và phân quyền thành các thành phần riêng biệt

Việc tách `JWTAuthGuard`, `RolesGuard`, decorator `@Roles()` và `@CurrentUser()` giúp phân chia trách nhiệm rõ ràng.

- Guard xác thực danh tính và kiểm tra vai trò.
- Decorator khai báo yêu cầu truy cập.
- Service kiểm tra quyền sở hữu tài nguyên.

Cách tổ chức này giúp mã nguồn dễ bảo trì, tái sử dụng và mở rộng khi bổ sung các vai trò hoặc quy tắc phân quyền mới.

### 5.6. Sử dụng In-memory Store trong giai đoạn phát triển

Hiện tại, dữ liệu ứng dụng và Refresh Token được lưu trong bộ nhớ thông qua các mảng và `InMemoryRefreshTokenStore`.

Lựa chọn này phù hợp với phạm vi triển khai hiện tại vì:

- Chưa cần thiết lập Database để kiểm thử các chức năng Authentication và Authorization.
- Dễ dàng tạo dữ liệu mẫu để kiểm tra các trường hợp User và Admin.
- Giảm độ phức tạp trong giai đoạn phát triển.
- Có thể tập trung đánh giá logic xác thực, phân quyền và quyền sở hữu tài nguyên trước khi tích hợp tầng lưu trữ chính thức.

Việc sử dụng In-memory không làm thay đổi cách xác thực Access Token bằng JWT. Tuy nhiên, trạng thái Refresh Token vẫn phụ thuộc vào bộ nhớ của server.

## 6. Giới hạn hiện tại và hướng mở rộng

### 6.1. Lưu trữ dữ liệu bằng In-memory

Các dữ liệu User, Booking, Review và Service hiện đang được lưu bằng mảng trong bộ nhớ.

Đây là giải pháp tạm thời phục vụ phát triển và kiểm thử, chưa phù hợp với môi trường production.

Các giới hạn:

- Khi server khởi động lại, dữ liệu phát sinh trong quá trình chạy sẽ bị mất.
- Các instance backend khác nhau không tự động chia sẻ dữ liệu.
- Chưa có các cơ chế transaction và ràng buộc dữ liệu như Database.

**Hướng mở rộng:** Tích hợp Database để lưu trữ người dùng, dịch vụ, Booking và Review. Khi đó, các Service sẽ sử dụng Repository để truy vấn và cập nhật dữ liệu thay vì thao tác trực tiếp với mảng.

### 6.2. In-memory Refresh Token Store

Refresh Token hiện được lưu dưới dạng SHA-256 hash trong mảng `records`.

Giải pháp này đáp ứng nhu cầu kiểm thử các chức năng:
- Lưu Refresh Token.
- Kiểm tra token khi refresh.
- Tiêu thụ token cũ.
- Phát hiện reuse.
- Thu hồi token của người dùng.

Tuy nhiên, khi server khởi động lại, các bản ghi Refresh Token sẽ mất. Nếu chạy nhiều instance, mỗi instance sẽ có trạng thái riêng.

**Hướng mở rộng:** Sử dụng Database hoặc Redis để quản lý Refresh Token tập trung, hỗ trợ nhiều instance và duy trì trạng thái sau khi server khởi động lại.

### 6.3. Chưa có API Logout

Phiên bản hiện tại chưa triển khai endpoint Logout.

Hướng mở rộng là bổ sung:

`POST /auth/logout`

API sẽ nhận Refresh Token hiện tại, xác thực token và thu hồi token tương ứng khỏi Store. Nếu muốn đăng xuất toàn bộ thiết bị, có thể sử dụng `revokeAllByUser()`.

Access Token đã phát hành vẫn có hiệu lực đến khi hết hạn nếu không triển khai thêm cơ chế thu hồi Access Token.

### 6.4. Kiểm tra trạng thái tài khoản

JWT Access Token hiện được xác thực dựa trên chữ ký và thời hạn. Guard chưa truy vấn lại User để kiểm tra tài khoản còn tồn tại hoặc còn hoạt động hay không.

Vì vậy, nếu tài khoản bị xóa trong khi Access Token vẫn còn hiệu lực, token đó vẫn có thể được chấp nhận cho đến khi hết hạn.

**Hướng mở rộng:** Bổ sung trạng thái tài khoản hoặc `tokenVersion` để kiểm soát các trường hợp cần thu hồi quyền truy cập sớm hơn thời hạn JWT.

### 6.5. Hoàn thiện chính sách bảo mật

Một số chức năng có thể bổ sung khi hoàn thiện hệ thống:

- Bổ sung Rate Limiting cho Login và Register để hạn chế brute-force.
- Cấu hình CORS theo domain của frontend.
- Bổ sung Logout và thu hồi Refresh Token theo từng phiên.
- Ràng buộc thêm `issuer`, `audience` và thuật toán JWT được phép.
- Kiểm tra chặt chẽ định dạng Authorization Header.
- Bổ sung kiểm thử tự động cho Authentication, Role và Resource Ownership.
- Bổ sung cơ chế ghi log các hoạt động đăng nhập và truy cập bị từ chối.

## 7. Các tình huống cần kiểm chứng

Đây là danh sách tình huống kiểm thử đề xuất nhằm xác nhận các chức năng Authentication và Authorization hoạt động đúng.

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Đăng ký với thông tin hợp lệ | Tạo tài khoản thành công, Role mặc định là USER |
| Đăng ký email đã tồn tại | Trả về `409 Conflict` |
| Đăng ký mật khẩu không hợp lệ | Trả về `400 Bad Request` |
| Đăng nhập đúng email và mật khẩu | Trả về Access Token và Refresh Token |
| Đăng nhập sai mật khẩu | Trả về `401 Unauthorized` |
| Truy cập API cần đăng nhập nhưng không gửi token | Trả về `401 Unauthorized` |
| Gửi Access Token không hợp lệ | Trả về `401 Unauthorized` |
| Gửi Access Token hết hạn | Trả về `401 Unauthorized` |
| USER truy cập API chỉ dành cho ADMIN | Trả về `403 Forbidden` |
| ADMIN truy cập API quản lý người dùng | Cho phép |
| USER tạo Booking | `userId` được lấy từ danh tính đã xác thực |
| USER xem danh sách Booking | Chỉ trả về Booking của người dùng đó |
| USER xem Booking của người khác | Trả về `403 Forbidden` |
| ADMIN xem Booking của người khác | Cho phép |
| USER tạo Review | `userId` được lấy từ danh tính đã xác thực |
| USER sửa hoặc xóa Review của mình | Cho phép |
| USER sửa hoặc xóa Review của người khác | Trả về `403 Forbidden` |
| ADMIN sửa hoặc xóa Review của người khác | Cho phép |
| Refresh bằng token hợp lệ | Cấp cặp token mới |
| Sử dụng lại Refresh Token cũ | Từ chối và thu hồi Refresh Token của người dùng |
| Refresh Token hết hạn | Trả về `401 Unauthorized` |
| Thay đổi mật khẩu người dùng | Thu hồi toàn bộ Refresh Token của người dùng |
| Truy cập tài nguyên không tồn tại | Trả về `404 Not Found` |

Các tình huống trên là tiêu chí kiểm chứng đề xuất, không khẳng định toàn bộ đã được thực thi bằng automated test.

## 8. Kết luận

Giải pháp sử dụng JWT Access Token kết hợp Refresh Token Rotation để triển khai cơ chế xác thực Stateless Authentication. Việc phân quyền được thực hiện thông qua Role-based Authorization và kiểm tra quyền sở hữu tài nguyên tại Service.

Cách tiếp cận này đáp ứng các yêu cầu chính của bài tập:

- Xác định danh tính người dùng thông qua JWT.
- Không sử dụng session đăng nhập phía server.
- Phân quyền theo vai trò USER và ADMIN.
- Kiểm soát quyền truy cập đối với từng tài nguyên.
- Bảo vệ mật khẩu bằng BCrypt.
- Quản lý vòng đời Refresh Token bằng hash, rotation và reuse detection.

Ở phiên bản hiện tại, hệ thống sử dụng In-memory để lưu dữ liệu nhằm đơn giản hóa quá trình phát triển và kiểm thử. Khi triển khai thực tế, có thể thay thế bằng Database và Redis mà vẫn giữ nguyên nguyên tắc xác thực JWT và các quy tắc phân quyền đã thiết kế.