FROM node:carbon

ENV PORT=80

WORKDIR /code

RUN npm install npm@latest -g && npm -v
# RUN npm install -g serve

COPY . .
RUN cd server/ && npm ci && cd -
RUN cd blockchain/ && npm ci && npm run build

WORKDIR /code/blockchain

EXPOSE $PORT

CMD [ "npm", "run", "docker-server" ]