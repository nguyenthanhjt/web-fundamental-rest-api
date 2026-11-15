# Course 3 demo — Booking API (Express, in-memory)

There is no database. Restarting the process drops every booking. There is no login yet: DELETE does not check permission.

Paths match the Booking App slides, prefix `/api/v1`. PUT is extra compared with the Proposed Endpoints table, so the CRUD slide has both replace and partial update.

Student exercise (new resource, do not rebuild these routes): [EXERCISE.md](EXERCISE.md) · [EXERCISE.en.md](EXERCISE.en.md).

## Run

```bash
npm install --registry https://registry.npmjs.org
npm start
```

If `npm install` returns 401, this machine is pointed at an internal registry. The command above installs `express` from the public registry.

Server: `http://localhost:3000`

## Try the API

Run these from the `demo` folder. `bkg_001` is the id the server returns from POST. Change the id if you create more than one booking.

```bash
curl.exe http://localhost:3000/api/v1/services
curl.exe http://localhost:3000/api/v1/services/svc_001
curl.exe http://localhost:3000/api/v1/services/khong-co
curl.exe -X POST http://localhost:3000/api/v1/bookings -H "Content-Type: application/json" --data-binary "@requests/booking-create.json"
curl.exe http://localhost:3000/api/v1/bookings
curl.exe http://localhost:3000/api/v1/bookings/bkg_001
curl.exe -X PUT http://localhost:3000/api/v1/bookings/bkg_001 -H "Content-Type: application/json" --data-binary "@requests/booking-put.json"
curl.exe -X PATCH http://localhost:3000/api/v1/bookings/bkg_001 -H "Content-Type: application/json" --data-binary "@requests/booking-patch.json"
curl.exe -X POST http://localhost:3000/api/v1/bookings -H "Content-Type: application/json" --data-binary "@requests/empty.json"
curl.exe -X DELETE http://localhost:3000/api/v1/bookings/bkg_001
```

## Routes

| Method | Path | Success | Error |
|--------|------|---------|-------|
| GET | `/api/v1/services` | 200 array | |
| GET | `/api/v1/services/:id` | 200 one service | 404 |
| POST | `/api/v1/bookings` | 201 booking; server sets `id` and `status: PENDING` | 400 missing field, 404 unknown service |
| GET | `/api/v1/bookings` | 200 array | |
| GET | `/api/v1/bookings/:id` | 200 one booking | 404 |
| PUT | `/api/v1/bookings/:id` | 200; replaces `serviceId`, `date`, `timeSlot`, and `customerName` | 400 missing field, 404 booking or service |
| PATCH | `/api/v1/bookings/:id` | 200; only the fields sent | 400 empty body, 404 |
| DELETE | `/api/v1/bookings/:id` | 204 no body | 404 |

Create-booking body, as on the slide:

```json
{
  "serviceId": "svc_001",
  "date": "2026-11-15",
  "timeSlot": "10:00",
  "customerName": "Alex Nguyen"
}
```

Seed: `svc_001`, `svc_002`.

## Part A — Đặc tả API đánh giá dịch vụ (Reviews)

Các API nhận và trả dữ liệu dạng JSON, trừ DELETE thành công không có body. Khi có lỗi, response có dạng `{ "message": "..." }`.

| Method | Path | Request body | Response thành công | Trường hợp lỗi |
|--------|------|--------------|---------------------|----------------|
| GET | `/api/v1/services/:serviceId/reviews` | Không có | **200** — mảng review của dịch vụ; `[]` nếu chưa có review | **404** — dịch vụ không tồn tại |
| POST | `/api/v1/services/:serviceId/reviews` | `authorName`, `rating` bắt buộc; `comment` tùy chọn | **201** — object review mới, gồm `id` và `serviceId` do server gán | **400** — thiếu trường bắt buộc, sai kiểu dữ liệu hoặc rating ngoài 1–5; **404** — dịch vụ không tồn tại |
| GET | `/api/v1/reviews/:id` | Không có | **200** — object review được tìm thấy | **404** — review không tồn tại |
| PUT | `/api/v1/reviews/:id` | Bắt buộc đủ `authorName`, `rating`, `comment` | **200** — object review thay thế, giữ nguyên `id` và `serviceId` | **400** — thiếu trường, sai kiểu dữ liệu hoặc rating ngoài 1–5; **404** — review không tồn tại |
| PATCH | `/api/v1/reviews/:id` | Một hoặc nhiều trường trong `authorName`, `rating`, `comment` | **200** — object review sau khi cập nhật; các trường không gửi giữ nguyên | **400** — body `{}`, không có trường được phép cập nhật, hoặc giá trị không hợp lệ; **404** — review không tồn tại |
| DELETE | `/api/v1/reviews/:id` | Không có | **204** — không có body | **404** — review không tồn tại |

### Quy tắc dữ liệu

