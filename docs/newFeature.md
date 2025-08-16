
### Active Subscription System with Admin-Generated Activation Codes

Base URL: {baseUrl}/api/v1

Auth header (all endpoints): Authorization: Bearer <token>  
Content type: application/json

## Admin APIs

### Create Activation Code
- Method: POST
- Path: /admin/activation-codes
- Auth: Admin
- Body:
{
  "description": "Optional note",
  "durationMonths": 1,
  "maxUses": 100,
  "expiresAt": "2030-01-01T00:00:00Z",
  "studyPackIds": [7, 8]
}
- Constraints:
  - durationMonths: 1–60
  - maxUses: 1–10000
  - expiresAt: future ISO datetime
  - studyPackIds: 1–50 items, positive integers
- Success 201 (example):
{
  "success": true,
  "data": {
    "message": "Activation code created successfully",
    "activationCode": {
      "id": 3,
      "code": "LAK8TE4O1YVJ",
      "description": "Optional note",
      "durationMonths": 1,
      "maxUses": 100,
      "currentUses": 0,
      "isActive": true,
      "expiresAt": "2030-01-01T00:00:00.000Z",
      "studyPacks": [
        { "studyPack": { "id": 7, "name": "..." } }
      ]
    }
  }
}

### List Activation Codes
- Method: GET
- Path: /admin/activation-codes
- Auth: Admin
- Query params: page (default 1), limit (default 20, max 100), isActive (true/false), search, createdBy
- Success 200 (example):
{
  "success": true,
  "data": {
    "message": "Activation codes retrieved successfully",
    "activationCodes": [
      { "id": 3, "code": "LAK8TE4O1YVJ", "isActive": true, "currentUses": 1, "maxUses": 2, "studyPacks":[{"studyPack":{"id":8}}] }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
  }
}

### Deactivate Activation Code
- Method: PATCH
- Path: /admin/activation-codes/:id/deactivate
- Auth: Admin
- Success 200 (example):
{
  "success": true,
  "data": {
    "message": "Activation code deactivated successfully",
    "activationCode": { "id": 3, "code": "LAK8TE4O1YVJ", "isActive": false, "currentUses": 1 }
  }
}

## Student APIs

### Validate Activation Code
- Method: POST
- Path: /students/codes/validate
- Auth: Student
- Body:
{ "code": "K5J7N5KKFY9Z" }
- Constraints:
  - code: 8–32 chars, uppercase [A-Z0-9-]
- Success 200 (example):
{
  "success": true,
  "data": {
    "message": "Activation code is valid",
    "isValid": true,
    "code": {
      "id": 2, "code": "K5J7N5KKFY9Z",
      "durationMonths": 1, "maxUses": 2, "currentUses": 0, "expiresAt": "2030-01-01T00:00:00.000Z"
    },
    "studyPacks": [{ "id": 7, "name": "First Year Medicine", "isActive": true }]
  }
}
- Errors 400:
  - Invalid/expired/deactivated/reached-usage-limit
  - Validation errors (format/length)

### Redeem Activation Code
- Method: POST
- Path: /students/codes/redeem
- Auth: Student
- Body:
{ "code": "LAK8TE4O1YVJ" }
- Success 201 (example):
{
  "success": true,
  "data": {
    "success": true,
    "message": "Activation code redeemed successfully",
    "data": {
      "subscriptions": [
        {
          "id": 13,
          "status": "ACTIVE",
          "startDate": "2025-08-14T14:30:48.799Z",
          "endDate": "2025-09-14T14:30:48.799Z",
          "amountPaid": 0,
          "paymentMethod": "ACTIVATION_CODE",
          "studyPack": { "id": 8, "name": "Second Year Medicine" }
        }
      ],
      "redemption": { "id": 1, "activationCodeId": 3, "userId": 11, "subscriptionId": 13 },
      "activationCode": { "id": 3, "code": "LAK8TE4O1YVJ" }
    }
  }
}
- Notes:
  - If the user already has an active subscription to a listed study pack, no new subscription is created; redemption still succeeds and usage increments.
- Errors:
  - 400 “You have already redeemed this activation code”
  - 400 invalid/expired/deactivated/usage-limit
  - 429 “Too many activation code validation/redemption attempts” (rate limiting)


### Get User Subscriptions
- Method: GET
- Path: /students/subscriptions
- Auth: Student
- Success 200 (example):
{
  "success": true,
  "data": {
    "success": true,
    "data": [
      {
        "id": 13, "status": "ACTIVE",
        "startDate": "2025-08-14T14:30:48.799Z", "endDate": "2025-09-14T14:30:48.799Z",
        "paymentMethod": "ACTIVATION_CODE",
        "studyPack": { "id": 8, "name": "Second Year Medicine" },
        "isActive": true, "daysRemaining": 31
      }
    ]
  }
}

## curl examples

- Create code (admin):
curl -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" \
  -X POST http://localhost:3005/api/v1/admin/activation-codes \
  -d '{"description":"Promo A","durationMonths":1,"maxUses":2,"expiresAt":"2030-01-01T00:00:00Z","studyPackIds":[7]}'

- Validate code (student):
curl -H "Authorization: Bearer <STUDENT_TOKEN>" -H "Content-Type: application/json" \
  -X POST http://localhost:3005/api/v1/students/codes/validate \
  -d '{"code":"K5J7N5KKFY9Z"}'

- Redeem code (student):
curl -H "Authorization: Bearer <STUDENT_TOKEN>" -H "Content-Type: application/json" \
  -X POST http://localhost:3005/api/v1/students/codes/redeem \
  -d '{"code":"K5J7N5KKFY9Z"}'

- Deactivate code (admin):
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -X PATCH http://localhost:3005/api/v1/admin/activation-codes/3/deactivate

- List codes (admin):
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
  "http://localhost:3005/api/v1/admin/activation-codes?page=1&limit=10"

- Get user subscriptions (student):
curl -H "Authorization: Bearer <STUDENT_TOKEN>" \
  http://localhost:3005/api/v1/students/subscriptions

## Common errors
- 400: invalid code, expired, deactivated, usage limit reached, duplicate redemption, body validation errors
- 401: missing/invalid token
- 403: non-admin calling admin endpoints
- 429: too many validation/redemption attempts (rate limit)

- Summary
  - Included admin endpoints to create/list/deactivate codes and student endpoints to validate/redeem codes plus view subscriptions.
  - Provided minimal request/response examples, constraints, and common errors with curl snippets.