#!/bin/bash

# Smart Tourist Backend API Testing Suite
echo "🧪 STARTING BACKEND API TESTS"
echo "================================="

BASE_URL="http://localhost:5000"
TOKEN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}TEST 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health.json "$BASE_URL/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Health Check: PASSED${NC}"
else
    echo -e "${RED}❌ Health Check: FAILED (Status: $HEALTH_RESPONSE)${NC}"
fi

# Test 2: Tourist Registration
echo -e "${YELLOW}TEST 2: Tourist Registration${NC}"
REGISTER_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/register.json \
  -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "dateOfBirth": "1990-01-01",
    "nationality": "India",
    "phoneNumber": "+91-9999999999",
    "documentType": "passport",
    "documentNumber": "P1234567"
  }')

if [ "$REGISTER_RESPONSE" = "201" ]; then
    echo -e "${GREEN}✅ Registration: PASSED${NC}"
    TOKEN=$(cat /tmp/register.json | jq -r '.data.token')
    echo "   Token obtained: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ Registration: FAILED (Status: $REGISTER_RESPONSE)${NC}"
    cat /tmp/register.json
fi

# Test 3: Tourist Login
echo -e "${YELLOW}TEST 3: Tourist Login${NC}"
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/login.json \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

if [ "$LOGIN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Login: PASSED${NC}"
    if [ -z "$TOKEN" ]; then
        TOKEN=$(cat /tmp/login.json | jq -r '.data.token')
    fi
else
    echo -e "${RED}❌ Login: FAILED (Status: $LOGIN_RESPONSE)${NC}"
    cat /tmp/login.json
fi

# Test 4: Admin Login
echo -e "${YELLOW}TEST 4: Admin Login${NC}"
ADMIN_LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/admin_login.json \
  -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

if [ "$ADMIN_LOGIN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Admin Login: PASSED${NC}"
    ADMIN_TOKEN=$(cat /tmp/admin_login.json | jq -r '.data.token')
else
    echo -e "${RED}❌ Admin Login: FAILED (Status: $ADMIN_LOGIN_RESPONSE)${NC}"
    cat /tmp/admin_login.json
fi

# Test 5: Emergency Panic Button
echo -e "${YELLOW}TEST 5: Emergency Panic Button${NC}"
if [ -n "$TOKEN" ]; then
    PANIC_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/panic.json \
      -X POST "$BASE_URL/api/emergency/panic" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN")

    if [ "$PANIC_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Panic Button: PASSED${NC}"
    else
        echo -e "${RED}❌ Panic Button: FAILED (Status: $PANIC_RESPONSE)${NC}"
        cat /tmp/panic.json
    fi
else
    echo -e "${RED}❌ Panic Button: SKIPPED (No token)${NC}"
fi

# Test 6: Location Update
echo -e "${YELLOW}TEST 6: Location Update${NC}"
if [ -n "$TOKEN" ]; then
    LOCATION_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/location.json \
      -X POST "$BASE_URL/api/location/update" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "latitude": 26.1445,
        "longitude": 91.7362,
        "accuracy": 10,
        "address": "Guwahati, Assam"
      }')

    if [ "$LOCATION_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Location Update: PASSED${NC}"
    else
        echo -e "${RED}❌ Location Update: FAILED (Status: $LOCATION_RESPONSE)${NC}"
        cat /tmp/location.json
    fi
else
    echo -e "${RED}❌ Location Update: SKIPPED (No token)${NC}"
fi

# Test 7: Dashboard Stats (Admin)
echo -e "${YELLOW}TEST 7: Dashboard Stats${NC}"
if [ -n "$ADMIN_TOKEN" ]; then
    STATS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/stats.json \
      -X GET "$BASE_URL/api/admin/dashboard/stats" \
      -H "Authorization: Bearer $ADMIN_TOKEN")

    if [ "$STATS_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Dashboard Stats: PASSED${NC}"
        echo "   Stats: $(cat /tmp/stats.json | jq -r '.data | keys | join(", ")')"
    else
        echo -e "${RED}❌ Dashboard Stats: FAILED (Status: $STATS_RESPONSE)${NC}"
        cat /tmp/stats.json
    fi
else
    echo -e "${RED}❌ Dashboard Stats: SKIPPED (No admin token)${NC}"
fi

# Test 8: Get All Tourists (Admin)
echo -e "${YELLOW}TEST 8: Get All Tourists${NC}"
if [ -n "$ADMIN_TOKEN" ]; then
    TOURISTS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/tourists.json \
      -X GET "$BASE_URL/api/admin/tourists" \
      -H "Authorization: Bearer $ADMIN_TOKEN")

    if [ "$TOURISTS_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Get Tourists: PASSED${NC}"
        TOURIST_COUNT=$(cat /tmp/tourists.json | jq '.data | length')
        echo "   Found $TOURIST_COUNT tourists"
    else
        echo -e "${RED}❌ Get Tourists: FAILED (Status: $TOURISTS_RESPONSE)${NC}"
        cat /tmp/tourists.json
    fi
else
    echo -e "${RED}❌ Get Tourists: SKIPPED (No admin token)${NC}"
fi

# Cleanup
rm -f /tmp/*.json

echo -e "${YELLOW}=================================${NC}"
echo -e "${GREEN}🎯 BACKEND API TESTS COMPLETED${NC}"
