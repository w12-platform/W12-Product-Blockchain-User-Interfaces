FROM node:carbon

ENV PORT=443

WORKDIR /code

RUN npm install npm@latest -g && npm -v
RUN npm install -g serve

COPY server/package*.json ./server/
RUN cd server/ && npm ci && cd ../

COPY . .
RUN cd blockchain/ && npm ci && npm run build && cd -

ARG PORT=$PORT

EXPOSE $PORT

CMD serve -l $PORT

RUN cd blockchain/
CMD [ "npm", "run", "docker-server" ]