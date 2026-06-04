# SuiCopilot

SuiCopilot is a full-stack, AI-powered DeFi automation system that combines:
- **Tatum** for Sui RPC access, security-driven destination wallet auditing, and real-time exchange rates.
- **OpenAI/GPT-4o** for natural language intent parsing and agent execution health monitoring.
- **Walrus** for decentralized, immutable storage of agent strategies, execution logs, and performance metrics.
- **SQLite** for secure, local agent metadata persistence and configuration storage.
- **Server-Sent Events (SSE)** for real-time dashboard notifications.

The result is a secure, verifiable, and hands-free autonomous trading copilot where each agent can be:
- **Created from natural language** (e.g., "DCA $10 of SUI into USDC every day if SUI is below $1.50").
- **Isolated in execution** using secure agent-specific keypairs.
- **Monitored continuously** by an LLM-powered safety assessor.
- **Logged immutably** to Walrus, making every swap, pause, or query verifiable.
- **Recovered instantly** from decentralized store references if database state is lost.

---

## What the Project Does

Given a user's natural language trading intent, SuiCopilot:
1. **Parses the Intent:** Uses OpenAI to translate the query into structured JSON trading rules (DCA intervals, price drop triggers, stop loss, take profit).
2. **Deploys a Dedicated Agent Wallet:** Generates a secure, keypair-based agent wallet specifically to run this strategy.
3. **Stores Strategy Immutably:** Uploads the agent's strategy, rules, and intent to Walrus decentralized storage.
4. **Performs Scheduled Runs:** Executes the trading strategy in the background (using node-cron), checking token prices and balances through Tatum.
5. **Enforces Strict Safety Limits:** Checks if destination addresses are malicious via Tatum's Security API, and ensures daily budgets are strictly respected.
6. **Monitored via LLM Auditor:** Runs automatic LLM health assessments on the agent's strategy vs current balance and market conditions.
7. **Stores Persistent Logs on Walrus:** Uploads every single execution step, transaction digest, and performance report to Walrus.
8. **Real-time Live Dashboard:** Feeds live state, logs, and activity telemetry back to a responsive React/Next.js dashboard.

---

## Architecture Summary

