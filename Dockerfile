FROM node:carbon

ENV PORT=443

WORKDIR /code

RUN npm install npm@latest -g && npm -v
# RUN npm install -g serve

COPY . .
RUN cd blockchain/ && npm ci && npm run build && cd -
RUN cd server/ && npm ci && cd -

EXPOSE $PORT

CMD [ "npm", "run", "docker-server" ]