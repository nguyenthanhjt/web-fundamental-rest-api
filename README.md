# Nest Auth

API NestJS với JWT authentication, authorization theo role/ownership, users, services, bookings và reviews.

## Yêu cầu

- Node.js 24+
- npm
- Docker Desktop và Docker Compose

## Khởi động dự án

### 1. Cài dependencies và tạo `.env`

```powershell
npm.cmd install
Copy-Item .env.example .env
```

Cấu hình mặc định trong `.env.example` khớp với PostgreSQL trong Docker Compose:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=nestAuth
DB_PASSWORD=nestAuth@123
DB_NAME=nest-auth
DB_SYNCHRONIZE=false
JWT_ACCESS_KEY=replace-with-a-secret-at-least-32-bytes
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
```

Trong môi trường thật, thay `JWT_ACCESS_KEY` bằng secret ngẫu nhiên và không commit `.env`.

### 2. Khởi động PostgreSQL

```powershell
docker compose up -d postgres
docker compose ps
```

Database được expose tại `localhost:5433`.

### 3. Chạy migration

```powershell
npm.cmd run migration:show
npm.cmd run migration:run
```

Migration chỉ tạo/cập nhật schema, chưa tự động seed dữ liệu.

### 4. Chạy API

```powershell
npm.cmd run start:dev
```

API chạy mặc định tại `http://localhost:3000`.

Kiểm tra nhanh:

```powershell
Invoke-RestMethod http://localhost:3000
```

