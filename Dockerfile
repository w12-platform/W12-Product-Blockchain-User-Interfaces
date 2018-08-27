FROM node:carbon

ENV PORT=80

WORKDIR /code

RUN npm install npm@latest -g && npm -v
RUN npm install -g serve
COPY . .
RUN cd blockchain/ && npm ci && npm run build && cd -

ARG PORT=$PORT

EXPOSE $PORT

CMD serve -l $PORT
