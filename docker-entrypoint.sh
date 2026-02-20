#!/bin/sh
set -e

echo "▶ Aplicando migrations do banco de dados..."
node_modules/.bin/prisma migrate deploy

echo "▶ Iniciando a aplicação..."
exec node server.js
