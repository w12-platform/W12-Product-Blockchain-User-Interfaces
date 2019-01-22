FROM node:carbon
ARG BLOCKCHAIN_NETWORK_ID=4
ENV BLOCKCHAIN_NETWORK_ID=$BLOCKCHAIN_NETWORK_ID
ENV PORT=443

WORKDIR /code

RUN npm install npm@latest -g && npm -v
COPY . .
RUN npm ci --unsafe-perm && npm run build

ARG PORT=$PORT

EXPOSE $PORT

CMD node serve.js