- `authorName`: chuỗi không rỗng, không chỉ chứa khoảng trắng.
- `rating`: số từ **1 đến 5**.
- `comment`: chuỗi, được phép rỗng `""` theo đề bài. Khi POST không gửi trường này, server mặc định là `""`.
- Server tự tạo `id` khi POST, ví dụ `rev_001`; lấy `serviceId` từ URL. Client không gửi `id` và không thay đổi `id`, `serviceId` qua PUT hoặc PATCH.
- PUT thay thế toàn bộ ba trường nội dung nên phải gửi đủ cả ba. PATCH chỉ thay đổi các trường được gửi và phải kiểm tra dữ liệu trước khi lưu.

Ví dụ body POST hoặc PUT:

```json
{
  "authorName": "Nguyen An",
  "rating": 5,
  "comment": "Dịch vụ tốt"
}
```

Ví dụ body PATCH chỉ sửa rating:

```json
{
  "rating": 4
}
```

PATCH chấp nhận `comment: ""` để xóa nội dung nhận xét và chấp nhận chuỗi chỉ chứa
khoảng trắng. Các giá trị không phải chuỗi vẫn bị từ chối; trường không gửi giữ nguyên.

Chạy `npm test` để kiểm tra các trường hợp này, bao gồm việc request không hợp lệ
không làm thay đổi dữ liệu review.

### Tính idempotent

POST tạo review không idempotent vì gửi lặp lại cùng một request sẽ tạo thêm review với ID mới; GET danh sách review có tính idempotent vì gọi lặp lại không làm thay đổi dữ liệu trên server.

## Kiểm thử Reviews bằng curl

Đã chạy các lệnh dưới đây trên terminal ngày 15/11/2026. Chạy `npm start`
trong thư mục `web-fundamental-rest-api`, rồi mở terminal thứ hai tại cùng thư mục.
Dùng server vừa khởi động để review đầu tiên có ID `rev_001`; nếu đã có dữ liệu,
thay ID trong các lệnh bằng ID thực tế nhận từ POST. Chạy theo thứ tự bên dưới.
Tùy chọn `-i` hiển thị HTTP status cùng response body; `-sS` ẩn tiến trình tải nhưng vẫn hiển thị lỗi kết nối.

```powershell
# 1. Tạo review: 201 Created, id = rev_001
curl.exe -sS -i -X POST http://localhost:3000/api/v1/services/svc_001/reviews -H 'Content-Type: application/json' --data-binary '@requests/review-create.json'

# 2. Danh sách review của dịch vụ: 200 OK, mảng có review vừa tạo
curl.exe -sS -i http://localhost:3000/api/v1/services/svc_001/reviews

# 3. Lấy một review: 200 OK, object có id = rev_001
curl.exe -sS -i http://localhost:3000/api/v1/reviews/rev_001

# 4. Thay thế nội dung: 200 OK, authorName = Tran Binh, rating = 4
curl.exe -sS -i -X PUT http://localhost:3000/api/v1/reviews/rev_001 -H 'Content-Type: application/json' --data-binary '@requests/review-put.json'

# 5. Sửa rating: 200 OK, rating = 3; giữ nguyên authorName và comment
curl.exe -sS -i -X PATCH http://localhost:3000/api/v1/reviews/rev_001 -H 'Content-Type: application/json' --data-binary '@requests/review-patch.json'

# 6. Thiếu rating: 400 Bad Request
# Body: {"message":"authorName and rating are required"}
curl.exe -sS -i -X POST http://localhost:3000/api/v1/services/svc_001/reviews -H 'Content-Type: application/json' --data-binary '@requests/review-missing-rating.json'

# 7. Review không tồn tại: 404 Not Found
# Body: {"message":"Review not found"}
curl.exe -sS -i http://localhost:3000/api/v1/reviews/khong-co

# 8. Xóa review: 204 No Content, không có body
curl.exe -sS -i -X DELETE http://localhost:3000/api/v1/reviews/rev_001

# 9. Kiểm tra sau khi xóa: 200 OK, body = []
curl.exe -sS -i http://localhost:3000/api/v1/services/svc_001/reviews
```

Kết quả thực tế đúng các status và dữ liệu ghi trong chú thích, bao gồm lỗi 400,
lỗi 404 và việc review không còn trong danh sách sau DELETE.

## Part C — Giải thích khi nộp bài

### Câu 1: Vì sao danh sách review ở `/services/:serviceId/reviews`, còn một review ở `/reviews/:id`?

API `/services/:serviceId/reviews` cần xác định dịch vụ nào trước, rồi lấy danh sách
đánh giá thuộc dịch vụ đó, nên `reviews` đứng sau `/services/:serviceId`.

Còn `/reviews/:id` dùng ID riêng của đánh giá để lấy đúng một đánh giá cụ thể,
nên không cần truyền thêm ID dịch vụ.

### Câu 2: Trả status nào khi tạo thành công, thiếu rating và dịch vụ không tồn tại?

- Tạo review thành công: **201 Created**.
- Gửi yêu cầu tạo review nhưng thiếu `rating`: **400 Bad Request**.
- Dịch vụ không tồn tại: **404 Not Found**.

### Câu 3: Cần bổ sung gì trước khi API được dùng cho người dùng thật?

Em sẽ bổ sung đăng nhập và xác thực người gửi review để hệ thống biết ai đã viết
đánh giá. Review sẽ gắn với tài khoản người dùng, thay vì chỉ dựa vào `authorName`
do người gửi tự nhập.
