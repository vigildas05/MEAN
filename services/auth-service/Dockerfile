FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY shared/package.json shared/package.json
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm install
COPY tsconfig.base.json ./
COPY shared shared
COPY services/auth-service services/auth-service
RUN npm run build -w @platform/shared && npm run build -w @platform/auth-service

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/shared/dist shared/dist
COPY --from=build /app/shared/package.json shared/package.json
COPY --from=build /app/services/auth-service/dist dist
COPY --from=build /app/services/auth-service/package.json package.json
CMD ["node", "dist/server.js"]
