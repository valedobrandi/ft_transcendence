#!/bin/sh
set -e

DB_FILE="/app/database/pong.db"
CERT_DIR="/certs"
KEY_FILE="$CERT_DIR/key.pem"
CERT_FILE="$CERT_DIR/cert.pem"

# If DB file doesn't exist, initialize it
if [ ! -f "$DB_FILE" ]; then
  echo "Database not found, initializing..."
  npm run database
fi

sleep 5

# If certs don't exist, generate self-signed ones
if [ ! -f "$KEY_FILE" ] || [ ! -f "$CERT_FILE" ]; then
  echo "SSL certificates not found, generating self-signed certs..."
  mkdir -p "$CERT_DIR"
  openssl req -x509 -newkey rsa:4096 -nodes \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days 365 \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
fi

# Start backend
exec "$@"


