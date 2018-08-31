FROM node:carbon

ENV PORT=443

WORKDIR /code

COPY server/package*.json ./server/
RUN cd server/ && npm ci && cd ../

RUN npm install npm@latest -g && npm -v
RUN npm install -g serve
COPY . .
RUN cd blockchain/ && npm ci && npm run build && cd -

ARG PORT=$PORT

EXPOSE $PORT

CMD serve -l $PORT
CMD [ "npm", "run", "docker-server" ]