#!/bin/bash
BASE=http://localhost:8080

BUYER_TOKEN=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"chatbuyer","password":"TestPass123"}' | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")
SELLER_TOKEN=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"chatseller","password":"ChatPass123"}' | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")

echo "Buyer token: ${#BUYER_TOKEN} / Seller token: ${#SELLER_TOKEN}"

ORDER=$(curl -s -X POST $BASE/api/orders -H "Content-Type: application/json" -H "Authorization: Bearer $BUYER_TOKEN" -d '{"productId":3,"quantity":1,"notes":"Test order"}')
ORDER_ID=$(echo "$ORDER" | python3 -c "import sys,json;print(json.load(sys.stdin).get('id',''))")
echo "Order ID: $ORDER_ID"

echo ""
echo "Test 2: Buyer lists own orders"
curl -s "$BASE/api/orders/mine" -H "Authorization: Bearer $BUYER_TOKEN" | python3 -m json.tool | head -12

echo ""
echo "Test 3: Seller lists incoming orders"
curl -s "$BASE/api/orders/seller" -H "Authorization: Bearer $SELLER_TOKEN" | python3 -m json.tool | head -12

echo ""
echo "Test 4: Seller confirms"
curl -s -X PATCH $BASE/api/orders/$ORDER_ID/status -H "Content-Type: application/json" -H "Authorization: Bearer $SELLER_TOKEN" -d '{"status":"CONFIRMED"}' | python3 -m json.tool | grep status

echo ""
echo "Test 5: Seller marks PROCESSING"
curl -s -X PATCH $BASE/api/orders/$ORDER_ID/status -H "Content-Type: application/json" -H "Authorization: Bearer $SELLER_TOKEN" -d '{"status":"PROCESSING"}' | python3 -m json.tool | grep status

echo ""
echo "Test 6: Seller marks COMPLETED"
curl -s -X PATCH $BASE/api/orders/$ORDER_ID/status -H "Content-Type: application/json" -H "Authorization: Bearer $SELLER_TOKEN" -d '{"status":"COMPLETED"}' | python3 -m json.tool | grep status