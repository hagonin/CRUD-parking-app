#!/bin/bash

API_URL="http://localhost:3000"
DELAY=1

echo "STARTING API TESTS"
echo "========================"
sleep $DELAY

# Test 1: GET all reservations
echo -e "\nTEST 1: GET /reservations"
curl -s "$API_URL/reservations" | head -c 200
echo -e "\n"

# Test 2: POST create a new reservation
echo -e "\nTEST 2: POST /reservations (Create new)"
RESPONSE=$(curl -s -X POST "$API_URL/reservations" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "John Doe",
    "parkingId": 1,
    "vehicle": "Tesla Model 3",
    "licensePlate": "ABC-123"
  }')
echo "$RESPONSE" | head -c 200
NEW_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo -e "\n"

# Test 3: GET reservation by ID
if [ ! -z "$NEW_ID" ]; then
  echo -e "\nTEST 3: GET /reservations/$NEW_ID"
  curl -s "$API_URL/reservations/$NEW_ID" | head -c 200
  echo -e "\n"
fi

# Test 4: PUT update reservation
if [ ! -z "$NEW_ID" ]; then
  echo -e "\nTEST 4: PUT /reservations/$NEW_ID (Update)"
  curl -s -X PUT "$API_URL/reservations/$NEW_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "clientName": "Jane Doe",
      "vehicle": "BMW X5"
    }' | head -c 200
  echo -e "\n"
fi

# Test 5: GET parkings (to get valid parking ID)
echo -e "\nTEST 5: GET /parkings"
PARKING=$(curl -s "$API_URL/parkings")
PARKING_ID=$(echo "$PARKING" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "$PARKING" | head -c 200
echo -e "\n"

# Test 6: GET reservations by parking ID
if [ ! -z "$PARKING_ID" ]; then
  echo -e "\nTEST 6: GET /parkings/$PARKING_ID/reservations"
  curl -s "$API_URL/parkings/$PARKING_ID/reservations" | head -c 200
  echo -e "\n"
fi

# Test 7: DELETE reservation
if [ ! -z "$NEW_ID" ]; then
  echo -e "\nTEST 7: DELETE /reservations/$NEW_ID"
  curl -s -X DELETE "$API_URL/reservations/$NEW_ID" -w "\nStatus: %{http_code}\n"
  echo -e "\n"
fi

# Test 8: Verify deletion
if [ ! -z "$NEW_ID" ]; then
  echo -e "\nTEST 8: GET /reservations/$NEW_ID (After delete - should 404)"
  curl -s "$API_URL/reservations/$NEW_ID" -w "\nStatus: %{http_code}\n"
  echo -e "\n"
fi

echo "========================"
echo "ALL TESTS COMPLETED"
