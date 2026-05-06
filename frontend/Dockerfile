FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY shared/package.json shared/package.json
COPY frontend/package.json frontend/package.json
RUN npm install
COPY tsconfig.base.json ./
COPY shared shared
COPY frontend frontend
RUN npm run build -w @platform/shared && npm run build -w frontend

FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist/frontend/browser /usr/share/nginx/html
