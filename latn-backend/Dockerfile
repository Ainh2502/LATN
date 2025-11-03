# =============================
# Stage 1: Build NestJS backend
# =============================
FROM node:20-alpine AS build

# Cài OpenSSL và bash để Prisma hoạt động đúng
RUN apk add --no-cache openssl bash

WORKDIR /app

# Copy package info và cài dependencies
COPY package*.json ./
RUN npm install

# Copy config và mã nguồn
COPY tsconfig*.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Build ra dist + seed script
RUN npm run build


# =====================================
# Stage 2: Run the compiled application
# =====================================
FROM node:20-alpine AS production
RUN apk add --no-cache openssl bash

WORKDIR /app

# Copy lại file cần thiết từ build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# 👇 thêm dòng này để copy cả file seed.js đã biên dịch
COPY --from=build /app/dist/prisma ./dist/prisma

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Command chạy chính
CMD ["npm", "run", "start"]
