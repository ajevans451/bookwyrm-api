#!/bin/bash
#
# '{
#   "listing": {
#     "title": "test listing",
#     "description": "test test test",
#     "sellPrice": "13",
#     "minStartingBid": "1"
#   }
# }'
API="http://localhost:4741"
URL_PATH="/listings"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
      "listing": {
        "title": "'"${TITLE}"'",
        "description": "'"${DESC}"'",
        "sellPrice": "'"${PRICE}"'",
        "minStartingBid": "'"${STARTBID}"'"
      }
    }'

echo
