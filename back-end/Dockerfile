FROM node:12.13-alpine

RUN mkdir /frontend
WORKDIR /frontend

COPY . .

RUN npm i
RUN npm install cors
CMD ["npm","start"]
EXPOSE 80
