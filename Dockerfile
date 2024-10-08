FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Run Prisma migration in production mode
RUN npx prisma migrate deploy --schema=./prisma/schema.prisma

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
