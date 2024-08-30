FROM node:alpine

ENV REACT_APP_API_URL=http://localhost:11434
ENV NODE_ENV=production

WORKDIR /app

COPY package.json .

RUN npm install
RUN apk add --no-cache curl

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
