# Menggunakan image Node.js versi terbaru sebagai base image
FROM node:22

# Menetapkan direktori kerja di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Menginstal dependencies
RUN npm install

# Menyalin seluruh kode aplikasi ke dalam container
COPY . .

# Mem-build Prisma
RUN npx prisma generate

# Mengekspos port aplikasi
EXPOSE 3000

# Menjalankan aplikasi
CMD ["npm", "start"]
