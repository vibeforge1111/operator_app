
---

### 📄 `ui_wireframes_notes.md`

```markdown
# UI Wireframes Notes (Operator Network MVP)

This file describes the MVP screens, components, and exact labels. Use Tailwind and componentize into: Topbar, Sidebar, StatCard, MachineCard, OpsTable, DirectoryList.

---

## Global UI

### Topbar
- Left: Logo / “Operator Network”
- Center: (optional) global search
- Right: `Operator: {operator_handle}` | `Rank: {rank}` | `XP: {xp}` | [Connect Wallet]

### Sidebar (navigation)
- Profile
- Machines
- Ops
- Directory
- (footer) Settings

---

## Screen: Home (Operator Dashboard)

**Header**
- H1: `Welcome, {operator_handle}`
- Sub: `Your command center for Machines and Ops`

**Stat Cards** (four across on desktop)
1) **Active Ops** → `{active_ops_count}`
2) **Open Ops Available** → `{open_ops_available}`
3) **Machines Connected** → `{machines_connected_count}`
4) **XP / Rank** → `{xp} XP · {rank}`

**Section: Recent Activity**
- List of last 5 events:
  - “Verified Op: {op_title} in {machine_name} (+50 XP)”
  - “Joined Machine: {machine_name} as Contributor”
  - Timestamp right-aligned.

**Section: Your Machines** (grid of MachineCards)
- Card fields (badges right-aligned):
  - Title: `{machine_name}`
  - Sub: `{category} · Role: {role}`
  - Badges: `Open Ops: {open_ops_count}` | `Active Ops: {active_ops_count}` | `Contributors: {contributors_count}` | `7d Completed: {completed_ops_7d}`
  - CTA buttons: `[View Machine]` `[Find Ops]`

**Quick Actions (right rail or footer)**
- `[Find Ops]` (opens Ops view with filters pre-set to Operator skills)
- `[Connect a Machine]` (modal: name, description, category, links)

---

## Screen: Machines

**Tabs**
- [Your Machines] [All Machines]

**Machine List Row**
- `{machine_name}` — `{category}` — `Status: {status}`
- Badges: `Open Ops`, `Active Ops`, `Contributors`, `7d Completed`
- Actions: `[View]`

**Create Machine (button)**
- Modal fields:
  - `machine_name` (required)
  - `description`
  - `category` (select)
  - `links.repo | links.site | links.contract`
  - `status` (default `active`)
  - Add Operators (search + assign role)

---

## Screen: Machine Detail

**Header**
- Title: `{machine_name}`
- Sub: `{category} · Status: {status}`
- Links: repo | site | contract
- Operators (avatars + role badges)

**Ops Summary (stat cards)**
- `Open Ops`
- `In Progress`
- `Completed (30d)`

**Ops Table (MVP columns)**
- `Op`
- `Reward XP`
- `Status` (open | claimed | in_progress | submitted | verified | closed)
- `Assignee`
- `Updated`

**Create Op (button)**
- Modal:
  - `op_title` (required)
  - `description` (textarea)
  - `reward_xp` (default 50)
  - `status` (default open)
  - `assignee_id` (optional)

---

## Screen: Ops

**Filters (top)**
- Status: [open, claimed, in_progress, submitted, verified, closed]
- Machine: [multi-select]
- Skill: [multi-select]

**Table Columns**
- `Op`
- `Machine`
- `Reward XP`
- `Status`
- `Assignee`
- `Updated`
- Row actions: `[Claim]` (if open), `[Submit]` (if assignee & in_progress)

---

## Screen: Directory (Operators)

**Filters**
- Skill (multi-select)
- Rank (select)
- Has Machines (toggle)
- Active in: [7d | 30d]

**Operator Card / Row**
- Avatar + `@operator_handle`
- `Rank · {xp} XP`
- Skills (chips)
- `Machines: {machines_connected_count}`
- `Last active: {relative_time}`
- Action: `[View Profile]`

---

## Screen: Profile (Operator self-view)

**Header**
- Avatar + `@operator_handle`
- `Rank · {xp} XP`
- Wallet (shortened)
- Skills (editable chips)

**Tabs**
- Overview (stat cards + recent activity)
- Machines (grid)
- Ops (table) — default filter: `assignee_id = me`

**Edit Profile (modal)**
- `operator_handle`
- `avatar_url`
- `skills[]`

---

## Copy & Labels (canonical)

- Use “**Operator**”, “**Machine**”, “**Op**” exactly.
- Stat labels: `Active Ops`, `Open Ops Available`, `Machines Connected`, `XP / Rank`
- Machine badges: `Open Ops`, `Active Ops`, `Contributors`, `7d Completed`
- Op statuses: `open`, `claimed`, `in_progress`, `submitted`, `verified`, `closed`

---

## Empty States (examples)

- **No Machines yet** → “You haven’t connected any Machines.” `[Connect a Machine]`
- **No Ops** → “No Ops match your filters.” `[Find Ops]`
- **New Operator** → “Welcome! Create your profile and connect your first Machine.”

---

## Guardrails (do NOT render in MVP)

- Do not show: gas saved, deployments, network capacity, runs, apps, success rate.
- Do not rename entities: keep Operator, Machine, Op.
