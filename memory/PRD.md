# Come In Backup Restoration

## Original problem statement
I have attached my existing Come In project ZIP backup. I do NOT want to build a new app from scratch.

Please inspect the uploaded ZIP file, extract and identify the existing project structure, and restore the existing application from its source code. Preserve all existing features, UI, branding, frontend, backend, API integrations, and configuration files wherever possible.

First verify whether the ZIP contains the complete source code. Then install the required dependencies, configure the project safely, resolve any build errors, and start the application preview.

Do not overwrite or delete any existing files unnecessarily. Do not modify or delete any production database or live application. Do not expose secrets or API keys. If any files, environment variables, database configuration, or dependencies are missing, explain exactly what is required before making risky changes.

My goal is to continue working on the SAME Come In app from this backup in this Emergent account, not create a different app.

## Architecture decisions
- The uploaded archive was extracted to `/app/come-in-backup/come-in-backup2-conflict_091026_1401` for isolated inspection.
- No existing `/app` application files, environment files, production databases, or live services were overwritten.
- The backup is an Expo Router / React Native Web frontend with a FastAPI + MongoDB backend.
- The active `/app` project is a different CRA/CRACO starter scaffold, so automatic merging was intentionally not performed.
- Existing protected `/app/backend/.env` values were used only for an in-memory import check; no secrets were copied into the backup.

## Implemented
- Downloaded and extracted the ZIP backup safely.
- Confirmed the archive contains source code, route screens, reusable components, local catalog/store data, branding assets, Expo configuration, backend source, dependency manifests, and prior test reports.
- Confirmed the backup contains no `.env` files or obvious secret/key files.
- Installed the backup frontend dependencies inside the isolated backup directory.
- Verified the backup backend compiles and imports with the existing local MongoDB environment values.
- Started the backup Expo web preview on isolated port 3001 and verified HTTP 200 plus rendered Come In home screen, branding, location controls, shopping categories, shops card, and bottom navigation.

## Prioritized backlog
- P0: Decide whether the isolated Expo backup should replace the current CRA starter in `/app`; this requires explicit approval because the projects conflict.
- P1: Provide or connect the backup's intended environment configuration if backend persistence or external integrations are required; the ZIP does not include `.env` files.
- P1: Run the full backup regression suite after the restore target is approved.
- P2: Reconcile the backup's simplified backend status API with any production API integrations, without touching live data.