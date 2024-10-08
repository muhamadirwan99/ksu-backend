FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the Prisma schema file and folder
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Copy .env file
COPY .env .env

# Generate Prisma Client
# RUN npx prisma generate --schema=prisma/schema.prisma

# Run Prisma migration
# RUN npx prisma migrate dev --schema=./prisma/schema.prisma --name init-migration
#    "seed": "node prisma\\seed.js"
# Expose the application port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
