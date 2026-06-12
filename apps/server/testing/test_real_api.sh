#!/usr/bin/env bash
# =============================================================================
# test_real_api.sh — API Test Suite for AudioMesh Backend
#
# Tests all AudioMesh REST endpoints (room CRUD, topology, RTT) and verifies
# pass/fail tracking across all test steps.
# =============================================================================

set -uo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:50065}"

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Stats trackers ────────────────────────────────────────────────────────────
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# ── Helpers ───────────────────────────────────────────────────────────────────
print_step() {
  printf "\n${CYAN}${BOLD}▶ %s${RESET}\n" "$1" >&2
}

print_success() {
  printf "${GREEN}✓ %s${RESET}\n" "$1" >&2
}

print_error() {
  printf "${RED}✗ ERROR: %s${RESET}\n" "$1" >&2
}

# Low-level request helper
# Returns a JSON string containing "status" and "body"
request() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  
  local response
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "${BASE_URL}${path}" || printf "\n000")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      "${BASE_URL}${path}" || printf "\n000")
  fi
  
  local status_code
  status_code=$(printf "%s\n" "$response" | tail -n 1 | tr -d '\r' | xargs)
  
  local body
  body=$(printf "%s\n" "$response" | sed '$d')
  
  if [ -z "$status_code" ] || [ "$status_code" = "" ]; then
    status_code="000"
  fi
  
  # Return JSON structure
  jq -n --arg code "$status_code" --arg body "$body" '{"status": ($code|tonumber), "body": $body}'
}

# Run a test step and update statistics
# Usage: run_api_test <method> <path> [payload_json] [expected_status]
run_api_test() {
  local method="$1"
  local path="$2"
  local payload="${3:-}"
  local expected_status="${4:-200}"
  
  TESTS_TOTAL=$((TESTS_TOTAL + 1))
  
  local res
  res=$(request "$method" "$path" "$payload")
  local status
  status=$(printf "%s\n" "$res" | jq -r '.status')
  local body
  body=$(printf "%s\n" "$res" | jq -r '.body')
  
  if [ "${status:-0}" -eq "${expected_status}" ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    print_success "$method $path -> HTTP $status (Expected $expected_status)"
    printf "%s\n" "$body" | jq '.' 2>/dev/null || printf "%s\n" "$body"
    return 0
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    print_error "$method $path -> Got HTTP $status, Expected $expected_status"
    printf "%s\n" "$body" >&2
    return 1
  fi
}

# ── Preflight Checks ──────────────────────────────────────────────────────────
clear
printf "${BOLD}====================================================${RESET}\n"
printf "${BOLD}       AudioMesh REST API Test Tool              ${RESET}\n"
printf "${BOLD}====================================================${RESET}\n"
printf "Target Server URL: ${CYAN}%s${RESET}\n" "${BASE_URL}"

# Verify jq is installed
if ! command -v jq &> /dev/null; then
  print_error "'jq' is required but not installed."
  printf "Please install jq first (e.g. 'brew install jq').\n"
  exit 1
fi

# Verify server connectivity / health
res=$(request GET "/health")
status_code=$(printf "%s\n" "$res" | jq -r '.status')
if [ "${status_code:-0}" -eq 0 ] || [ "${status_code:-0}" -ne 200 ]; then
  print_error "Cannot connect to AudioMesh backend server at ${BASE_URL}."
  printf "Ensure the server is running (e.g. 'cargo run' or similar).\n"
  exit 1
fi

print_success "Server is reachable and healthy."

# ── Step 1: Create an SFU Room ────────────────────────────────────────────────
print_step "Step 1: Create an SFU Room"
sfu_room_payload=$(jq -n \
  --arg name "Living Room SFU" \
  --arg mode "sfu" \
  --arg host "host-device-sfu" \
  '{name: $name, mode: $mode, host_peer_id: $host}')

sfu_create_res=$(request POST "/mesh/rooms" "$sfu_room_payload")
sfu_status=$(printf "%s\n" "$sfu_create_res" | jq -r '.status')
sfu_body=$(printf "%s\n" "$sfu_create_res" | jq -r '.body')

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ "${sfu_status:-0}" -eq 201 ]; then
  TESTS_PASSED=$((TESTS_PASSED + 1))
  sfu_room_id=$(printf "%s\n" "$sfu_body" | jq -r '.id')
  print_success "POST /mesh/rooms (SFU) -> HTTP 201 (Created room ID: $sfu_room_id)"
else
  TESTS_FAILED=$((TESTS_FAILED + 1))
  print_error "Failed to create SFU room: $sfu_body"
  exit 1
