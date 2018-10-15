FROM node:carbon
ARG BLOCKCHAIN_NETWORK_ID=4
ENV BLOCKCHAIN_NETWORK_ID=$BLOCKCHAIN_NETWORK_ID
ENV PORT=443

WORKDIR /code

RUN npm install npm@latest -g && npm -v
RUN npm install -g serve
COPY . .
RUN cd blockchain/ && npm ci && npm run build && cd -

ARG PORT=$PORT

EXPOSE $PORT

CMD serve -l $PORT
