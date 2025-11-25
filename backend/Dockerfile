FROM node:18-alpine

# Instala o OpenSSL
FROM node:18-alpine

# Instala o OpenSSL
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "start"]