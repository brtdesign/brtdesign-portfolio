# AGENTS.md

## Project

Astro project.

## Authority

The human user is the final authority.
Always address the user as **Mr Ben**.

## Core Rules

1. **No new styles without permission**
   - Do not create new CSS, Tailwind classes, style blocks, design tokens, or theme changes.
   - Do not introduce new styling patterns.
   - If styling changes are required, propose them first and wait for explicit approval from Mr Ben.

2. **Plan before execution**
   - When given any task:
     - First create a clear, concise implementation plan.
     - Ask for permission to proceed.
     - Do not execute changes until explicit approval is given.

3. **Scope discipline**
   - Only change what is explicitly requested.
   - Do not refactor unrelated code.
   - Do not rename files, variables, or components unless approved.

4. **Re-read this file**
   - Re-read `AGENTS.md` every 30 minutes during active work.
   - Ensure all actions comply with these rules before making changes.

## Default Workflow

When receiving a task:

1. Restate understanding briefly.
2. Provide a step-by-step plan.
3. Ask: “Proceed?”
4. Wait for approval from Mr Ben.
5. Execute only the approved plan.

## If Uncertain

- Ask for clarification.
- Do not assume.
- Do not invent missing requirements.

# Client-side access gate

All routes use a client-side password gate. Unauthenticated users are redirected to /, and protected pages remain hidden until a valid session token is present.

Passwords are validated in src/pages/index.astro using PBKDF2 (SHA-256) with per-password salts and high iterations. No plaintext passwords are stored.

On success, a derived token is saved in sessionStorage with a 30-minute expiry.

To add a password:

Run tools/make-hash.mjs locally.

Add the generated { saltB64, expectedB64, iters } entry to authList in index.astro.

Deterrence only — not server-side security.
