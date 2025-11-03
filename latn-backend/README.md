
# web-admin (NestJS + Prisma + JWT + Swagger)

Admin backend cho hệ thống bán hàng online.

## Yêu cầu
- Node.js >= 18
- PostgreSQL (hoặc Docker Compose theo file bạn đã có)
- Prisma CLI

## Cấu hình môi trường
Sao chép `.env.example` sang `.env` và chỉnh sửa nếu cần:
```
PORT=3000
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shop?schema=public
```

## Cài đặt
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

- API chạy tại: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

## Luồng kiểm thử nhanh
1. `POST /auth/register`  { email, password, name? }
2. `POST /auth/login`     => nhận token JWT
3. Thêm header: `Authorization: Bearer <token>`
4. `GET /users/me`        => xem thông tin tài khoản

## Thư mục chính
- `src/auth`   : đăng ký/đăng nhập, JWT
- `src/user`   : thông tin người dùng (me)
- `src/config` : PrismaService
- `prisma`     : schema Prisma (theo file bạn đã gửi)
- `src/common` : guards, decorators
```

