#!/bin/bash

BASE=http://localhost:8080
CONV_ID=1   # the conversation we already created between chatbuyer and chatseller

# Login buyer + seller
BUYER_TOKEN=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"chatbuyer","password":"TestPass123"}' | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")

SELLER_TOKEN=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"chatseller","password":"ChatPass123"}' | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")

echo "Buyer: ${#BUYER_TOKEN} / Seller: ${#SELLER_TOKEN}"
echo "---"

# 1. Buyer makes an offer
echo "=== 1. Buyer offers ₦700 ==="
OFFER=$(curl -s -X POST $BASE/api/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\"conversationId\":$CONV_ID,\"amount\":700,\"note\":\"Will you take 700?\"}")
echo "$OFFER" | python3 -m json.tool
OFFER_ID=$(echo "$OFFER" | python3 -c "import sys,json;print(json.load(sys.stdin).get('id',''))")
echo "Offer ID: $OFFER_ID"
echo ""

# 2. Seller counters with ₦900
echo "=== 2. Seller counters ₦900 ==="
COUNTER=$(curl -s -X POST $BASE/api/offers/$OFFER_ID/counter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"amount":900,"note":"Best I can do is 900"}')
echo "$COUNTER" | python3 -m json.tool
COUNTER_ID=$(echo "$COUNTER" | python3 -c "import sys,json;print(json.load(sys.stdin).get('id',''))")
echo ""

# 3. Buyer accepts counter
echo "=== 3. Buyer accepts counter ==="
curl -s -X PUT $BASE/api/offers/$COUNTER_ID/accept \
  -H "Authorization: Bearer $BUYER_TOKEN" | python3 -m json.tool
echo ""

# 4. List all offers in conversation
echo "=== 4. All offers in conversation ==="
curl -s $BASE/api/offers/conversation/$CONV_ID \
  -H "Authorization: Bearer $BUYER_TOKEN" | python3 -m json.tool