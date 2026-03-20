# GovScheme Hackathon Report

## Problem Summary
Citizens struggle to discover, understand, and apply for government schemes due to fragmented portals, low digital literacy, and unclear eligibility criteria.

## Our Community-Centric Solution
GovScheme is a unified platform that:
1. Aggregates schemes into one searchable catalog.
2. Provides transparent eligibility checks and recommendations.
3. Guides citizens through application steps and document requirements.
4. Supports multilingual UI for accessibility.
5. Offers admin analytics to improve reach and engagement.

## Architecture Overview
- **Frontend**: React + MUI, multilingual UI, eligibility flow, application tracking.
- **Backend**: Express API with Prisma + SQLite, eligibility logic, and recommendation endpoints.
- **Data**: Prisma seed for consistent, repeatable scheme data.

## AI/ML Approach (Non-Agentic)
We use transparent, explainable scoring:
- **Rule-based eligibility** (hard filters like age/income/state).
- **Lightweight scoring** to rank relevance by profile fit.
- **Reasoning output** to explain “why recommended”.

This keeps the system fair, interpretable, and easy to audit.

## Accessibility & Inclusion
- Multilingual labels for better regional access.
- Simple step-by-step flow for low digital literacy.
- Clear eligibility explanations to build trust.

## Limitations (Current)
- Data is seeded locally; real government API integrations are mocked.
- Eligibility is based on structured criteria, not full policy text parsing.
- No voice interface yet.

## How to Run
1. `npm install` in root, `server`, and `client`.
2. `npx prisma migrate dev` and run Prisma seed.
3. Start server and client.

