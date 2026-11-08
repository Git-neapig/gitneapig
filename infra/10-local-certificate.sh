#!/bin/sh
set -eu
mkdir -p /etc/nginx/tls
if [ ! -f /etc/nginx/tls/fullchain.pem ] || [ ! -f /etc/nginx/tls/privkey.pem ]; then
  umask 077
  openssl req -x509 -nodes -newkey rsa:3072 -days 30 \
    -keyout /etc/nginx/tls/privkey.pem -out /etc/nginx/tls/fullchain.pem \
    -subj "/CN=${TLS_HOST:-localhost}" \
    -addext "subjectAltName=DNS:${TLS_HOST:-localhost},IP:127.0.0.1"
fi
