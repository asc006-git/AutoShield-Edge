# AutoShield Edge — Production Readiness Audit

**Date:** 2026-06-27
**Auditor:** Automated codebase analysis
**Scope:** Complete project — backend (Python/FastAPI), frontend (Next.js/TypeScript), ML pipeline, deployment configuration

---

## 1. Perspective Reviews

### 1.1 Hackathon Judge Perspective

**Strengths:**
- Complete end-to-end demo: user selects an attack type → backend runs a 9-stage AI pipeline → frontend visualizes every stage with explanations
- Real ML model (One-Class SVM) trained on actual CAN bus data (351,166 behavioral windows across 5 attack scenarios)
- 13 interpretable behavioral features with clear domain meaning (CAN ID entropy, burst score, payload instability)
- Professional-grade UI with dark theme, animations, responsive layout — strong first impression
- Every pipeline stage shows purpose, inputs, outputs, AI reasoning, and decision — judge can understand the AI workflow in under 3 minutes
- Per-stage backend-measured timestamps prove the pipeline is executing, not scripted
- Final execution summary provides a single-page overview of the entire detection-to-recovery workflow
- Addresses a real automotive cybersecurity problem (CAN bus attacks on connected vehicles)

**Weaknesses:**
- **No deployment scripts** — judge must manually start backend (`uvicorn main.py`) and frontend (`npm run dev`) in separate terminals
- **Backup trains a model at startup** (5-10s delay) — gives impression of unfinished software
- **Some hardcoded fallback data** — if parquet files are missing, backend silently returns mock data
- **Duplicate attack selectors** — both LandingPage and PipelinePage have attack selection, which can confuse the demo flow
- **LandingPage hardcoded stats** (0.815 F1, <3.2ms latency, 350:1 reduction) — not fetched from backend
- **No ability to compare attack types side-by-side** — each run replaces the previous result

**Concerns:**
- Is the "AI pipeline" genuinely running or replaying precomputed results? (Answers: it IS running inference on precomputed windows, but the data was preprocessed offline — this is acceptable for a hackathon but should be stated clearly)
- The SHAP values are z-score deviations, not real SHAP — a judge familiar with XAI would notice
- The threat story is rule-based, not LLM-generated — the word "AI" in the narrative is from templated text, not a language model

---

### 1.2 AI/ML Engineer Perspective

**Strengths:**
- Sound methodology: sliding window → 13 behavioral features → OC-SVM anomaly detection → health scoring via exponential z-score decay
- One-Class SVM is appropriate for anomaly detection (trained only on normal data)
- Feature set covers 5 behavioral dimensions: communication rate, CAN diversity, timing regularity, payload statistics, attack pressure
- Cyber health formula (Threat 40% + Stability 30% + Pressure 30%) with exponential decay is mathematically principled
- Per-attack detection rates show meaningful variation (DoS: 0.64, Fuzzy: 0.596, Gear: 0.75, RPM: 0.747) — model is not uniform across attacks
- Model metrics (OC-SVM: precision 0.9957, recall 0.6893, F1 0.8146, AUC 0.8877) are strong for anomaly detection
- 13 features with SHAP-like attribution provide interpretability

**Weaknesses:**
- **Model retrains on every startup** — random subsampling (`rng.choice`) makes results non-reproducible across restarts
- **No model serialization** — `.pkl`/`.joblib` files are not saved; the trained model is held only in memory
- **No validation split** — model is evaluated on the full dataset, not a held-out test set (metrics in report are precomputed)
- **SHAP library in requirements.txt** but never used — the computed "SHAP" values are z-score deviations, not true SHAP
- **No cross-validation or confidence intervals** on reported metrics
- **Training data subsampling** (5000 of 19,777 normal windows) loses information — done only for speed
- **No hyperparameter tuning** — `nu=0.01`, `kernel=rbf`, `gamma=scale` are default-ish choices
- **The pipeline operates on precomputed windows** (parquet files), not raw CAN messages — the "data acquisition" stage is simulated

**Concerns:**
- The `_load_data()` function retrains OC-SVM from scratch on every API startup — proper practice is to train offline and load a serialized model
- The detection metrics in `_model_metrics` dict (lines 200-205 of main.py) are hardcoded, not computed from the current model — they could be stale if the model changes
- The `anomaly_scores` array is computed at startup but the threshold is recalculated per request — this inconsistency could lead to different classifications for the same data

---

