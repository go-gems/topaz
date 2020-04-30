FROM node:lts

ADD . /app
WORKDIR /app
RUN npm install
EXPOSE 3000
ENTRYPOINT ["node", "app.js"]