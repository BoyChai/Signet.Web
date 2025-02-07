FROM ocir.workstation.boychai.xyz/node:20.15.1-alpine3.20 AS build

WORKDIR /app

COPY ./ /app

RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install \
    && npm run build

FROM ocir.workstation.boychai.xyz/nginx:alpine3.20

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80