### 1.3 Full-Stack Engineer Perspective

**Strengths:**
- Clean separation: Python/FastAPI backend ↔ Next.js/TypeScript frontend with REST API
- Single-request architecture: `POST /api/pipeline/run` returns all 9 stages in one response — no WebSockets or polling needed
- Per-stage `duration_ms` via real `time.time()` measurements — not simulated
- Frontend state management via React Context (PipelineContext) — appropriate for this scale
- Tailwind CSS v4 with glass-morphism design consistent throughout
- TypeScript interfaces for core data types (StageData, PipelineSummary, PipelineContextType)
- Zero `Math.random()` or fake timers in the frontend pipeline — all values backend-driven
- Build compiles with zero errors in strict TypeScript mode

**Weaknesses:**
- **`main.py` is 77KB / 1,347 lines** — violates single-responsibility principle; mixes API routes, ML inference, data loading, response formatting, and even report generation
- **No Docker configuration** — no Dockerfile, no docker-compose.yml → no reproducible deployment
- **No environment variable management** — API URL falls back to localhost; CORS allows all origins (`*`)
- **No error boundary in React** — if the backend returns an error, the user sees nothing (status resets to "idle")
- **Unused dependencies:** `recharts` in package.json but never imported in any component
- **Type safety gaps:** `any` types used extensively in `StageDataRenderer` (feature maps, action arrays)
- **Duplicate code:** Attack selector defined in both LandingPage and PipelinePage
- **Dead code:** `VehicleVisualization.tsx` is no longer imported by any component; empty `src/dashboard/__init__.py`; `scripts/` folder contains files not used by the API
- **No API versioning** — all routes are at `/api/` without version prefix
- **No input validation** beyond verifying attack_type is in a hardcoded list

**Concerns:**
- The 77KB `main.py` is a maintenance risk — any change requires understanding the entire file
- Frontend has no loading state when the backend is training at startup — first request may hang
- No error toasts, no connectivity indicator — the app appears broken if backend isn't running
- The `.gitignore` excludes `data/` and `dataset/` directories — a fresh clone won't have parquet files, causing fallback to mock data

---

### 1.4 Technical Recruiter Perspective

**Strengths:**
- Demonstrates full-stack capability: Python ML pipeline, FastAPI REST API, Next.js frontend, TypeScript, modern CSS
- Shows understanding of anomaly detection, feature engineering, explainable AI, and autonomous systems
- Clean code with docstrings, type hints (mostly), and consistent formatting
- Good use of modern tools: React Context for state, framer-motion for animations, Tailwind CSS v4
- The project README and report files indicate strong documentation habits
- Shows ability to structure a complex data pipeline (data → preprocessing → model → scoring → explanation → response)

**Weaknesses:**
- Small project scope (6 frontend components, 1 API file) — doesn't show ability to scale
- No tests whatsoever — no pytest, no Jest, no Cypress
- Limited Python complexity — `main.py` is procedural with globals, not OOP or modular
- Some Python code anti-patterns (mutable default args, bare excepts, global state)
- No CI/CD configuration (no GitHub Actions, no pre-commit hooks)
- No database integration — everything is in-memory
- The "self-healing agent" and "threat story engine" classes exist in source but are not actually imported by the API — they're bypassed in favor of inline fallback logic

---

## 2. Issues by Priority

### 2.1 Critical Issues (Must Fix Before Deployment)

| # | Issue | Files | Why It Matters | Effort | Impact |
|---|-------|-------|---------------|--------|--------|
| C1 | **No Docker/deployment configuration** — project cannot be deployed as a containerized application | Missing Dockerfile, docker-compose.yml | Hackathon judges need to run the demo; manual setup with `uvicorn` + `npm run dev` is fragile and unprofessional | **High** (1-2 days) | Demo cannot be reliably deployed to any environment |
| C2 | **Backend retrains model on every startup** with random subsampling — results are non-reproducible | `src/api/main.py:146-148` | Pipeline results differ on each restart; a judge running the demo twice gets different numbers | **Medium** (2-4 hours) | Undermines scientific credibility |
| C3 | **No error handling for missing data** — silently falls back to mock dictionaries with hardcoded values | `src/api/main.py:792-800, 866-876, 944-956` | If parquet files are missing, the backend pretends everything works but returns fake data | **Medium** (2-3 hours) | Honest error is better than silent fakery |
| C4 | **Frontend has no error UI when backend is unreachable** — user sees nothing | `dashboard/src/context/PipelineContext.tsx:118-121` | If the backend isn't running or returns an error, the Run button silently fails | **Low** (1 hour) | Demo appears broken when backend is down |
| C5 | **CORS allows all origins** — security risk in production | `src/api/main.py:59-65` | Any website can make requests to the API. Not acceptable for production or shared demo network | **Low** (15 min) | Security vulnerability |

