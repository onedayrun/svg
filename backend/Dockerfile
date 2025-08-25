FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source
COPY server.js ./

ENV PORT=1234
EXPOSE 1234

CMD ["node", "server.js"]
