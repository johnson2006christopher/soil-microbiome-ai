# Roadmap — Production Readiness

Goal: take the Soil Microbiome AI platform from a working prototype to a
production deployment on Railway behind our own domain, with trained models
whose reported accuracy is real and defensible.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Working agreement

**Branches**

| Branch | Purpose | Deploys to |
|---|---|---|
| `main` | Production. Protected — changes only via reviewed PR. | Railway `production` → our domain |
| `develop` | Integration branch. Everything merges here first. | Railway `staging` |
| `feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `docs/<topic>` | One branch per piece of work, cut from `develop`. | — |

**Commits** — [Conventional Commits](https://www.conventionalcommits.org/), one commit
per change and per file: `feat(scope): ...`, `fix(scope): ...`, `chore(...)`,
`docs(...)`, `test(...)`, `refactor(...)`.

**Definition of done** for any PR: CI green, tested locally, no secrets in the
diff, docs updated if behaviour changed.

---

## Phase 0 — Already done (`demo-prep` branch)

- [x] `feat(seed)`: `--clean` flag — no invented predictions/analyses in the DB
- [x] `feat(ml-engine)`: script that builds a fully synthetic yield dataset
- [x] `fix(predictions)`: re-running a prediction on the same reading no longer crashes
- [x] `fix(predictions)`: reading lookup/replacement scoped to the user's farm (IDOR)
- [x] `feat(recommendations)`: maintenance advice when soil is in optimal range
- [x] Tabular yield model trained locally (synthetic data, ensemble R² ≈ 0.35)

---

## Phase 1 — Foundations & repo hygiene

Make the repo safe to build on before adding features.

- [ ] Merge `demo-prep` → create `develop` from `main` + `demo-prep`
- [ ] Protect `main` and `develop` on GitHub (PR required, CI required)
- [ ] `fix(start)`: `start.sh` hardcodes `~/work-innovations/...`; derive path from the script location
- [ ] `fix(client)`: remove stale Cloudflare tunnel URL from `client/.env.production`
- [ ] `docs(readme)`: correct routes (`/api/predictions`, not `/api/predict`), real model metrics, local setup
- [ ] `fix(ml-engine)`: `train_sensor_models` passes unsupported `feature_list` arg — crashes
- [ ] `fix(ml-engine)`: `preprocess_tabular` checks `dtype == object`; pandas 3 uses `str` → string crop types not encoded
- [ ] `fix(server)`: image analysis failures surface an empty error message
- [ ] `chore(ml-engine)`: pin dependency versions in `requirements.txt` (TensorFlow, pandas, sklearn)
- [ ] `chore`: pin Python 3.11 / Node 20 via `.python-version` / `.nvmrc`

## Phase 2 — Models that genuinely work

The core of the project. Every number shown to users must come from a real evaluation.

**Image classification (CNN)**
- [ ] Data pipeline script to download PlantVillage tomato + corn (pinned, checksummed, licence cited — CC BY-SA 3.0)
- [ ] Train tomato + corn EfficientNetB0 on GPU; record held-out test accuracy, per-class precision/recall, confusion matrix
- [ ] Field-photo test set (real Tanzanian farm photos) to measure accuracy outside lab conditions
- [ ] Soil image model: collect and label our own dataset (no public one exists) — until then, hide or mark "coming soon"
- [ ] Replace colour-heuristic "is this a plant?" check with a proper out-of-distribution / low-confidence rejection

**Yield prediction (tabular)**
- [ ] Source real yield data (partner farms, TARI, Sokoine University of Agriculture, FAO/World Bank LSMS-ISA datasets)
- [ ] Record `synthetic_ratio` in the main tabular metrics (currently only the sensor model does)
- [ ] Show a visible "Prototype — trained on synthetic data" label in the UI until real data is used
- [ ] Decide feature set: hardware-measurable (9 sensor features) vs. lab-test features (microbiome)

**Model operations**
- [ ] Model versioning: artifact names include version + training date; UI shows model version
- [ ] Store artifacts outside git (Railway volume or object storage) with a documented upload step
- [ ] `docs(models)`: model card per model — data, metrics, limitations, intended use

## Phase 3 — Security & quality

From `COMPREHENSIVE_AUDIT_REPORT.md` plus findings since.

- [ ] VULN-001: move JWT from `localStorage` to httpOnly secure cookie
- [ ] VULN-002: device ingest auth must not be bypassable in any environment
- [ ] VULN-003: lower Express body limits to what's needed
- [ ] VULN-004: non-blocking/async handling for long ML calls
- [ ] VULN-005: enforce role claim on `/api/admin/*`
- [ ] VULN-006: no placeholder secrets as defaults — fail fast if unset in production
- [ ] VULN-007: validate manual soil reading input (schema validation, e.g. zod)
- [ ] VULN-008: rate limiting on authenticated listing routes
- [ ] Audit every route for the same farm-ownership (IDOR) pattern fixed in predictions
- [ ] Tests: server route tests (Jest/supertest), ML engine tests (pytest), keep Playwright E2E
- [ ] CI (GitHub Actions): lint, unit tests, build client, build Docker images on every PR

## Phase 4 — Production deployment (Railway + domain)

- [ ] Railway project with two environments: `staging` (← `develop`) and `production` (← `main`)
- [ ] Services: Postgres (managed), `ml-engine`, `server`, `client`
- [ ] Secrets set per environment (`JWT_SECRET`, `ML_ENGINE_API_KEY`, `DEVICE_INGEST_SECRET`, `DATABASE_URL`)
- [ ] `AUTO_TRAIN_ON_STARTUP=false` in all hosted environments
- [ ] Migrations run on deploy: `prisma migrate deploy`
- [ ] Uploads on a Railway volume or object storage (Cloudflare R2 / S3) — not container disk
- [ ] Health checks on all services; restart policy
- [ ] Buy domain; DNS → Railway custom domains (`app.<domain>`, `api.<domain>`); HTTPS
- [ ] CORS restricted to our domains; `CORS_ALLOW_ALL` off in production
- [ ] Error tracking (Sentry) + uptime monitoring
- [ ] Automated Postgres backups and a tested restore
- [ ] Sizing: ml-engine needs ~2 GB RAM (TensorFlow) — confirm plan limits

## Phase 5 — Product polish (for real users)

- [ ] Swahili + English UI (i18n)
- [ ] Mobile-first layout check; PWA install on Android
- [ ] Real ESP32 device end-to-end on a farm; device provisioning flow
- [ ] Onboarding: create farm → register device → first prediction
- [ ] Privacy policy & data handling statement (farm GPS and user data)

## Phase 6 — Optional: LLM API integration

Only if it adds value; core models stay our own.

- [ ] Plain-language explanations of results in Swahili/English
- [ ] Fallback to rule-based recommendations when the API is unavailable
- [ ] API key server-side only; per-user rate limit and monthly cost cap
- [ ] Clearly label LLM-generated text in the UI

---

## Open decisions

- Domain name and registrar
- Real yield data source and data-sharing agreement
- Soil image dataset: who collects, how many images per class
- LLM provider (if Phase 6 goes ahead)