### 2.2 High Priority Improvements

| # | Issue | Files | Why It Matters | Effort | Impact |
|---|-------|-------|---------------|--------|--------|
| H1 | **`main.py` is 1,347 lines / 77KB** — violates single responsibility principle | `src/api/main.py` | Difficult to maintain, test, or reason about; any change risks breaking unrelated functionality | **High** (2-3 days) | Technical debt — slows all future development |
| H2 | **Model metrics are hardcoded** — not computed from the actual loaded model | `src/api/main.py:200-205` | If model training changes, metrics dict becomes stale; user sees precision/recall that may not match current model | **Medium** (3-4 hours) | Misleading accuracy reporting |
| H3 | **No API version prefix** — breaking changes impossible without breaking clients | `src/api/main.py` | Cannot evolve the API without versioning; `/api/pipeline/run` v2 would conflict | **Low** (30 min) | Prevents backward-compatible API evolution |
| H4 | **Attack selector duplicated** on LandingPage and PipelinePage — confusing UX and code duplication | `dashboard/src/components/LandingPage.tsx:95-130`, `PipelinePage.tsx:111-131` | User sets attack type twice; code must be kept in sync | **Low** (1 hour) | User confusion + maintenance burden |
| H5 | **Unused `recharts` dependency** in package.json | `dashboard/package.json` | Slows `npm install`, increases bundle size | **Low** (5 min) | Minor bloat |
| H6 | **`VehicleVisualization.tsx` is dead code** — no longer imported by any component | `dashboard/src/components/VehicleVisualization.tsx` | This file is maintained but never used; wastes developer attention | **Low** (10 min) | Future developer confusion |
| H7 | **Backend endpoints serve mock data** — `/api/demo/attack-data`, `/api/attack`, `/api/telemetry` return hardcoded responses | `src/api/main.py:432-631` | Multiple endpoints with fake data erode trust in the demo; a judge may explore these and conclude the whole app is fake | **Medium** (1-2 hours) | Credibility risk |
| H8 | **No loading/skeleton state** during pipeline execution — stage content appears abruptly | `dashboard/src/components/PipelinePage.tsx` | User experience feels jumpy; no visual feedback during the ~3ms per stage | **Low** (1-2 hours) | Polish issue |

### 2.3 Medium Priority Improvements

| # | Issue | Files | Why It Matters | Effort | Impact |
|---|-------|-------|---------------|--------|--------|
| M1 | **`any` types used extensively** in StageDataRenderer — defeats TypeScript safety | `dashboard/src/components/PipelinePage.tsx:494, 572, 630` | Runtime errors from unexpected data shapes go uncaught by the compiler | **Medium** (2-3 hours) | Code quality + reliability |
| M2 | **SHAP "values" are z-score deviations** — not real SHAP, yet labeled as SHAP in the UI | `src/api/main.py:1008-1035` | An ML engineer judge will notice this is feature deviation, not cooperative game theory SHAP values | **Medium** (1-2 hours) | Technical accuracy |
| M3 | **Threat story is rule-based templating** — labeled as "AI" but no language model involved | `src/api/main.py:1038-1080` | Over-claiming "AI" for if/else template logic; a critical judge may call this out | **Medium** (2-3 hours) | Credibility risk |
| M4 | **Backend has no startup health check** — `/api/health` exists but frontend never calls it | `dashboard/src/context/PipelineContext.tsx` | Frontend doesn't verify backend connectivity before allowing the user to run the pipeline | **Low** (1 hour) | User experience |
| M5 | **No test files** anywhere in the project — no pytest, no Jest, no Playwright | N/A | Impossible to verify correctness of changes; hackathon judges may consider this incomplete | **High** (3-5 days) | Engineering completeness |
| M6 | **Duplicate model metric constants** — `_model_metrics` in main.py vs `ocsvm_metrics` dict | `src/api/main.py:200-205, 878` | Same OC-SVM metrics defined in two places; they could diverge | **Low** (10 min) | Data inconsistency |
| M7 | **PipelineContext uses `setTimeout` for stage advancement** — fragile with rapid stage durations | `dashboard/src/context/PipelineContext.tsx:154` | If a stage duration is 0ms, the timer fires immediately and may cause React state batching issues | **Low** (30 min) | Race condition potential |

