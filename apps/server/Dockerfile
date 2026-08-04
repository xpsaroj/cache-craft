FROM node:24-alpine

WORKDIR /app

RUN chown -R node:node /app
USER node

COPY --chown=node:node package*.json .

RUN npm install

COPY --chown=node:node . .

EXPOSE 4000

CMD ["npm", "run", "start:dev"]