fi

# ── Step 2: Create a Daisy-Chain Room with Custom Nodes ─────────────────────────
print_step "Step 2: Create a Daisy-Chain Room with Custom Max Nodes"
daisy_room_payload=$(jq -n \
  --arg name "Hallway Chain" \
  --arg mode "daisy_chain" \
  --arg host "host-device-daisy" \
  --argjson max_nodes 10 \
  '{name: $name, mode: $mode, host_peer_id: $host, max_nodes: $max_nodes}')

daisy_create_res=$(request POST "/mesh/rooms" "$daisy_room_payload")
daisy_status=$(printf "%s\n" "$daisy_create_res" | jq -r '.status')
daisy_body=$(printf "%s\n" "$daisy_create_res" | jq -r '.body')

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ "${daisy_status:-0}" -eq 201 ]; then
  TESTS_PASSED=$((TESTS_PASSED + 1))
  daisy_room_id=$(printf "%s\n" "$daisy_body" | jq -r '.id')
  print_success "POST /mesh/rooms (Daisy-Chain) -> HTTP 201 (Created room ID: $daisy_room_id)"
else
  TESTS_FAILED=$((TESTS_FAILED + 1))
  print_error "Failed to create Daisy-Chain room: $daisy_body"
  exit 1
fi

# ── Step 3: List Rooms ────────────────────────────────────────────────────────
print_step "Step 3: List Active Rooms"
run_api_test GET "/mesh/rooms" "" 200 >/dev/null

# ── Step 4: Get Room Details ──────────────────────────────────────────────────
print_step "Step 4: Get SFU Room Details"
run_api_test GET "/mesh/rooms/${sfu_room_id}" "" 200 >/dev/null

# ── Step 5: Get Topology Tree ─────────────────────────────────────────────────
print_step "Step 5: Get Daisy-Chain Room Topology (Should be empty initially)"
run_api_test GET "/mesh/rooms/${daisy_room_id}/topology" "" 200 >/dev/null

# ── Step 6: Negative Test - Get Non-Existent Room ─────────────────────────────
print_step "Step 6: Get Non-Existent Room (Expected 404)"
run_api_test GET "/mesh/rooms/nonexistent-room-id" "" 404 >/dev/null

# ── Step 7: Negative Test - Report RTT on Non-Existent Room ───────────────────
print_step "Step 7: Report RTT on Non-Existent Room (Expected 404)"
rtt_payload=$(jq -n \
  --arg from "host-device-daisy" \
  --arg to "peer-device-1" \
  --argjson rtt 15.5 \
  '{from_peer_id: $from, to_peer_id: $to, rtt_ms: $rtt}')

run_api_test POST "/mesh/rooms/nonexistent-room-id/topology/rtt" "$rtt_payload" 404 >/dev/null

# ── Step 8: Close and Delete Rooms ────────────────────────────────────────────
print_step "Step 8: Close and Delete Active Rooms"
run_api_test DELETE "/mesh/rooms/${sfu_room_id}" "" 200 >/dev/null
run_api_test DELETE "/mesh/rooms/${daisy_room_id}" "" 200 >/dev/null

# ── Step 9: Verify Deletion ───────────────────────────────────────────────────
print_step "Step 9: Verify Rooms are Deleted (Expected 404)"
run_api_test GET "/mesh/rooms/${sfu_room_id}" "" 404 >/dev/null
run_api_test GET "/mesh/rooms/${daisy_room_id}" "" 404 >/dev/null

# ── FINAL SUMMARY ─────────────────────────────────────────────────────────────
printf "\n${BOLD}====================================================${RESET}\n"
printf "${BOLD}             API Test Suite Summary                 ${RESET}\n"
printf "${BOLD}====================================================${RESET}\n"
printf "Total Tests Executed: ${CYAN}%s${RESET}\n" "${TESTS_TOTAL}"
printf "Passed:               ${GREEN}%s${RESET}\n" "${TESTS_PASSED}"
printf "Failed:               ${RED}%s${RESET}\n" "${TESTS_FAILED}"
printf "${BOLD}====================================================${RESET}\n"

if [ "${TESTS_FAILED:-0}" -eq 0 ]; then
  printf "${GREEN}${BOLD}         ALL TESTS COMPLETED SUCCESSFULLY!          ${RESET}\n"
  exit 0
else
  printf "${RED}${BOLD}         SOME TESTS ENCOUNTERED FAILURES.           ${RESET}\n"
  exit 1
fi
