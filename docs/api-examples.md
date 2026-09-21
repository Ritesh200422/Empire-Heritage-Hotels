# API Examples

All examples use `curl`. The server must be running at `http://localhost:3000`.

## 1. Normal Question

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "demo-session-1",
    "message": "What time is check-in?"
  }'
```

**Expected Response:**
```json
{
  "type": "answer",
  "message": "Check-in time is at 2:00 PM (14:00) and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request, subject to availability.",
  "sources": ["faq-checkin-time", "policy-checkin"],
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## 2. Availability Request (Missing Info)

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "demo-session-2",
    "message": "I want to book a room"
  }'
```

**Expected Response:**
```json
{
  "type": "availability_request",
  "message": "I'd be happy to check room availability for you! Could you please provide the following: check-in date, check-out date, number of adults?",
  "missingFields": ["checkIn", "checkOut", "adults"],
  "requestId": "..."
}
```

## 3. Full Availability Check

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "demo-session-3",
    "message": "Check availability for 2 adults",
    "availabilityForm": {
      "checkIn": "2027-06-15",
      "checkOut": "2027-06-18",
      "adults": 2
    }
  }'
```

**Expected Response:**
```json
{
  "type": "availability_result",
  "message": "I found 4 room option(s) available for your dates (2027-06-15 to 2027-06-18, 2 adults).",
  "availability": {
    "checkIn": "2027-06-15",
    "checkOut": "2027-06-18",
    "adults": 2,
    "options": [
      {
        "roomTypeId": "room-standard",
        "name": "Standard Room",
        "unitsLeft": 20,
        "pricePerNight": 129,
        "totalPrice": 387,
        "nights": 3
      },
      {
        "roomTypeId": "room-deluxe",
        "name": "Deluxe Ocean View",
        "unitsLeft": 15,
        "pricePerNight": 219,
        "totalPrice": 657,
        "nights": 3
      }
    ]
  },
  "requestId": "..."
}
```

## 4. Follow-Up Question (Same Session)

```bash
# First question
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "demo-session-4",
    "message": "What time is check-in?"
  }'

# Follow-up (same sessionId for context)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "demo-session-4",
    "message": "And what about check-out?"
  }'
```

**Expected Response:**
```json
{
  "type": "answer",
  "message": "Check-out time is at 11:00 AM. Late check-out may be available upon request, subject to availability and may incur additional charges.",
  "sources": ["policy-checkin", "faq-checkin-time"],
  "requestId": "..."
}
```

## 5. Invalid Request Body

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello"
  }'
```

**Expected Response (400):**
```json
{
  "type": "error",
  "message": "Validation error: sessionId: Required",
  "requestId": "..."
}
```

## 6. Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-21T12:00:00.000Z",
  "database": "connected"
}
```
