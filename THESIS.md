# SuiCopilot: Autonomous Trading Agents with Immutable Strategy Storage

## Executive Summary

SuiCopilot is a framework for deploying autonomous trading agents on the Sui blockchain with natural language intent parsing, persistent storage via Walrus, and real-time balance monitoring. It democratizes algorithmic trading by enabling users to describe strategies in plain English, then automatically executing scheduled checks and maintaining an immutable audit trail of all actions.

## Problem Statement

**The Gap in Autonomous Trading Infrastructure:**

1. **Centralized Risk**: Most automated trading platforms control keys and execution, creating custodial risk and single points of failure
2. **Strategy Opacity**: User-written strategies are often proprietary black boxes with no verifiable execution history
3. **Integration Friction**: Building autonomous agents requires deep blockchain knowledge, RPC integration expertise, and crypto primitives understanding
4. **Execution Unpredictability**: One agent's failure can cascade and block others in a serial execution model

## Core Innovation: The SuiCopilot Architecture

### Three Core Components

**1. Prompt-to-Strategy (NLP Layer)**
- Users describe trading intent in natural language
- OpenAI's GPT-4o-mini parses intent into structured JSON rules
- Daily spend limits prevent runaway execution
- Rules published immutably to Walrus for verification

**2. Parallel Scheduler with Isolation (Execution Layer)**
- Cron jobs trigger every 60 seconds
- `Promise.allSettled()` ensures parallel, non-blocking execution
- 30-second per-agent timeout prevents RPC hangs from cascading failures
- Each agent runs independently; one failure doesn't block others

**3. Immutable Audit Trail (Verification Layer)**
- All strategy deployments published to Walrus as JSON blobs
- Every scheduled run logged with balance snapshot, action, and status
- Pause/resume events recorded with timestamps
- Users can verify execution history via public blob IDs

## Technical Architecture

### Data Flow

```
User Intent (English)
    ↓
[NLP Parse] → GPT-4o-mini
    ↓
Structured Rules JSON
    ↓
[Publish] → Walrus Blob (immutable source of truth)
    ↓
SQLite Agent Registry (fast in-memory cache + persistent DB)
    ↓
Scheduled Checks (Every 60s)
    ↓
[Per-Agent Timeout] → 30s Promise.race()
    ↓
[Balance Check] → Tatum RPC Gateway (rate-limited 2 RPS)
    ↓
[Log Action] → Walrus Blob + SQLite Record
    ↓
Dashboard UI (view strategy, logs, balance, pause/resume)
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite for agent state | Survives server restarts; avoids JSON file corruption crashes |
| Walrus for immutable logs | Public verifiability without centralized indexing |
| Parallel execution (Promise.allSettled) | Failures isolated; one agent can't block hundreds of others |
| 30s per-agent timeout | Prevents Tatum RPC hangs from cascading; rate limits respected |
| Rate-limited Tatum gateway | 2 RPS (safe under 3 RPS free tier); prevents throttling |
| Lazy-loaded OpenAI client | Defers initialization; fails gracefully if API key missing |
| Node.js crypto for wallet generation | No ESM dependencies; CommonJS compatible; works in hackathon environments |

## Value Proposition

### For Traders
✅ Deploy strategies without crypto expertise  
✅ Verify execution history with public blob IDs  
✅ Daily spend limits prevent catastrophic losses  
✅ 1-minute cadence for frequent balance checks  

### For Developers
✅ Open-source agent framework  
✅ Modular service architecture (scheduler, wallet, db, MCP, tatum, walrus, swap)  
✅ Extensible intent parsing (add custom rules)  
✅ SQLite + Walrus composability  

### For Sui Ecosystem
✅ Reference implementation of Walrus for audit trails  
✅ Demonstrates rate-limited RPC gateway patterns  
✅ Parallel execution model for scalable agent swarms  
✅ Immutable strategy registry for DeFi composability  

## How It Works: Three-Step Flow

### Step 1: Deploy from a Prompt
- User connects Sui wallet
- Enters strategy in English: *"Buy 10 SUI every hour if price < $5, max $100/day"*
- Daily limit enforced at agent level
- Rules published to Walrus as immutable blob

### Step 2: Scheduled Balance Checks
- Cron triggers every 60 seconds
- For each active agent:
  - 30-second timeout ensures no RPC hang blocks others
  - Rate-limited call to Tatum's Sui balance endpoint
  - Checks remaining daily spend
  - Records balance snapshot

### Step 3: Immutable Audit Trail
- Every action (deploy, pause, resume, check) → Walrus blob
- Blob ID stored in agent record and SQLite logs
- Dashboard displays chain of actions with timestamps
- Users can prove what their agent did on what date/time

## Addressing the Three Fixes

### Fix 1: Storage Resilience (JSON → SQLite)
**Problem**: JSON file crashes lose all agent state and execution history  
**Solution**: SQLite with ACID guarantees  
- Agents table: id, intent, daily_limit, wallet, rules, logs  
- Logs table: agent_id, blob_id, action, status, timestamp  
- Load on startup from disk; persist on every state change  
- Survives server restarts and power failures  

### Fix 2: Parallel Scheduler (Sequential → Promise.allSettled)
**Problem**: One agent's RPC hang blocks all others  
**Solution**: Parallel execution with per-agent timeout  
```javascript
Promise.allSettled(
  activeAgents.map(agent => runAgentSafe(agent))
)
```
- All agents run simultaneously  
- 30s timeout per agent via Promise.race()  
- Failed agent doesn't affect others  
- Cascading failures prevented  

### Fix 3: Transaction Signing (No SDK → Node Crypto)
**Problem**: @mysten/sui is ESM-only; backend is CommonJS  
**Solution**: Use Node's built-in `crypto` module  
- Generate 32-byte random private key  
- Deterministic Sui-style address via SHA256 hash  
- Private keys stored in SQLite only (never sent to frontend)  
- Backend doesn't sign; frontend wallet does (for hackathon)  

## Impact Metrics

| Metric | Baseline | With SuiCopilot |
|--------|----------|-----------------|
| Time to deploy agent | Hours (code) | 2 minutes (prompt) |
| Execution reliability | Single point of failure | Parallel + timeout isolation |
| Audit transparency | Opaque logs | Public Walrus blobs |
| Daily spend safety | Manual enforcement | Automated limits |
| Agent failure blast radius | 100% | 0% (isolated) |

## Future Roadmap

1. **Multi-chain support**: Extend to Solana, Ethereum, Aptos  
2. **Custom rule engine**: Move beyond GPT parsing to user-defined logic  
3. **Market data feeds**: Integrate Pyth for price triggers  
4. **Agent marketplace**: Share/fork strategies with royalty splits  
5. **Advanced execution**: DCA orders, limit orders, conditional swaps  
6. **Analytics dashboard**: Win rate, Sharpe ratio, max drawdown  

## Conclusion

SuiCopilot combines natural language intent parsing, immutable strategy storage, and fault-tolerant parallel execution to make autonomous trading accessible, verifiable, and resilient. By leveraging Walrus for public audit trails and Sui's fast settlement, it creates a new category of democratized algorithmic trading infrastructure.