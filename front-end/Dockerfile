# FROM node:14.1-alpine AS builder

# WORKDIR /opt/web
# COPY package.json package-lock.json ./
# RUN npm install
# RUN chmod 777 -R /usr/local/lib/node_modules
# # RUN mkdir -p /usr/local/lib/node_modules/netlify-cli/node_modules
# RUN npm install netlify-cli -g --unsafe-perm

# ENV PATH="./node_modules/.bin:$PATH"

# COPY . ./
# RUN sh build.sh
# RUN export NETLIFY_AUTH_TOKEN=UlVbDbbe3HmoG8vVbUDHN74emENjYPUUbqjPhbpDI7s
# RUN sh deploy.sh
#------------------------------------

### STAGE 1: Build ###
FROM  node:14.18-alpine AS build
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install -g npm@latest
RUN npm install
RUN npm install -g @angular/cli

RUN rm package-lock.json
COPY . .
RUN npm run build
### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/makcorp /usr/share/nginx/html
EXPOSE 80
