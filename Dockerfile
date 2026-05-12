# Step 1: Build stage
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

# Step 2: Production stage
FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
# Install prisma CLI for running migrations at startup (it's a devDep)
RUN npm install --no-save --ignore-scripts prisma
COPY --from=build /app/build ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY start.sh ./
RUN chmod +x start.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --start-interval=3s \
    CMD ["sh", "-c", "wget -q --spider http://127.0.0.1:3000/ || exit 1"]

CMD ["./start.sh"]
