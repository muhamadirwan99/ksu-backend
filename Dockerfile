# Use Node.js 20 as the base image
FROM node:20

# Set timezone to Asia/Jakarta (WIB)
ENV TZ=Asia/Jakarta
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install MySQL client tools for backup functionality
RUN apt-get update && apt-get install -y \
    default-mysql-client \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the Prisma schema files and folder
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma

# Create backup and logs directories
RUN mkdir -p /app/backups /app/logs

# Run Prisma migration with a timestamped name for the migration
# RUN TIMESTAMP=$(date +%Y%m%d%H%M%S) && npx prisma migrate dev --schema=./prisma/schema.prisma --name ${TIMESTAMP}-auto-migration

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
