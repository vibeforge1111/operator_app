Product Requirements Document (PRD)
Operator Onboarding Loop - MVP
Version: 1.0
Date: October 5, 2025
Status: Draft

Executive Summary
The Operator Onboarding Loop establishes the foundational identity and discovery layer for the Operator Network. This MVP creates persistent operator profiles, a personal command center, and basic network visibility to enable operators to establish presence, showcase capabilities, and discover collaborators.

Problem Statement
Currently, there is no unified way for operators to:

Establish a persistent, verifiable identity within the network
Display their skills and track their contributions
Discover and connect with other operators
View their operational status across multiple machines/products


Goals & Success Metrics
Primary Goal: Enable 50+ operators to create profiles and begin discovering each other within 30 days of launch.
Success Metrics:

50+ operator profiles created in first month
70%+ profile completion rate (all fields filled)
5+ operator directory searches per active user per week
60%+ operator retention after 7 days


User Personas
Primary: New Operator
"I want to join the network, showcase my skills, and find projects to contribute to."
Secondary: Existing Operator
"I need to find operators with specific skills to collaborate on my machine."

Feature Requirements
1. Operator Registration
Priority: P0 (Must Have)
User Flow:

User clicks "Become an Operator"
Connects wallet (MetaMask/WalletConnect)
Creates operator handle (unique username)
Selects 1-5 skill tags from predefined list
Confirmation screen → Profile created

Functional Requirements:

Wallet connection integration (Web3 provider)
Unique handle validation (alphanumeric, 3-20 characters)
Wallet-to-profile linking (1:1 mapping)
Skill tag selection from fixed taxonomy

Skill Tag Taxonomy (MVP):

Dev (Engineering/Technical)
Design (UI/UX/Visual)
VibeOps (Community/Culture)
BizOps (Strategy/Operations)
Narrative (Content/Storytelling)
Coordination (Project Management)

Technical Requirements:

Store profile data (off-chain database initially)
Associate wallet address as primary key
Validate handle uniqueness before commit
Session management post-wallet connection

Edge Cases:

User disconnects wallet mid-registration → Save draft state
Duplicate handle attempt → Show error, suggest alternatives
User connects different wallet → Treat as new operator


2. Operator Dashboard
Priority: P0 (Must Have)
Layout Sections:
Header:
[OPERATOR: @username]
Connected: 0x1234...5678
Stats Panel:
XP: 0 | Rank: Apprentice
Activity Overview:
Machines: 0 connected
Active Ops: 0
Skills Display:
Skillset: [Tag1] [Tag2] [Tag3]
Functional Requirements:

Display operator handle and truncated wallet address
Show reputation metrics (static values for MVP: XP=0, Rank=Apprentice)
List connected machines (count only for MVP, empty state message)
List active operations (count only for MVP, empty state message)
Display selected skill tags as visual badges

Empty States:

"No machines connected yet. Browse available machines to get started."
"No active ops. Check the mission board for opportunities."

Technical Requirements:

Fetch operator data by wallet address
Real-time data refresh on page load
Responsive design (mobile + desktop)


3. Operator Directory
Priority: P0 (Must Have)
Core Features:

List view of all registered operators
Search by operator handle
Filter by skill tag (single selection)
Basic sorting (Newest first / Alphabetical)

Directory Card Display:
[@username]
XP: 0 | Rank: Apprentice
Skills: [Dev] [Design] [BizOps]
Machines: 2 | Active Ops: 1
[View Profile]
Functional Requirements:

Paginated list (20 operators per page)
Search input (real-time filtering)
Skill filter dropdown (multi-select not required for MVP)
Click-through to operator dashboard
Default sort: Most recently registered

Technical Requirements:

Query operators table with filters
Implement search debouncing (300ms)
Pagination controls (prev/next)
Loading states for data fetching

Edge Cases:

No operators match filter → "No operators found with these criteria"
Only 1 operator exists → Still show in list view
Search returns 0 results → Suggest clearing filters


User Stories
As a new operator, I want to:

Connect my wallet and create a profile so others can identify me
Select skills that represent my capabilities
View my profile to confirm my information is correct

As an existing operator, I want to:

Search for operators with specific skills to build a team
View another operator's profile to assess collaboration fit
See how many operators are in the network


Out of Scope (Future Phases)

On-chain reputation system
XP earning mechanisms
Operator-to-operator messaging
Social graph / connection system
Profile editing (post-creation)
Operator verification/badges
Advanced filtering (multiple skills, rank ranges)
Machine connection workflow
Operations/missions system
Profile avatars/images


Technical Architecture
Stack Assumptions:

Frontend: React/Next.js
Wallet: Web3Modal or similar
Database: PostgreSQL or similar
Authentication: Wallet signature verification

Data Models:
Operator Profile:
javascript{
  id: uuid,
  walletAddress: string (unique),
  handle: string (unique),
  skills: array[string],
  xp: integer (default: 0),
  rank: string (default: "Apprentice"),
  connectedMachines: integer (default: 0),
  activeOps: integer (default: 0),
  createdAt: timestamp,
  updatedAt: timestamp
}

Design Requirements
Visual Style:

Clean, technical aesthetic (terminal/command center vibe)
Monospace fonts for handles and data
Badge-style skill tags
Minimal color palette (2-3 accent colors)

Key UI Components:

Wallet connection button
Skill tag selector (checkbox grid or dropdown)
Operator card (reusable component)
Search input with filter dropdown
Dashboard stat panels


Launch Checklist
Pre-Launch:

 Wallet integration tested (MetaMask, WalletConnect)
 Profile creation flow QA completed
 Directory search and filters functional
 Mobile responsive testing complete
 Handle uniqueness validation working
 Empty states designed and implemented

Launch:

 Deploy to production
 Seed 5-10 test operator profiles
 Announce to initial operator cohort
 Monitor registration conversion rate

Post-Launch (Week 1):

 Gather user feedback on registration flow
 Track directory usage patterns
 Identify most selected skill tags
 Monitor for technical issues


Open Questions

Handle changes: Should operators be able to change their handle post-registration? (Recommend: No for MVP)
Wallet security: What happens if an operator loses access to their wallet?
Skill taxonomy: Should we allow custom skill tags or keep it fixed? (Recommend: Fixed for MVP)
Profile privacy: Should operators be able to hide their profile from the directory? (Recommend: No for MVP)


Dependencies & Risks
Dependencies:

Web3 wallet provider library
Database setup and hosting
Domain/hosting for application

Risks:

Low adoption if onboarding is too complex → Mitigation: Keep registration to 3 steps max
Handle squatting → Mitigation: Monitor for suspicious patterns, consider handle reclaim policy
Poor skill tag selection → Mitigation: Use analytics to refine taxonomy in Phase 2


Timeline Estimate
Week 1-2: Core infrastructure (wallet integration, database, auth)
Week 3: Operator registration flow
Week 4: Operator dashboard
Week 5: Operator directory
Week 6: Testing, polish, deployment
Total: 6 weeks to MVP launch