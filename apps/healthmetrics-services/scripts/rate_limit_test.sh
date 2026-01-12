#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="${1:-}"

# Defaults (can be overridden by the config file).
base_url="http://localhost:8080"
barcode="819215021416"
api_key=""
user_id=""
cookie=""
count="15"
request_id_prefix="req_rate"
sleep_sec="0"

if [[ -n "$CONFIG_FILE" ]]; then
  if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "config file not found: $CONFIG_FILE"
    exit 1
  fi

  # Read KEY=VALUE pairs without eval (cookie contains semicolons).
  while IFS= read -r line || [[ -n "$line" ]]; do
    case "$line" in
      ""|\#*) continue ;; # skip empty lines and comments
    esac

    key="${line%%=*}"
    value="${line#*=}"

    case "$key" in
      BASE_URL) base_url="$value" ;;
      BARCODE) barcode="$value" ;;
      X_API_KEY) api_key="$value" ;;
      X_USER_ID) user_id="$value" ;;
      COOKIE) cookie="$value" ;;
      COUNT) count="$value" ;;
      REQUEST_ID_PREFIX) request_id_prefix="$value" ;;
      SLEEP_SEC) sleep_sec="$value" ;;
      *) echo "unknown key in config: $key" ;;
    esac
  done < "$CONFIG_FILE"
fi

if [[ -z "$barcode" || -z "$api_key" || -z "$user_id" || -z "$cookie" ]]; then
  echo "missing required values (BARCODE, X_API_KEY, X_USER_ID, COOKIE)"
  echo "either pass a config file or set them at the top of this script"
  exit 1
fi

for i in $(seq 1 "$count"); do
  req_id="${request_id_prefix}_${i}"
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Accept: application/json" \
    -H "X-API-Key: $api_key" \
    -H "X-User-ID: $user_id" \
    -H "X-Request-ID: $req_id" \
    -H "Cookie: $cookie" \
    "$base_url/v1/barcodes/$barcode")
  echo "$i $status"
  if [[ "$sleep_sec" != "0" ]]; then
    sleep "$sleep_sec"
  fi
done
