#!/bin/sh
set -e

echo "▶ Aplicando migrations do banco de dados..."
node node_modules/prisma/build/index.js migrate deploy

echo "▶ Iniciando a aplicação..."
exec node server.js
