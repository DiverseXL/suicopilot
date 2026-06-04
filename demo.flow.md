# SuiCopilot Demo Walkthrough

This document outlines the step-by-step demonstration flow to showcase the full capabilities of SuiCopilot to judges or users. The flow walks through agent creation, parallel execution, Tatum RPC integration, Walrus immutable logging, and recovery.

---

## Prerequisites & Setup

### 1. Verification of Env Variables
Ensure the backend env configuration file `apps/backend/.env` is fully populated:
*   `TATUM_API_KEY` (Tatum Mainnet API key)
*   `SUI_RPC_URL=https://sui-mainnet.gateway.tatum.io`
*   `OPENAI_API_KEY` (OpenAI model key)

### 2. Spawning Services
Ensure both backend and frontend are running in development mode:
```bash
pnpm install
pnpm dev
```
*   **Frontend Dashboard:** `http://localhost:3000`
*   **Backend REST API:** `http://localhost:3001`

---

## Step-by-Step Demo Flow

### Step 1: Discover the Landing Page
1. Open `http://localhost:3000` in your web browser.
2. Explore the landing page showcasing:
   *   **Sui Mainnet Node Health Indicator:** Fetches live checkpoint and network status via Tatum's RPC.
   *   **Real-time Price Tickers:** Live SUI/USD, BTC/USD, and ETH/USD tickers.
   *   **Proof Stack Details:** Graphical representation of the Walrus + Tatum flow.

---

### Step 2: Deploy an Autonomous Agent
1. Click **"Open App"** or **"Use Agent"** to go to the Deploy page.
2. Connect your Sui browser wallet.
3. Enter a natural language trading strategy in the input box:
   *   *Example:* `"DCA buy $5 SUI every hour. Stop loss at $10."`
4. Set a daily spending limit (e.g., `100` USD) using the configuration slider.
5. Click **"Deploy Agent"**:
   *   The backend validates inputs, parses the intent into structural rules in [mcp.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/mcp.service.ts), and spawns a secure isolated agent wallet address.
   *   It publishes the parsed strategy to Walrus decentralized storage via [walrus.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/walrus.service.ts).
   *   It registers the agent in [db.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/db.service.ts) SQLite DB.
   *   Renders the agent's new SUI wallet address on the UI.

---

### Step 3: Verify Live Cron Execution
1. Navigate to the **Dashboard** page.
2. Watch the agent card. The background scheduler in [scheduler.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/scheduler.service.ts) triggers checks every 60 seconds.
3. Observe live events broadcasted via Server-Sent Events (SSE) (e.g., `agent_execution`, `agent_health`).
4. Click **"View Detail Logs"** to open `/agents/[id]/logs`:
   *   Visual step logs will detail each execution run, balance check, and price evaluation.
   *   Every run prints a clickable **Walrus Blob link** that directly references the immutable log payload on Walrus mainnet/testnet.

---

### Step 4: Perform Manual Operations
1. **Trigger Manual DCA Swap:**
   *   Inside the agent workspace, click **"Manual DCA Trigger"** to make a POST call to `/api/agents/:id/dca-swap`.
   *   This runs [executeDCASwap](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/swap.service.ts) immediately, logging execution details and the tx digest to SQLite and Walrus.
2. **Toggle Agent Pause:**
   *   Click **"Pause Agent"** to call `/api/agents/:id/pause`.
   *   Watch the status change to paused. A log event of type `pause` is generated and published to Walrus.

---

### Step 5: Test Walrus Recovery Service (Data Resilience)
Demonstrate how SuiCopilot protects user configurations even if backend databases are completely wiped:
1. Note down your agent's **Strategy Blob ID** from the agent details or Walrus logs.
2. Shut down the backend or delete the local database at `apps/backend/data/suicopilot.db`.
3. Open a REST Client or run a `curl` request to recover the state:
   ```bash
   curl -X POST http://localhost:3001/api/agents/recover \
     -H "Content-Type: application/json" \
     -d '{"blobIds": ["YOUR_STRATEGY_BLOB_ID"]}'
   ```
4. Verify the response:
   *   The backend retrieves the strategy definition from the Walrus aggregator via [walrus-recovery.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/walrus-recovery.service.ts).
   *   It rebuilds SQLite table records and loads the agent state back into the active cron scheduler.
   *   Refresh the frontend dashboard; the agent is fully recovered!

---

### Step 6: Review Tatum Node Metrics
1. Navigate to the **Tatum Node Status** section.
2. Verify live node latency graphs (plotting standard latency history captured in [tatum.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/tatum.service.ts)).
3. Observe the network label (e.g., `Sui Mainnet` via `sui-mainnet.gateway.tatum.io`) confirming tatum RPC connectivity.
