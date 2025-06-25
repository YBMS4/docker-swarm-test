FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY ./server.js ./


RUN npm install --omit=dev

# Use curl for health checks or other purposes.
RUN apk add --no-cache curl
EXPOSE 3000

CMD ["npm", "start"]