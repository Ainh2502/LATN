# ===============================
# 🧭 LATN Admin Dashboard (React + MUI)
# ===============================

# ---------- Stage 1: Build ----------
FROM node:18-alpine AS build

# Làm việc trong thư mục /app
WORKDIR /app

# Copy package.json trước để cache layer install
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source vào container
COPY . .

# Cấp quyền thực thi cho CLI trong node_modules
RUN chmod -R +x node_modules/.bin

# Build project (tạo thư mục dist)
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM nginx:alpine

# Xóa file cấu hình default của nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy file build từ stage 1 vào Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx tuỳ chỉnh (nếu có)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose cổng 80
EXPOSE 80

# Lệnh mặc định
CMD ["nginx", "-g", "daemon off;"]
