# SAITO Control — Smart EXP Cap Auto-Stop, On-Demand Control & D1 Database

A comprehensive update addressing daily EXP limits, serverless resource conservation, on-demand bot activation, and secure cloud persistence.

### User Review & Critical Decisions

> [!IMPORTANT]
> Based on your live test logs showing unchanged EXP (Level: 8, EXP: 4638 across matches #229–#297):
> - **EXP Stagnation / Daily Limit Auto-Stop**: The bot worker detects when consecutive EXP refreshes return the exact same EXP value. Once detected (default: 2 consecutive stagnant refreshes after matches), the worker automatically pauses that account, sets status to `EXP_CAPPED`, and logs `[!] [EXP-CAP] UID {uid} reached daily cap (EXP: {val} unchanged). Pausing to conserve resources.`
> - **On-Demand Boot & Control**: The Python backend on Render boots in **standby/idle mode** without automatically firing match packets. Workers only start when receiving an explicit `POST /api/control` with `{ action: 'start', uid }` or `{ action: 'start_all' }` from the frontend.
> - **Cloudflare D1 SQL Cloud Database**: Dedicated SQL database (`saito_accounts_db`) storing account UIDs, encrypted passwords, regions, and progression metrics.
> - **Clean Split Deployment**:
>   - **Render**: Standalone clean backend folder (`saito_render_backend/`) with `pycryptodomex`, on-demand control, and auto-stop logic.
>   - **Cloudflare Pages**: Production edge frontend deployed to `https://trefguu.pages.dev/`.

---

### 1. Smart EXP Cap & Stagnation Auto-Stop Logic

```
┌────────────────────────────────────────────────────────────────────────┐
│                   EXP Stagnation & Daily Cap Watchdog                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   Account In Match Loop                                                │
│         │                                                              │
│         ▼                                                              │
│   Fetch Login / EXP Refresh (e.g. every 5 matches)                     │
│         │                                                              │
│         ├──► EXP Increased (e.g. 4638 -> 4988)                         │
│         │    └── Reset stagnant_counter = 0                            │
│         │    └── Continue normal match rotation                        │
│         │                                                              │
│         └──► EXP Unchanged (e.g. 4638 == 4638)                         │
│              └── Increment stagnant_counter += 1                       │
│              │                                                         │
│              ├── If stagnant_counter < 2: Retry next check             │
│              │                                                         │
│              └── If stagnant_counter >= 2:                             │
│                  └── [TRIGGER AUTO-STOP]                               │
│                  └── Status -> 'EXP_CAPPED'                            │
│                  └── Cancel asyncio task for this UID                  │
│                  └── Log: "Daily EXP Cap Reached for UID. Stopped."    │
│                  └── Emit event to frontend dashboard                  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### In Python Backend (`main.py` & `dashboard_server.py`):
```python
# Track consecutive stagnant checks
stagnant_exp_counts: Dict[str, int] = {}
last_known_exp: Dict[str, int] = {}

def check_exp_stagnation(uid: str, current_exp: int) -> bool:
    prev = last_known_exp.get(uid)
    last_known_exp[uid] = current_exp
    if prev is not None and current_exp == prev:
        stagnant_exp_counts[uid] = stagnant_exp_counts.get(uid, 0) + 1
        if stagnant_exp_counts[uid] >= 2:
            return True # Trigger auto-stop
    else:
        stagnant_exp_counts[uid] = 0
    return False
```

---

### 2. On-Demand Bot Startup Architecture

- **Default Boot State**: `main.py` boots, starts aiohttp server on port 5000/10000, loads accounts into state with status `STOPPED`, and does **NOT** spawn match tasks.
- **Frontend Control Actions**:
  - `POST /api/control` with `{ action: 'start', uid }`: Starts individual account.
  - `POST /api/control` with `{ action: 'stop', uid }`: Pauses individual account.
  - `POST /api/control` with `{ action: 'start_all' }`: Starts all accounts.
  - `POST /api/control` with `{ action: 'stop_all' }`: Pauses all accounts.
  - `POST /api/control` with `{ action: 'reset_cap', uid }`: Resets stagnation counter so user can force retry if desired.

---

### 3. Cloudflare D1 SQL Database & Deployment Strategy

1. **Cloudflare D1 Table (`schema.sql`)**:
   - `accounts`: `uid`, `encrypted_password`, `nickname`, `region`, `level`, `current_exp`, `gained_exp`, `status` (`STOPPED`, `ONLINE`, `IN_MATCH`, `EXP_CAPPED`).
2. **Cloudflare Pages Functions**:
   - `/api/accounts`: CRUD endpoints reading/writing to D1.
   - `/api/control`: Proxied to Render backend via `_redirects`.
3. **Deployment Separation**:
   - **Render Backend**: `saito_render_backend/` containing:
     - `main.py` (with idle-on-boot & EXP cap watchdog)
     - `dashboard_server.py` (with on-demand start/stop API)
     - `requirements.txt` (including `pycryptodomex`)
     - `Dockerfile` & `render.yaml`
   - **Cloudflare Frontend**:
     - Deployed via Wrangler directly to `https://trefguu.pages.dev/`.

---

### Step-by-Step Implementation Sequence

1. **Update Python Bot Logic (`main.py` & `dashboard_server.py`)**:
   - Implement EXP stagnation auto-stop in `main.py`.
   - Update boot logic so it stays in listening mode until receiving frontend start command.
   - Synchronize changes into `saito_render_backend/`.
2. **Cloudflare D1 & Pages Functions**:
   - Provide `schema.sql` and Cloudflare Pages Functions.
3. **Frontend Dashboard Enhancements**:
   - Add `EXP_CAPPED` status badge with amber indicator.
   - Wire individual Play/Pause buttons to `/api/control`.
   - Update batch toolbar for Start All and Pause All.
4. **Deploy Frontend to Cloudflare Pages**:
   - Build with `npm run build` and deploy to `https://trefguu.pages.dev/`.