### Core Components
- **[apps/frontend/](file:///c:/Users/DELL/Documents/suicopilot/apps/frontend)**: Next.js + Tailwind CSS UI for landing pages, portfolio management, agent deployment, and execution tracking.
- **[apps/backend/](file:///c:/Users/DELL/Documents/suicopilot/apps/backend)**: Express + TypeScript backend service managing tatum RPC integrations, db persistence, cron scheduling, and AI agent execution.

### High-Level Responsibilities
- **Frontend:** Collects user intents, configures daily limits, showcases live agent statuses, streams log updates, and manages portfolio tokens.
- **Backend:** Spawns and executes agents, retrieves prices and logs, queries the Sui blockchain via Tatum, writes logs to Walrus, and broadcasts updates.

---

## Complete Agent Pipeline

The execution flow lives in [scheduler.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/scheduler.service.ts).

### Step-by-Step Flow
1. **Trigger:** The scheduler runs every minute, launching active agents in parallel without blocking.
2. **State Setup:** Resets daily spend boundaries at midnight and enforces agent timeouts.
3. **Query Tatum RPC:** Retrieves live balances and SUI/USD exchange rates through Tatum.
4. **Decision Engine:** Checks parsed rules against market data (e.g., DCA intervals, Stop Loss triggers, Buy/Sell thresholds).
5. **Execution:** Performs Move transactions/swaps using secure local private keys (e.g., simulated/live DCA swap).
6. **Decentralized Logging:** Packages the run results, market data, and budget limits into a JSON envelope and publishes it to Walrus.
7. **OpenAI Health Check:** Every 10 iterations, runs an automated OpenAI safety check comparing agent health to current parameters.
8. **OpenAI Performance Report:** Every 10 runs, compiles uptime, success rates, and budgets into a report uploaded to Walrus.
9. **UI Synchronization:** Broadcasts the execution logs, transaction details, and current status to the frontend.

### Detailed ASCII Diagram
```
                                 S U I C O P I L O T
========================================================================================

  User / Frontend (Next.js)
        |
        | 1. Submit intent & daily limit (e.g. "DCA $10 daily")
        v
  POST /api/agents  -------------------------------------------------------------+
        |                                                                        |
        v                                                                        |
  +----------------------+                                                       |
  | Express Backend      |                                                       |
  +----------------------+                                                       |
        |                                                                        |
        | 2. Parse intent via OpenAI (mcp.service)                               |
        |    Generates: rules & action plan JSON                                  |
        v                                                                        |
  +---------------------------+                                                  |
  | OpenAI Intent Parser      |                                                  |
  +---------------------------+                                                  |
        |                                                                        |
        | 3. Create wallet & upload strategy envelope                            |
        v                                                                        |
  +---------------------------+                                                  |
  | Walrus Publisher          | ---> Uploads: strategy & rules to Walrus         |
  +---------------------------+                                                  |
        |                                                                        |
        | 4. Persist locally to SQLite (db.service)                              |
        v                                                                        |
  +---------------------------+                                                  |
  | SQLite DB (suicopilot.db) |                                                  |
  +---------------------------+                                                  |
        |                                                                        |
        | 5. Cron Triggered execution (every 60s)                                |
        v                                                                        |
  +---------------------------+                                                  |
  | Cron Scheduler            |                                                  |
  +---------------------------+                                                  |
        |                                                                        |
        | 6. Query SUI balance, status & prices                                  |
        v                                                                        |
  +---------------------------+                                                  |
  | Tatum Sui RPC Gateway     | ---> SUI RPC (suix_getBalance, exchange rates)   |
  +---------------------------+                                                  |
        |                                                                        |
        | 7. Destination Address Audit                                           |
        v                                                                        |
  +---------------------------+                                                  |
  | Tatum Security API        | ---> checkMaliciousAddress                       |
  +---------------------------+                                                  |
        |                                                                        |
        | 8. Execute swaps / DCA orders                                          |
        v                                                                        |
  +---------------------------+                                                  |
  | Swap Engine               |                                                  |
  +---------------------------+                                                  |
        |                                                                        |
        | 9. Publish logs to Walrus & DB                                         |
        v                                                                        |
  +---------------------------+                                                  |
  | Walrus Log Publisher      | ---> Uploads execution/health log blobs         |
  +---------------------------+                                                  |
        |                                                                        |
        +--------------------> 10. UI reads state & logs, broadcasts SSE updates --+
```

---

## Tatum Integration

Tatum is the primary gateway for interacting with the Sui mainnet and fetching reliable market data.

### Where Tatum is Used
1. **Sui JSON-RPC Access:** Interrogating account balances, checking node checkpoint counts, and scanning transaction blocks.
2. **Security Address Scanning:** Scanning swap target addresses to prevent funds from being routed to known malicious contracts/accounts.
3. **Reliable Price Rates:** Pulling live SUI/USD exchange rates and other cross-asset values to determine agent value thresholds.

### Endpoints and RPC Methods Used
- **Tatum Sui RPC Gateway:** `https://sui-mainnet.gateway.tatum.io`
- **JSON-RPC Methods:**
  - `suix_getBalance`
  - `suix_getAllBalances`
  - `suix_queryTransactionBlocks`
  - `sui_getLatestCheckpointSequenceNumber`
- **Tatum REST APIs:**
  - GET `https://api.tatum.io/v3/tatum/rate/{asset}?basePair=USD` (Price Exchange Rates)
  - GET `https://api.tatum.io/v3/security/address/{address}?chain=SUI` (Malicious Address Scanner)

---

## Walrus Integration

Walrus acts as the decentralized, immutable store for all agent definitions and runtime trails.

### What Gets Stored
1. **Strategy Definition Envelopes (`strategy`):** Stored immediately upon agent creation (stripped of private keys).
2. **Intent Rules (`rules`):** Structured rules parsed by the AI.
3. **Execution Steps (`execution`):** Detail logs containing balance snapshots, decisions, and prices.
4. **Agent Uptime & Performance Reports (`performance_summary`):** Published periodically.
5. **State Pauses/Resumes (`pause`):** Direct manual command logs.

### Network Configuration
- **Publisher URL:** `https://publisher.walrus-testnet.walrus.space` (or configured custom testnet publishers)
- **Aggregator URL:** `https://aggregator.walrus-testnet.walrus.space`

---

## OpenAI/AI Integration

OpenAI is utilized to provide intelligence to the agent setup and ongoing operations.

### Tasks Handled by AI
1. **Intent Parsing:** Enforces structured JSON mapping containing parameters like:
   - `action` (e.g., `dca`, `buy`, `sell`)
   - `amount` (order size)
   - `interval` (frequency)
   - `stopLoss` / `takeProfit` (threshold limits)
2. **Automated Health Monitoring:** Inspects agent logs and balances dynamically to return assessments (`good`, `warning`, `critical`).

---

## API Surface

Exposed in [agents.route.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/routes/agents.route.ts):

### Public Backend Endpoints
- **POST `/api/agents`:** Creates and starts a new trading agent.
- **GET `/api/agents`:** Retrieves all registered agents (without private keys).
- **GET `/api/agents/:id`:** Fetches detail state + balance of a single agent.
- **POST `/api/agents/:id/pause`:** Toggles the paused state of an agent.
- **POST `/api/agents/:id/swap`:** Manually triggers a token swap for an agent.
- **POST `/api/agents/:id/dca-swap`:** Manually triggers a DCA buy interval.
- **GET `/api/agents/:id/logs`:** Fetches the running event logs.
- **POST `/api/agents/recover`:** Reconstructs local memory states from Walrus blob IDs.
- **GET `/api/agents/meta/tatum-proof`:** Returns live proof data from SUI mainnet via Tatum.
- **GET `/api/agents/meta/tatum-status`:** Current Tatum gateway status.
- **GET `/api/agents/meta/tatum-metrics`:** Tatum latency stats and network parameters.
- **GET `/api/agents/meta/price`:** Current SUI/USD exchange rate.
- **GET `/api/agents/meta/rates`:** Live prices for SUI, BTC, and ETH.

---

## Frontend Pages

Managed in Next.js under the **[apps/frontend/app/](file:///c:/Users/DELL/Documents/suicopilot/apps/frontend/app)** directory:
1. **Landing page ([page.tsx](file:///c:/Users/DELL/Documents/suicopilot/apps/frontend/app/page.tsx)):** Overview, architecture highlights, and call-to-actions.
2. **Dashboard:** Central workspace visualizing active agents, daily budgets, and real-time execution outputs.
3. **Deploy Workspace:** Text field for typing natural language intents, slider for daily limits, and deployment triggers.
4. **Logs Viewer:** Detailed, chronological breakdown of agent check-ins, prices, and Walrus blob links.
5. **Marketplace:** Public presets and templates for deploying preconfigured agents.

---

## Project Structure

```
suicopilot/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── constants.ts
│   │   │   ├── routes/
│   │   │   │   └── agents.route.ts
│   │   │   ├── services/
│   │   │   │   ├── db.service.ts
│   │   │   │   ├── mcp.service.ts
│   │   │   │   ├── scheduler.service.ts
│   │   │   │   ├── swap.service.ts
│   │   │   │   ├── tatum.service.ts
│   │   │   │   ├── wallet.service.ts
│   │   │   │   ├── walrus-recovery.service.ts
│   │   │   │   └── walrus.service.ts
│   │   │   ├── types/
│   │   │   │   └── agent.types.ts
│   │   │   ├── utils/
│   │   │   │   └── logger.ts
│   │   │   ├── index.ts
│   │   │   └── realtime.ts
│   │   ├── data/
│   │   │   └── suicopilot.db
│   │   ├── .env
│   │   └── package.json
│   └── frontend/
│       ├── app/
│       │   ├── (app)/
│       │   │   ├── agents/[id]/logs/page.tsx
│       │   │   ├── dashboard/
│       │   │   ├── deploy/
│       │   │   ├── marketplace/
│       │   │   └── portfolio/
│       │   │   layout.tsx
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── package.json
├── package.json
└── README.md
```

---

## Setup and Installation

### Prerequisites
- Node.js 18+
- pnpm 11+
- Tatum API Key
- OpenAI API Key

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd suicopilot
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in **`apps/backend/`**:
```env
TATUM_API_KEY=your-tatum-api-key
SUI_RPC_URL=https://sui-mainnet.gateway.tatum.io
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
OPENAI_API_KEY=your-openai-api-key
PORT=3001
SUI_NETWORK=mainnet
```

### 3. Start the Application
Run both backend and frontend concurrently:
```bash
pnpm dev
```

---

## Useful Files
- **Backend Entry:** [apps/backend/src/index.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/index.ts)
- **Tatum Services:** [apps/backend/src/services/tatum.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/tatum.service.ts)
- **Walrus Storage:** [apps/backend/src/services/walrus.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/walrus.service.ts)
- **Cron Jobs:** [apps/backend/src/services/scheduler.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/scheduler.service.ts)
- **Frontend Dashboard:** [apps/frontend/app/page.tsx](file:///c:/Users/DELL/Documents/suicopilot/apps/frontend/app/page.tsx)
