#!/bin/bash

# Loop 10000 times
for i in {1..10000}
do
  echo "Executing request $i of 10000..."

  curl --location 'http://localhost:3010/011/app/int_trng_takuitbv/core-svc/post/create' \
  --header 'accept: application/json, text/plain, */*' \
  --header 'accept-language: en-GB,en;q=0.9' \
  --header 'content-type: application/json' \
  --header 'origin: https://dev.talk.ukg.net' \
  --header 'priority: u=1, i' \
  --header 'referer: https://dev.talk.ukg.net/011/app/int_trng_tsw1c9tm/?showCreate=true' \
  --header 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \
  --header 'sec-ch-ua-mobile: ?0' \
  --header 'sec-ch-ua-platform: "macOS"' \
  --header 'sec-fetch-dest: empty' \
  --header 'sec-fetch-mode: cors' \
  --header 'sec-fetch-site: same-origin' \
  --header 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
  --header 'x-correlation-id: d8ab7b28-f5ce-45f5-990c-40c15d7fc158' \
  --header 'Cookie: dev_user_auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODhiMTE3NDQxZmVmNjE2NWQ3MDYxNmEiLCJkZXZpY2VBdXRoIjoiMmIxMGMxYWY2MjViNzEyNGUyNjNhN2E3ZDMwOGM1MjdiMGRlZjFmMSIsImV4dHJhIjp7InVrZ1Byb2R1Y3RUb2tlbiI6IjY5MzcwMzI1MjBkZTdlYTU3NWY1NTcwMSIsInRlbmFudERvbWFpbiI6InRhbGtzb2MwOF9ub25wcmRfMDEiLCJwYXJlbnRBcHBJZGVudGlmaWVyIjoiRElNIiwicGFyZW50QXBwVXNlcklkIjoiU2Vhbkl2YW4iLCJsb2dMZXZlbCI6IkVSUk9SIiwidGVuYW50U2hvcnROYW1lIjoiaW50X3RybmdfdGc4c2d4NmoiLCJleHBpcmVzX2luIjo0MzIwMH0sImNyZWF0ZWRBdCI6MTc2NTIxMjk2NTM5MywiaWF0IjoxNzY1MjEyOTY1LCJleHAiOjE3Njc4MDQ5NjV9.tt-4TSkPZO5fnS8ZGNb-sNsedQbAG8fgM7y-ZyIpFBg; Max-Age=2592000; Domain=ukg.net; Path=/; Expires=Wed, 07 Jan 2026 16:56:05 GMT; Cloud-CDN-Cookie=URLPrefix=aHR0cHM6Ly9kZXYudGFsay51a2cubmV0LzAxMS9zdGF0aWMvcHJpdmF0ZS82ODg5YmRjYjQ4OTY3MWJjMTFmNDVhY2Iv:Expires=1767804965:KeyName=talk-dev-upload:Signature=Il8LMZ5Kpu-O4ymRN3zqlumN52w=; Max-Age=2592000; Domain=ukg.net; Path=/; Expires=Wed, 07 Jan 2026 16:56:05 GMT; dev_groupe_auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhiMTE3NDQxZmVmNjE2NWQ3MDYxNmEiLCJfX2F1dGhWMyI6dHJ1ZSwiZXh0cmEiOnsidWtnUHJvZHVjdFRva2VuIjoiNjkzNzAzMjUyMGRlN2VhNTc1ZjU1NzAxIiwidGVuYW50RG9tYWluIjoidGFsa3NvYzA4X25vbnByZF8wMSIsInBhcmVudEFwcElkZW50aWZpZXIiOiJESU0iLCJwYXJlbnRBcHBVc2VySWQiOiJTZWFuSXZhbiIsImxvZ0xldmVsIjoiRVJST1IiLCJ0ZW5hbnRTaG9ydE5hbWUiOiJpbnRfdHJuZ190ZzhzZ3g2aiIsImV4cGlyZXNfaW4iOjQzMjAwLCJkZXZpY2VBdXRoIjoiMmIxMGMxYWY2MjViNzEyNGUyNjNhN2E3ZDMwOGM1MjdiMGRlZjFmMSJ9LCJjcmVhdGVkQXQiOjE3NjUyMTI5NjUzOTQsImlhdCI6MTc2NTIxMjk2NSwiZXhwIjoxNzY3ODA0OTY1fQ.q8dktT-hVN5ysOHl26kzu4zGCq22xabrONS-6bP5VfQ; Max-Age=2592000; Domain=ukg.net; Path=/; Expires=Wed, 07 Jan 2026 16:56:05 GMT' \
  --data '{
     "_owner": "679728f88e9b3ecde18dcd9a",
    "_user": "679728f88e9b3ecde18dcd9a",
    "_channel": "67926ab87bc534418e0e5837",
    "ownerId": "679728f88e9b3ecde18dcd9a",
    "channelId": "67926ab87bc534418e0e5837",
    "user": "Sean Ivan",
    "searcherId": "679728f88e9b3ecde18dcd9a",
    "type": "NORMAL",
    "text": "how are you",
    "richText": {
        "ops": [
            {
                "insert": "system report cruel team\n"
            }
        ]
    },
    "attachments": [],
    "accept-language": "en_gb"
}'

  echo ""
  echo "-----------------------------------"
  echo ""
done

echo "All 10000 requests completed!"
