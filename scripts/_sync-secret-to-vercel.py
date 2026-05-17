#!/usr/bin/env python3
"""Generic secret sync to Vercel × 3 envs via REST API.

Reads:
  - SECRET_KEY env var (name of secret to set in Vercel)
  - SECRET_VALUE env var (the actual secret value, injected by tene run)
  - VERCEL_TOKEN env var (Vercel API token)
  - VERCEL_PROJECT_ID, VERCEL_TEAM_ID env vars

Behavior:
  - Lists existing entries for SECRET_KEY, deletes them
  - Adds new entries for production / preview / development
  - Never prints secret value to stdout
"""
import json
import os
import sys
import urllib.error
import urllib.request

SECRET_KEY = os.environ.get("SECRET_KEY")
SECRET_VALUE = os.environ.get("SECRET_VALUE")
VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN")
PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID")
TEAM_ID = os.environ.get("VERCEL_TEAM_ID")

required = {
    "SECRET_KEY": SECRET_KEY,
    "SECRET_VALUE": SECRET_VALUE,
    "VERCEL_TOKEN": VERCEL_TOKEN,
    "VERCEL_PROJECT_ID": PROJECT_ID,
    "VERCEL_TEAM_ID": TEAM_ID,
}
missing = [k for k, v in required.items() if not v]
if missing:
    print(f"MISSING_ENV_VARS: {missing}", file=sys.stderr)
    sys.exit(1)


def request(method, url, body=None):
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json",
    }
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


# 1) List existing entries with this key, delete them
status, listing = request(
    "GET", f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env?teamId={TEAM_ID}"
)
existing_ids = [e["id"] for e in listing.get("envs", []) if e.get("key") == SECRET_KEY]
print(f"[1/2] {SECRET_KEY}: {len(existing_ids)} existing → deleting")
for env_id in existing_ids:
    code, _ = request(
        "DELETE",
        f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env/{env_id}?teamId={TEAM_ID}",
    )
    print(f"  - delete {env_id}: HTTP {code}")

# 2) Add to all 3 envs
print(f"[2/2] {SECRET_KEY}: adding to production / preview / development")
for env in ["production", "preview", "development"]:
    code, body = request(
        "POST",
        f"https://api.vercel.com/v10/projects/{PROJECT_ID}/env?teamId={TEAM_ID}",
        {
            "key": SECRET_KEY,
            "value": SECRET_VALUE,
            "type": "encrypted",
            "target": [env],
        },
    )
    ok = 200 <= code < 300 and bool(body.get("created"))
    status_str = "OK" if ok else f"FAIL (HTTP {code}, {str(body)[:200]})"
    print(f"  - {env}: {status_str}")
