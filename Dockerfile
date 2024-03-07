FROM node:alpine AS build
LABEL authors="Noah Visser"

WORKDIR /

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install
COPY . .
RUN npm run build


FROM node:alpine
LABEL authors="Noah Visser"

RUN mkdir /dist/
COPY --from=build /build/ /build/
COPY --from=build package*.json /
COPY --from=build /node_modules/ /node_modules/

ENTRYPOINT ["node", "/build/server.js"]