### 2.4 Low Priority Improvements

| # | Issue | Files | Why It Matters | Effort | Impact |
|---|-------|-------|---------------|--------|--------|
| L1 | **`CyberHealthGauge` has fallback calculations** when backend props aren't provided | `dashboard/src/components/CyberHealthGauge.tsx` | Fallbacks could hide missing backend data; component should require props | **Low** (30 min) | Data integrity |
| L2 | **`health_before` in summary is not truly "before"** — it's the normal health value from the dataset, not the vehicle state before this specific attack | `src/api/main.py:1217` | Confusing naming — implies temporal before/after but it's cross-sectional comparison | **Low** (30 min) | Clarity |
| L3 | **No `.dockerignore` file** — Docker builds would include unnecessary files | Missing `.dockerignore` | Larger image size, slower builds | **Low** (5 min) | Build performance |
| L4 | **No environment variable for API URL in production** — `NEXT_PUBLIC_API_URL` fallback is hardcoded localhost | `dashboard/src/context/PipelineContext.tsx:5` | Frontend cannot be configured for different backends without rebuild | **Low** (10 min) | Deployment flexibility |
| L5 | **Reports directory has 17 files** from pipeline development — not used by the running application | `reports/*.md, *.json` | 400KB of stale reports in the repo; a judge exploring the project might be confused by outdated numbers | **Low** (30 min) | Cleanliness |

### 2.5 Cosmetic Suggestions

| # | Issue | Files | Effort | Impact |
|---|-------|-------|--------|--------|
| S1 | Landing page stats (0.815 F1, <3.2ms, 350:1) are hardcoded — should be fetched from `/api/performance/metrics` for consistency | `LandingPage.tsx` | 2 hours | Consistency |
| S2 | Pipeline replay is very fast (~3ms per stage) — user may not have time to read content before it advances | `PipelineContext.tsx` | 1 hour | Readability |
| S3 | No keyboard shortcuts or accessibility labels — ARIA attributes missing on buttons | All components | 2 hours | Accessibility |
| S4 | Console log buffer shows `BUFFER: N LINES` but no clear/filter capability | `PipelinePage.tsx:341` | 1 hour | UX polish |
| S5 | `DemonstrationApp.tsx` still imports `Activity` and `LineChart` icons from lucide-react — unused after nav simplification | `DemonstrationApp.tsx:6` | 5 min | Clean imports |

---

## 3. Readiness Scores (out of 100)

| Category | Score | Rationale |
|----------|-------|-----------|
| **Backend** | **65/100** | Functional API with real ML inference, but 77KB main.py, model retrains at startup, no serialization, some mock endpoints, no Docker |
| **Frontend** | **78/100** | Clean UI, all values backend-driven, zero `Math.random()` or fake timers, but no error boundaries, unused `recharts` dep, `any` types |
| **AI/ML Pipeline** | **60/100** | Sound methodology (OC-SVM, 13 features, health scoring), but model not serialized, metrics hardcoded, "SHAP" is z-scores, retrains non-deterministically |
| **User Experience** | **72/100** | Professional dark theme, clear stage explanations, but no loading states, no error UI, duplicate attack selectors, fast replay hard to follow |
| **Code Quality** | **55/100** | Main.py is a monolith, no tests, `any` types, global state, dead code files, unused dependencies, no CI/CD |
| **Deployment Readiness** | **25/100** | No Docker, no env vars, CORS wide open, no docker-compose, no dockerignore, no production startup script |
| **Demo Readiness** | **70/100** | Works end-to-end if you know how to start both servers, but fragile (no error handling for missing data), no one-click script |
| **Overall** | **60/100** | Strong technical demo with real ML, but shipping to a judge requires packaging (Docker), error hardening, and removing mock fallbacks |

---

## 4. Go / No-Go Recommendation

### Recommendation: **CONDITIONAL GO**

The project is **strong enough to submit** to Tata InnoVent if the following minimum requirements are met first:

