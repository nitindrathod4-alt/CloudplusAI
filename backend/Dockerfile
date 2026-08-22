FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY server.js ./
COPY api-v1.js ./

EXPOSE 5000
CMD ["npm", "start"]
