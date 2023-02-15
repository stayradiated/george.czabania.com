FROM nginx:alpine

WORKDIR /app

COPY ./dist ./static
COPY ./nginx.conf /etc/nginx/nginx.conf

