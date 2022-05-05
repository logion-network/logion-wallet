# Build image
FROM node:16 AS build

WORKDIR /tmp/logion-wallet

COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

# Deployment image
FROM jonasal/nginx-certbot:3
COPY --from=build /tmp/logion-wallet/build /usr/share/nginx/html

COPY ./docker /usr/docker
RUN chmod +x /usr/docker/*

ENTRYPOINT ["/usr/docker/docker-entrypoint.sh"]
CMD [ "/scripts/start_nginx_certbot.sh" ]
