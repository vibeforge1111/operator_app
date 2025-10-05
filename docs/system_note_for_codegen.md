# System Note for Codegen (Operator Network)

This file defines mandatory naming conventions and field restrictions for all generated code, database schemas, and UI components.

---

## Canonical Entities
- **Operator** → human identity (wallet-linked)
- **Machine** → autonomous or semi-autonomous product
- **Op** → mission/task inside a Machine

These names MUST be used exactly as written.  
Do not rename or alias them to builder, app, run, deployment, project, or job.

---

## Approved Field Groups (MVP)

### Operator
- wallet_address
- operator_handle
- xp
- rank
- skills
- machines_connected
- active_ops_count
- open_ops_available
- recent_activity

### Machine
- machine_name
- category
- status
- open_ops_count
- active_ops_count
- completed_ops_7d
- contributors_count

### Op
- op_title
- reward_xp
- status
- assignee
- verified_by

---

## Strictly Forbidden / Deprecated Fields

Do NOT introduce or reuse any of the following (until a future version explicitly defines them):

- total_gas_saved
- new_builders
- runs
- active_builders
- apps_running
- avg_success_rate
- active_deployments
- network_capacity

If you see these in templates, delete them.  
They are not part of the Operator Network MVP vocabulary.

---

## UI Label Rules
- Use “Operator”, “Machine”, “Op” exactly.
- Stat labels: **Active Ops**, **Open Ops Available**, **Machines Connected**, **XP / Rank**
- Machine badges: **Open Ops**, **Active Ops**, **Contributors**, **7d Completed**
- Avoid corporate terminology: project, sprint, department, resource, etc.

---

## Code Behavior Notes
- XP and rank logic should be local/off-chain for MVP.
- Do not implement any blockchain calls unless explicitly stated.
- Analytics = only counts derived from Operator, Machine, or Op objects.
- No synthetic “performance” or “capacity” metrics.

---

### Summary
Claude Code should only generate data, UI, or analytics that map directly to the schema defined in `data_schema_reference.md` and `ui_wireframes_notes.md`.  
Anything not defined there must be considered out-of-scope.

