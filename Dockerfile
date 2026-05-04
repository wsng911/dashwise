FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git && \
    git config --global user.email "dev@example.com" && \
    git config --global user.name "dev"

COPY package*.json ./
RUN npm install

COPY . .

RUN git init && git add -A && git commit -m "init" || true

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
