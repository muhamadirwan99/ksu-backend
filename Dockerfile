# Gunakan image Node versi yang sesuai
FROM node:22-alpine

# Buat direktori kerja di dalam container
WORKDIR /app

# Salin `package.json` dan `package-lock.json` (jika ada)
COPY package*.json ./

# Salin folder prisma ke dalam container
COPY prisma ./prisma

# Instal dependensi
RUN npm install

# Salin seluruh kode aplikasi
COPY . .

# Jalankan Prisma generate dan migrate secara eksplisit
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npx prisma migrate dev --schema=./prisma/schema.prisma --name init-migration

# Jalankan aplikasi menggunakan `nodemon` dalam mode
CMD ["npm", "start"]
