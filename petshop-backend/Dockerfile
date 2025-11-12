FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package manifest and install deps first for better caching

COPY package.json package-lock.json* ./

# Install dependencies (will include prisma in devDependencies)
RUN npm install --silent

# Copy application source (includes prisma schema and migrations)
COPY . /usr/src/app

# Generate Prisma client (if prisma is present)
RUN if [ -f ./prisma/schema.prisma ]; then npx prisma generate; fi

# Remove dev dependencies to produce a smaller final image
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]
