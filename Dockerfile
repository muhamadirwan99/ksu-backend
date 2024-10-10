# Use Node.js 22-alpine as the base image
FROM node:22-alpine

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

# Copy .env file
COPY .env .env

# Generate Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma

# Run Prisma migration with a timestamped name for the migration
RUN TIMESTAMP=$(date +%Y%m%d%H%M%S) && npx prisma migrate dev --schema=./prisma/schema.prisma --name ${TIMESTAMP}-auto-migration

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
