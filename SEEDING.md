# Seeding Guide

This project includes a seed script that generates demo data using values from:

- `client/src/assets/assets.js` (`JobCategories`, `JobLocations`)

## Command

From the repository root, run:

```bash
npm --prefix server run seed:assets -- --reset
```

## What gets seeded

- Companies
- Users
- Jobs
- Job Applications

## Notes

- `--reset` clears existing `companies`, `users`, `jobs`, and `jobapplications` data before reseeding.
- If you run without `--reset` and seed data already exists, the script will stop with a safety error.
- Default seeded login password:

```text
SeedPass@123
```
