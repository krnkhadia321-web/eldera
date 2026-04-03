FROM node:20-alpine

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install pnpm
RUN npm install -g pnpm@9

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build
RUN cd apps/api && pnpm run build

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["node", "dist/server.js"]