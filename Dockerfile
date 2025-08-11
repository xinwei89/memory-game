FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create database directory
RUN mkdir -p database

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]