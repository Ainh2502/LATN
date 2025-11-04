# =======================================
# 🛍️ LATN Client Website (React + MUI)
# =======================================

# ---------- Stage 1: Build ----------
FROM node:18-alpine AS build

# Đặt thư mục làm việc
WORKDIR /app

# Copy file cấu hình npm
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Cấp quyền chạy cho CLI trong node_modules
RUN chmod -R +x node_modules/.bin

# Build project (tạo thư mục dist)
RUN npm run build


# ---------- Stage 2: Serve ----------
FROM nginx:alpine

# Dọn thư mục HTML mặc định của nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy kết quả build sang thư mục nginx
COPY --from=build /app/dist /usr/share/nginx/html

# ✅ Copy file cấu hình Nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở port 80 để truy cập web
EXPOSE 80

# Chạy Nginx ở foreground
CMD ["nginx", "-g", "daemon off;"]
