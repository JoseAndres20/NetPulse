FROM node:20-alpine
WORKDIR /app

ARG VITE_API_URL
ARG VITE_API_KEY

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_KEY=${VITE_API_KEY}

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 80
CMD ["npx", "vite", "preview", "--host", "--port", "80"]
