# Build image
FROM node:14 AS build

WORKDIR /tmp/logion-wallet

COPY . .
RUN yarn install
RUN yarn build

# Deployment image
FROM nginx
COPY --from=build /tmp/logion-wallet/build /usr/share/nginx/html
