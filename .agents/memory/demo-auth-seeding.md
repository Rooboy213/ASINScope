---
name: Demo auth seeding
description: Keeps development demo accounts compatible with the application's password verification.
---

Demo account seed data must use the same salted password-hashing algorithm as the login route, not a plain unsalted digest.

**Why:** A seed can look valid in the database while every demo login fails if the route and seed use different hashing rules.

**How to apply:** When changing authentication or reseeding demo users, derive the stored hash from the live verification helper and smoke-test login plus the protected `/auth/me` path.