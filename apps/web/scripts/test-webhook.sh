#!/bin/bash

# Test payload
payload='{"event":"payment.created","data":{"paymentId":"test_123","amount":100},"timestamp":1234567890}'

# Generate signature using the webhook secret from .env
signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "test_webhook_secret_123" -hex | cut -d' ' -f2)

# Print the curl command for reference
echo "Generated signature: $signature"
echo "Making request to webhook endpoint..."

# Make the request
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $signature" \
  -d "$payload" 