**Must fix before submission:**
1. ✅ ~~Remove 800ms minimum timer (DONE)~~ 
2. ✅ ~~Remove frontend fallback values (DONE)~~
3. ❌ **Create a Dockerfile + docker-compose.yml** so judges can run `docker compose up` and see the demo
4. ❌ **Replace model retraining at startup with model serialization** — train once offline, load `.pkl` at startup
5. ❌ **Add error handling for missing data** — fail fast with clear error message instead of silently using mock data
6. ❌ **Remove or flag mock endpoints** (`/api/demo/attack-data`, `/api/attack`, `/api/telemetry`) — or add a warning badge

**What to tell the judges:**
- The pipeline runs inference on precomputed behavioral windows (raw CAN messages were segmented offline)
- SHAP values are computed via z-score feature deviation (a proxy for true SHAP, suitable for edge deployment)
- The threat story uses rule-based templates with real anomaly data (not LLM-generated — by design for deterministic, explainable output)
- Model metrics are from the One-Class SVM trained on 19,777 normal driving windows (precomputed during development)

**Streamlit Deployment:**
- **Not recommended** for this variant. The frontend is a Next.js application with complex animations. Streamlit would require a complete rewrite. Instead, use the Dockerized Next.js + FastAPI stack.
- If a simpler deployment is needed: create a `docker-compose.yml` with `Dockerfile` for backend and use `npm run build` + `npm start` for the frontend behind a reverse proxy (nginx in Docker).

---

## 5. Appendix: Data Flow Verification

Every value visible on the Pipeline page now originates from the backend:

| UI Element | Backend Field | Frontend Access | Verified |
|-----------|---------------|-----------------|----------|
| Stage Name | `stages[i].label` | `activeStage.label` | ✓ |
| Stage Purpose | `stages[i].purpose` | `activeStage.purpose` | ✓ |
| Stage Inputs | `stages[i].inputs` | `activeStage.inputs` | ✓ |
| Stage Outputs | `stages[i].outputs` | `activeStage.outputs` | ✓ |
| AI Reasoning | `stages[i].ai_reasoning` | `activeStage.ai_reasoning` | ✓ |
| Decision | `stages[i].decision` | `activeStage.decision` | ✓ |
| Duration | `stages[i].data.duration_ms` | `activeStage.data?.duration_ms` | ✓ |
| ECU Status | `stages[i].data.ecu_status` | `activeStage.data?.ecu_status` | ✓ |
| Health Score | `stages[4].data.health_score` | `activeStage.data?.health_score` | ✓ |
| Threat Component | `stages[4].data.threat_component` | `activeStage.data?.threat_component` | ✓ |
| Stability Component | `stages[4].data.stability_component` | `activeStage.data?.stability_component` | ✓ |
| Pressure Component | `stages[4].data.pressure_component` | `activeStage.data?.pressure_component` | ✓ |
| Threat Count | `stages[i].data.threat_count` | `activeStage.data?.threat_count` | ✓ |
| Features (Stage 3) | `stages[2].data.features[]` | `d.features` array | ✓ |
| SHAP (Stage 6) | `stages[5].data.features[]` | `d.features` array (z-score based) | ✓ |
| Narrative (Stage 7) | `stages[6].data.narrative` | `d.narrative` | ✓ |
| Defense Actions (Stage 8) | `stages[7].data.actions[]` | `d.actions` array | ✓ |
| Recovery Metrics (Stage 9) | `stages[8].data.*` | `d.health_before_attack`, etc. | ✓ |
| Console Logs | `stages[i].data.logs[]` | Collected from all completed stages | ✓ |
| Summary: Attack Type | `summary.attack_type` | `summary.attack_type` | ✓ |
| Summary: Detection | `summary.detection_status` | `summary.detection_status` | ✓ |
| Summary: Health Delta | `summary.health_before/during/after` | `summary.health_before/...` | ✓ |
| Summary: Anomaly Score | `summary.anomaly_score` | `summary.anomaly_score` | ✓ |
| Summary: Confidence | `summary.confidence` | `summary.confidence` | ✓ |
| Summary: Model | `summary.model_used` | `summary.model_used` | ✓ |
| Summary: Features | `summary.features_extracted_count` | `summary.features_extracted_count` | ✓ |
| Summary: Recovery Time | `summary.recovery_time_ms` | `summary.recovery_time_ms` | ✓ |
| Summary: Final State | `summary.final_vehicle_state` | `summary.final_vehicle_state` | ✓ |

**Total backend-driven values on Pipeline page: 28/28 (100%)**
**Zero fake values, zero `Math.random()`, zero scripted timers.**
