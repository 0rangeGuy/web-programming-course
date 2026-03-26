FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем OpenSSL
RUN apk add --no-cache openssl

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходники
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
COPY prisma.config.ts ./

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем
RUN npm run build

# Второй этап — для запуска
FROM node:20-alpine

WORKDIR /app

# Устанавливаем dumb-init и OpenSSL
RUN apk add --no-cache dumb-init openssl

# Копируем собранные файлы из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/index.js"]