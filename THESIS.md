# SuiCopilot: Autonomous Trading Agents with Immutable Strategy Storage

## Executive Summary

SuiCopilot is a production-ready framework for deploying autonomous trading agents on the Sui blockchain with natural language intent parsing, decentralized state logs via Walrus, and real-time wallet monitoring. It democratizes algorithmic trading by enabling users to describe complex trading rules in plain English. The platform automatically coordinates scheduled execution runs, monitors agent health, queries network endpoints, and writes immutable audit logs of all trading decisions.

---

## Problem Statement

**The Gap in Autonomous Trading Infrastructure:**
1. **Centralized Risk:** Most automated trading platforms control execution keys in opaque databases, creating custodial vulnerability and lack of transparency.
2. **Strategy Opacity:** User strategies are black boxes with no verifiable historical records of what rules triggered a specific trade.
3. **Execution Unpredictability:** Serial processing designs mean that one hanging RPC call can stall an entire system and block other agents' trades.
4. **Fragile State Persistence:** Relying on basic JSON flat files to track state causes data corruption and loss during server restarts.

---

## Core Innovation: The SuiCopilot Architecture

### Three Core Components

#### 1. Prompt-to-Strategy (NLP Layer)
- Users specify trading actions in natural language.
- OpenAI translates intent into structured JSON rules (DCA frequency, price limits, stop-loss limits).
- Budgets and daily spend limits are enforced on-chain and locally.
- Strategies and rules are uploaded immutably to Walrus for public verifiability.

#### 2. Parallel Scheduler with Isolation (Execution Layer)
- Background worker schedules trigger checks every minute.
- Maps executing agents in parallel using `Promise.allSettled()`.
- Uses a strict agent-level timeout (`Promise.race()`) to isolate execution flows and prevent RPC hangs.
- Each agent operates in its own execution thread, securing isolation.

#### 3. Decentralized Audit Trail (Verification Layer)
- Every creation, log check, performance report, and manual pause is published to Walrus as a JSON envelope.
- Logs reference immutable Walrus blob IDs.
- Enables agent recovery: strategies can be fully reconstructed using only a list of Walrus blob IDs.

---

## Technical Architecture & Implementations

### Service & File Architecture

- **Sui RPC & Price Services:** Exposes SUI prices, multi-asset conversion rates, checkpoint latency data, and destination safety checks in [tatum.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/tatum.service.ts).
- **Walrus Publisher & Aggregator:** Controls file storage endpoints in [walrus.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/walrus.service.ts).
- **Agent Orchestrator:** Schedules checkruns, evaluates rules, calls safety monitors, and generates logs in [scheduler.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/scheduler.service.ts).
- **ACID Database Registry:** Controls schemas and table actions using a local database in [db.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/db.service.ts).
- **Swap Executor:** Drives swaps and DCA trades in [swap.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/swap.service.ts).
- **Walrus Agent Recovery:** Performs node recovery operations and state indexing in [walrus-recovery.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/walrus-recovery.service.ts).
- **Agent Definitions:** Declares clean TypeScript typings in [agent.types.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/types/agent.types.ts).
- **Centralized Constants:** Defines all execution configurations and magic numbers in [constants.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/config/constants.ts).
- **JSON Structured Logger:** Standardizes JSON output patterns via [logger.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/utils/logger.ts).

### Data Flow

```
User Intent (English)
    ↓
[NLP Parse] → OpenAI
    ↓
Structured Rules JSON
    ↓
[Publish] → Walrus Blob (immutable strategy registry)
    ↓
SQLite DB (better-sqlite3) & Scheduler memory cache
    ↓
Scheduled Checks (Every 60s)
    ↓
[Isolating Timeout] → Promise.race() using CONSTANTS.AGENT_TIMEOUT_MS
    ↓
[Tatum API RPC] → Query balance & SUI/USD exchange rate
    ↓
[Safety Audit] → Tatum checkMaliciousAddress
    ↓
[Action Execution] → executeDCASwap / executeSwap
    ↓
[Log Serialization] → Walrus Blob + SQLite Registry
    ↓
Dashboard (SSE Telemetry)
```

---

## Technical Implementations

### SQLite Persistence (Storage Resilience)
- Replaced fragile JSON files with a structured SQLite database using `better-sqlite3`.
- Relies on indexing (`idx_agents_id`, `idx_logs_agent_id`) to retrieve datasets.
- Schema provides transactional reliability for agents and runtime logs, persisting state changes across restarts.

### Parallel Execution & Timeout Guarding
- Switched sequential runs to parallel mapping using `Promise.allSettled()`.
- Wraps execution threads with `Promise.race()` to abort queries exceeding `CONSTANTS.AGENT_TIMEOUT_MS`.
- Rate limits outgoing requests via rate limit controls matching safe network ranges (`CONSTANTS.TATUM_RATE_LIMIT_MS = 400ms`).

### Agent Wallet Generation
- Backend creates secure, isolated SUI addresses for each agent locally.
- Uses standard cryptographic functions to secure keypairs inside SQLite, preventing key exposure to the frontend.

### Walrus Agent Indexing & Recovery
- Implemented a complete recovery strategy in [walrus-recovery.service.ts](file:///c:/Users/DELL/Documents/suicopilot/apps/backend/src/services/walrus-recovery.service.ts).
- Enables developers to restore agent state directly from Walrus blob IDs if the local database is lost.
- Dynamically compiles and uploads a master agent strategy index.

---

## Roadmap

1. **Onchain Proof Anchoring:** Anchoring SHA-256 hashes of Walrus logs onto Sui mainnet.
2. **DeFi Integrations:** Integrating live trading routing protocols (e.g., Cetus) for optimized slippage.
3. **Advanced AI Diagnostics:** Fine-tuning strategies using custom Move-specific security models.
4. **Verifiable Session Playback:** Rendering step-by-step trace audits directly from Walrus.