ARG image=node:23.11.1-alpine3.20

FROM ${image} AS buildDeps

COPY package*.json ./

RUN npm ci



FROM ${image} AS build

COPY . .
COPY --from=buildDeps node_modules ./node_modules

RUN npx nest build



FROM ${image} AS deps

COPY package*.json ./

RUN npm ci --omit=dev



FROM ${image} AS api

WORKDIR /api

COPY --from=deps node_modules ./node_modules
COPY --from=build dist .

CMD [ "node", "src/main" ]
