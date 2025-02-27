FROM node:18-alpine

WORKDIR /kd-chat/

COPY public/ /kd-chat/public
COPY src/ /kd-chat/src
COPY package.json /kd-chat/

RUN npm install

CMD ["npm", "start"]
