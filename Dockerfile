FROM node:17 AS BUILD_IMAGE
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin
WORKDIR /build
COPY . .
RUN npm ci && npm run build
RUN npm prune --production
RUN /usr/local/bin/node-prune

FROM node:17-alpine
WORKDIR /usr/src/quenero-merchang
COPY --from=BUILD_IMAGE /build/dist .
COPY --from=BUILD_IMAGE /build/node_modules ./node_modules
CMD [ "node", "app.js" ]
