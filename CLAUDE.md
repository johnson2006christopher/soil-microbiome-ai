# CLAUDE.md — project memory for Claude Code

Read this first. It records what this project is, how it was built, how to run
and deploy it, and how the owner wants work done. It replaces any local memory
from earlier machines.

## Owner's working rules (always follow)

- **Commits:** Conventional Commits (`feat(scope): …`, `fix(scope): …`, `style`,
  `refactor`, `docs`, `chore`, `build`, `perf`). **One commit per change and per
  file**: stage files individually; if one file has two unrelated changes, make
  two commits.
- **No AI attribution anywhere:** no `Co-Authored-By: Claude …` trailer, no
  "Generated with Claude Code / AI" lines in commits, PR descriptions or code.
  (History was rewritten once to remove them; never add them back.)
- **Branches:** work on `feat/…`, `fix/…`, `docs/…`, `chore/…` branches cut from
  `develop`; merge into `develop` with `--no-ff`; open a PR `develop → main`;
  merge to `main` only after the change is verified (owner's choice).
- **Honesty about the models:** every number shown to users must be measured or
  clearly labelled. The yield model is a prototype on synthetic data — say so.
- Ask before outward-facing or account-level actions (pushing, merging to main,
  Railway settings, registering keys). Explain in plain language; the owner
  prefers short, clear answers.

## What the project is

SoilAI: a precision-agriculture platform for Tanzanian farms, prepared for a
live presentation to the Prime Minister of Tanzania on 28 Oct 2026 (done).
Two independent AI models, shown side by side:

1. **Leaf disease CNN** (EfficientNetB0, transfer learning) for tomato (10
   classes) and maize/corn (4 classes). Trained on PlantVillage. Held-out test
   accuracy: **tomato 93.3 % (1,500 imgs), corn 95.3 % (600 imgs)**. No soil
   image model yet ("coming soon").
2. **Yield regression** (RF + GB + XGBoost ensemble + SHAP) on 24 soil/microbiome
   features. **Prototype trained on 1,500 synthetic rows** (R² ≈ 0.35). Needs
   real harvest records (soil readings + measured t/ha) to become real.

Stack: React 18 + Vite + Tailwind (`client/`), Node/Express + Prisma + Postgres
+ Socket.io (`server/`), Python FastAPI + TensorFlow 2.21 + scikit-learn
(`ml-engine/`), Arduino/ESP32 sketches + Python simulator (`sensor/`).

## Live deployment (Railway)

- Website: https://client-production-9733.up.railway.app
- API: https://server-production-3c45.up.railway.app (`/health`)
- Railway project `soil-microbiome-ai`, id `abc5c3ba-492f-4618-9f4a-830e669cdc25`
  (dashboard: https://railway.com/project/abc5c3ba-492f-4618-9f4a-830e669cdc25)
- Services: `Postgres`, `ml-engine` (private: `ml-engine.railway.internal:8000`),
  `server` (volume at `/app/uploads`), `client` (nginx static).
- Server env: `DATABASE_URL=${{Postgres.DATABASE_URL}}`,
  `ML_ENGINE_URL=http://ml-engine.railway.internal:8000`, `ML_ENGINE_API_KEY`,
  `JWT_SECRET`, `DEVICE_INGEST_SECRET`, `NODE_ENV=production`,
  `CLIENT_URL=https://${{client.RAILWAY_PUBLIC_DOMAIN}}`. ML engine:
  `ML_ENGINE_API_KEY` (same), `APP_ENV=production`, `AUTO_TRAIN_ON_STARTUP=false`.
  Client build args: `VITE_API_URL` / `VITE_SOCKET_URL` = server public URL.
  Secret values live only in Railway (and the owner's backup), never in git.
- **Railway is NOT connected to GitHub.** Deploys are manual from a laptop:
  ```bash
  railway login            # once per machine
  railway link             # pick project soil-microbiome-ai
  railway up server --path-as-root --service server --ci
  railway up client --path-as-root --service client --ci
  # ml-engine needs the trained models, which are gitignored: stage a clean copy
  rsync -a --exclude .venv --exclude data --exclude __pycache__ \
    --exclude 'model/artifacts/tabular/versions' ml-engine/ /tmp/ml-stage/
  railway up /tmp/ml-stage --path-as-root --no-gitignore --service ml-engine --ci
  ```
- Server runs `prisma migrate deploy` on start. Seed production presenter data
  inside the container (DB has no public URL):
  `railway ssh --service server -- sh -c "DEMO_PASSWORD='…' node scripts/seed.js --clean"`
  (needs an SSH key registered with `railway ssh keys add`).
- Accounts: presenter `demo@farm.ai` (password set via `DEMO_PASSWORD`, kept by
  the owner — not in git; local dev default is `demo1234`). Public visitors use
  **Try Demo**, which creates a private guest account (`POST /api/auth/demo`,
  60/hour per IP) with a demo farm, simulated device and 12 SIMULATED readings.

## Running locally

Ports 3000, 8000 and 5433 on the original laptop belonged to another project
(mailroom), so this project used 5434 / 8100 / 5000 / 3100.

```bash
# Postgres (data persists in the named volume)
docker run -d --name soil-microbiome-postgres --restart unless-stopped \
  -e POSTGRES_DB=soil_microbiome -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password \
  -p 127.0.0.1:5434:5432 -v soil_microbiome_pgdata:/var/lib/postgresql/data postgres:16

# server/.env  → DATABASE_URL=postgresql://admin:password@localhost:5434/soil_microbiome
#                ML_ENGINE_URL=http://localhost:8100, ML_ENGINE_API_KEY=ml-internal-key-local-dev,
#                JWT_SECRET=<32+ chars>, CLIENT_URL=http://localhost:3100, PORT=5000
# client/.env  → VITE_API_URL=   VITE_SOCKET_URL=   (empty = same origin via Vite proxy)
cd server && npm install && npx prisma migrate deploy && npx prisma generate \
  && node scripts/seed.js --clean && node index.js

# ML engine: TensorFlow needs Python 3.11 (not 3.14)
cd ml-engine && uv venv --python 3.11 .venv && uv pip install --python .venv/bin/python -r requirements.txt
ML_ENGINE_API_KEY=ml-internal-key-local-dev AUTO_TRAIN_ON_STARTUP=false \
  .venv/bin/uvicorn main:app --host 127.0.0.1 --port 8100

cd client && npm install && npx vite --host 127.0.0.1 --port 3100
```

Trained models must be in `ml-engine/model/artifacts/` (gitignored — restore
from the owner's backup, or retrain below).

## Retraining

```bash
# Image data: sparse clone of PlantVillage (CC BY-SA 3.0, cite Mohanty et al. 2016)
git clone --filter=blob:none --no-checkout --depth 1 https://github.com/spMohanty/PlantVillage-Dataset.git
cd PlantVillage-Dataset && git sparse-checkout init --no-cone \
  && printf '/raw/color/Tomato___*/\n/raw/color/Corn_(maize)___*/\n' > .git/info/sparse-checkout && git checkout
cd ml-engine && .venv/bin/python -I scripts/prepare_plantvillage.py <PlantVillage>/raw/color
# GPU: uv pip install "tensorflow[and-cuda]==2.21.0" and export LD_LIBRARY_PATH to every
#      .venv/lib/python3.11/site-packages/nvidia/*/lib directory (libcusolver otherwise not found)
.venv/bin/python -c "from model.cnn_trainer import train_cnn_model; train_cnn_model('tomato')"
.venv/bin/python scripts/evaluate_cnn.py tomato      # writes held-out test metrics
# Yield model (synthetic until real data exists)
.venv/bin/python -m scripts.make_synthetic_dataset data/feature_profile.csv data/sensor_data.csv
.venv/bin/python -c "from model.tabular_trainer import train_tabular_models; train_tabular_models()"
```
Tomato took ~25 min and corn ~10 min on an RTX 3070 laptop GPU.

## History (what was done, Oct–Nov 2026)

- **Audit and fixes (PR #1, merged):** ~40 fixes found by a page-by-page audit.
  Safe error messages, simulated readings via an authenticated route, Socket.io
  proxy, manual-entry number coercion, image-analysis rejection and cleanup,
  farm create/edit, farm-scoped stats, and private guest demo accounts. Honest
  labels replaced the invented regional average and false landing claims.
  Security fixes: prediction IDOR, socket room ownership, `/uploads` no longer
  public, `trust proxy`. Deployment work: Railway-ready Dockerfiles (nginx
  `$PORT` template, IPv6 ML engine, pinned Python deps, migrate on start).
  Mobile drawer sidebar, disease-severity-based health badges, readable labels.
- **Frontend redesign (PR #2, open — waiting for a fluent speaker to review the
  Swahili in `client/src/i18n/strings.js`):** earth-and-leaf palette (mlima
  `#1f4d3a`, shamba `#3e8e5a`, maize `#e3b23c`, soil `#4a3426`, mist `#eef4ef`),
  Familjen Grotesk + Atkinson Hyperlegible, custom inline-SVG illustrations
  (`client/src/components/illustrations/`), redesigned landing and auth pages,
  EN/SW toggle (`client/src/i18n/`), illustrated empty states.
- `ROADMAP.md` tracks phases and open work; `README.md` has measured metrics.

## Open items / next steps

- Merge PR #2 after the Swahili review.
- Buy a domain and attach it in Railway (`app.<domain>`, `api.<domain>`); update
  `CLIENT_URL` and client build args.
- Connect Railway to GitHub (`main` → production) or add CI; currently manual.
- Get real yield data (TARI, Sokoine University of Agriculture, partner farms).
- Collect a soil image dataset; test the CNNs on real Tanzanian field photos.
- Remaining audit items in `ROADMAP.md` Phase 3 (JWT in httpOnly cookie, admin
  role enforcement, tests + CI).
- Cleanup: ~10 guest accounts and `smoke+…@example.com` left in production by
  testing; Railway SSH key `soil-microbiome-ai-laptop` was registered for seeding.
