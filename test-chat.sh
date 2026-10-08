#!/bin/bash

BASE=http://localhost:8080
PRODUCT_ID=3

# Login buyer
BUYER_TOKEN=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"identifier":"chatbuyer","password":"TestPass123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")

# Login seller
SELLER_TOKEN=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"identifier":"chatseller","password":"ChatPass123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")

echo "Buyer token: ${#BUYER_TOKEN} chars"
echo "Seller token: ${#SELLER_TOKEN} chars"
echo "Product ID: $PRODUCT_ID"
echo "---"

echo "=== 1. Start conversation ==="
CONV=$(curl -s -X POST $BASE/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\"productId\":$PRODUCT_ID}")
echo "$CONV" | python3 -m json.tool
CONV_ID=$(echo "$CONV" | python3 -c "import sys,json;print(json.load(sys.stdin).get('id',''))")
echo "Conversation ID: $CONV_ID"
echo ""

echo "=== 2. Buyer sends message ==="
curl -s -X POST $BASE/api/conversations/$CONV_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{"content":"Hi, is this still available?"}' | python3 -m json.tool
echo ""

echo "=== 3. Seller replies ==="
curl -s -X POST $BASE/api/conversations/$CONV_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"content":"Yes, it is available."}' | python3 -m json.tool
echo ""

echo "=== 4. Seller conversation list ==="
curl -s $BASE/api/conversations -H "Authorization: Bearer $SELLER_TOKEN" | python3 -m json.tool | head -40
echo ""

echo "=== 5. Seller unread badge (expect 1) ==="
curl -s $BASE/api/conversations/unread-count -H "Authorization: Bearer $SELLER_TOKEN"
echo ""

echo "=== 6. Mark conversation read ==="
curl -i -X PATCH $BASE/api/conversations/$CONV_ID/read \
  -H "Authorization: Bearer $SELLER_TOKEN" | head -1
echo ""

echo "=== 7. Unread after mark-read (expect 0) ==="
curl -s $BASE/api/conversations/unread-count -H "Authorization: Bearer $SELLER_TOKEN"
echo ""

echo "=== 8. All messages in conversation ==="
curl -s $BASE/api/conversations/$CONV_ID/messages \
  -H "Authorization: Bearer $BUYER_TOKEN" | python3 -m json.tool