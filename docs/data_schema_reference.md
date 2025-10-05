# Data Schema Reference (Operator Network MVP)

This document defines canonical entities, fields, enums, and derived metrics for the Operator App MVP. All services and UIs MUST adhere to these names.

---

## Entities

### Operator
- `id: string` — UUID.
- `wallet_address: string` — EVM address (checksum).
- `operator_handle: string` — unique display handle.
- `avatar_url: string|null`
- `skills: string[]` — e.g., ["Dev","Design","VibeOps","BizOps"].
- `xp: number` — default 0.
- `rank: "Apprentice" | "Operator" | "Senior" | "Architect"` — derived from XP.
- `joined_at: timestamp`
- `last_active_at: timestamp`
- `machines_connected: string[]` — array of `Machine.id`.

### Machine
- `id: string` — UUID.
- `machine_name: string`
- `description: string`
- `category: "LaunchOps" | "GameOps" | "VibeOps" | "Tooling" | "Other"`
- `status: "active" | "paused" | "archived"`
- `links: { repo: string|null, site: string|null, contract: string|null }`
- `operators: { operator_id: string, role: "Owner" | "Maintainer" | "Contributor" }[]`
- `created_at: timestamp`
- `updated_at: timestamp`

### Op (Mission)
- `id: string` — UUID.
- `machine_id: string` — FK → Machine.id
- `op_title: string`
- `description: string`
- `reward_xp: number` — default 50.
- `status: "open" | "claimed" | "in_progress" | "submitted" | "verified" | "closed"`
- `assignee_id: string|null` — FK → Operator.id
- `created_by: string` — FK → Operator.id
- `created_at: timestamp`
- `updated_at: timestamp`
- `verified_by: string|null` — FK → Operator.id
- `verified_at: timestamp|null`

---

## Rank Thresholds (config)
```json
{
  "Apprentice": { "min": 0,   "max": 99 },
  "Operator":   { "min": 100, "max": 299 },
  "Senior":     { "min": 300, "max": 799 },
  "Architect":  { "min": 800, "max": 999999 }
}
