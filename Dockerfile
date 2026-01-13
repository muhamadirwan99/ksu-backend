# Use Node.js 20 as the base image
FROM node:20

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

# Create entrypoint script
RUN echo '#!/bin/sh\n\
set -e\n\
echo "Applying database migrations..."\n\
npx prisma migrate deploy --schema=./prisma/schema.prisma\n\
echo "Migrations applied successfully!"\n\
echo "Starting application..."\n\
exec npm start' > /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Expose the application port
EXPOSE 3000

# Use entrypoint to run migrations before starting app
ENTRYPOINT ["/app/docker-entrypoint.sh"]
