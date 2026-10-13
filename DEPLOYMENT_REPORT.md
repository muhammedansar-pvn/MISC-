# MISC Integrated Academic Portal — Production Deployment Readiness Report

**Date:** October 12, 2026  
**Auditor:** Senior Node.js / Next.js & DevOps Infrastructure Reviewer  
**Repository Working Directory:** `c:\Users\hp\OneDrive\Desktop\misc`  
**Target Environment:** Self-hosted Linux (Ubuntu Server) coexisting with an active Laravel/PHP + MySQL stack behind Nginx/Apache, served under an institutional subdomain (e.g., `portal.institution.edu`) with HTTPS, PM2 process management, and MongoDB (self-hosted or MongoDB Atlas).

---

## 1. Project Summary and Architecture

### 1.1 Architecture & Process Topology
The MISC (Markaz Integrated Studies Council) platform is a full-stack academic and institutional management system consisting of two primary software tiers:

```
                            +-------------------------------------------+
                            |     Client Browser / Mobile User          |
                            +-------------------------------------------+
                                                 |
                                         HTTPS / WSS (Port 443)
                                                 v
                            +-------------------------------------------+
                            |       Reverse Proxy (Nginx / Apache)       |
                            |   Coexisting with Laravel Virtual Hosts   |
                            +-------------------------------------------+
                                /                       \           \
                    Proxy (Port 3000)            Proxy (Port 5000)   Proxy (Port 5000)
                              /                           \           \
                             v                             v           v
               +---------------------------+    +--------------------------------+
               |     Next.js 15 Web        |    |      Express 4 API Server      |
               |      App Router           |    |     Socket.IO v4 Real-Time     |
               |   (PM2: "misc-web")       |    |       (PM2: "misc-api")        |
               +---------------------------+    +--------------------------------+
                                                                |
                                             Mongoose 8 (Port 27017 or Atlas TLS)
                                                                v
                                                +--------------------------------+
                                                |       MongoDB Database         |
                                                |   Isolated from Laravel MySQL  |
                                                +--------------------------------+
```

1. **Backend Service (`misc-api`):**
   - **Runtime & Framework:** Node.js (tested on v24.12.0 LTS compatible), Express `4.21.2`, Mongoose `8.10.1`, Socket.IO `4.8.4`.
   - **Internal Network Port:** `5000` (configurable via `PORT`).
   - **Authentication:** Stateless JWT via `jsonwebtoken` (`9.0.3`) signed with HS256, bcrypt (`3.0.3`) password hashing (work factor 12), and 6-digit cryptographic SHA-256 OTP verification.
   - **File System Storage:** Local disk storage via Multer (`2.4.0`) writing to `backend/uploads/`.
   - **Email:** Nodemailer (`10.0.10`) via SMTP transport (Gmail/institutional relay).
   - **Payments:** Razorpay REST API integration via native `fetch` and HMAC-SHA256 signature verification; Stripe gateway stub.
   - **Entry Point:** [`backend/src/server.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/server.js).

2. **Frontend Service (`misc-web`):**
   - **Framework:** Next.js `15.2.0` App Router, React `19.0.0`, Tailwind CSS `4.0.9`.
   - **Internal Network Port:** `3000`.
   - **API Client:** Axios `1.20.0` configured in [`frontend/src/api/axios.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/api/axios.js) with client-side interceptors reading from `localStorage`.
   - **Real-Time Client:** `socket.io-client` `4.8.4` singleton context in [`frontend/src/context/SocketContext.tsx`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/context/SocketContext.tsx).

3. **Data Stores:**
   - **MongoDB:** Mongoose 8 database storing 41 distinct domain collections (users, students, parents, faculty, exams, attendance, leaves, payments, etc.). Completely decoupled from the server's existing MySQL database.

---

### 1.2 Verification of Project Facts

| Claimed Project Fact | Codebase Status | Verification Details & File Citations |
| :--- | :--- | :--- |
| **Backend Stack** | **Verified (with correction)** | Express `4.21.2`, Mongoose `8.10.1`, Socket.IO `4.8.4`, JWT, Joi `18.2.8`, Multer `2.4.0`, Nodemailer `10.0.10` confirmed in [`backend/package.json`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/package.json#L11-L24). **Correction:** `razorpay` and `stripe` npm packages are **NOT** in `package.json`. Razorpay order creation uses Node native `fetch` ([`backend/src/modules/payments/payment.service.js:147`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/payments/payment.service.js#L147)) and Node `crypto`. Stripe is an unverified stub ([`payment.service.js:418`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/payments/payment.service.js#L418)). |
| **Frontend Stack** | **Verified** | Next.js `15.2.0` App Router, TypeScript pages, JSX components, Axios `1.20.0`, `socket.io-client` `4.8.4` confirmed in [`frontend/package.json`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/package.json#L12-L24). |
| **Legacy Vite Leftovers** | **Verified** | Root `/dist` (14 files) and `/frontend/dist` (14 files) contain old Vite build outputs, including a 14.2 MB MP4 video (`Markaz Foundation Day...mp4`) and static assets. An obsolete `VITE_` reference remains in [`backend/scripts/testEmailEventIntegrationE2E.js:601`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/scripts/testEmailEventIntegrationE2E.js#L601). |
| **User Roles** | **Verified** | Roles enum: `["ADMIN", "PRINCIPAL", "HOD", "FACULTY", "STUDENT", "PARENT", "INSTITUTION"]` defined in [`backend/src/shared/constants/roles.js:1-9`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/shared/constants/roles.js#L1-L9) and [`backend/src/modules/users/user.model.js:36`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/users/user.model.js#L36). |
| **Coexistence Requirements** | **Verified** | System must run alongside Laravel/PHP + MySQL on a single Ubuntu host. Dedicated virtual hosts and port separation are strictly necessary. |

---

## 2. Production Readiness Score

### **Readiness Score: 4.5 / 10**

### Justification:
- **Architecture & Domain Coverage (Strong):** The backend demonstrates rigorous domain-driven design across 23 submodules. Core business requirements (academic terms, exams, mark verification, leave approval workflows, atomic student creation) are comprehensively implemented. OTP flows use SHA-256 hashing and rate cooldowns.
- **Why It Cannot Go Live Today (Critical Vulnerabilities):**
  1. **Financial/Payment Bypass:** An authenticated user can invoke `POST /api/payments` with `gateway: "MANUAL"` or `"BANK_TRANSFER"` and `status: "SUCCESS"` to mark exam registrations as paid and automatically issue hall tickets without administrative review or payment processing.
  2. **Data Privacy Breach via Static Uploads:** The `/uploads` directory is served publicly through `express.static()` without authentication, allowing unauthenticated scraping of student assignments, answer sheets, and photo IDs.
  3. **Stored XSS via File Uploads:** Multer permits `.svg` file uploads without MIME-type enforcement or `Content-Disposition: attachment` headers, creating a direct stored XSS vulnerability on the domain.
  4. **Client-Controlled 2FA Bypass:** The login route determines whether 2FA is needed based on `req.body.requires2FA`. If an attacker omits this parameter, 2FA is bypassed entirely for administrators.
  5. **Hardcoded Fallback Credentials:** Development JWT secrets and Razorpay test API keys remain hardcoded in `backend/src/config/env.js`.
  6. **Process Stability:** No graceful shutdown (`SIGTERM`/`SIGINT`), unhandled rejection handling, or database connectivity checks in `/api/health`.

---

## 3. Critical Issues (Must Fix Before Go-Live)

| # | Issue | File & Line | Risk Level | Exact Fix |
| :- | :--- | :--- | :--- | :--- |
| **C-01** | **Payment Bypass: Non-Admin Can Forge Successful Offline Payments to Issue Hall Tickets** | [`backend/src/modules/payments/payment.routes.js:28`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/payments/payment.routes.js#L28)<br>[`backend/src/modules/payments/payment.service.js:231-259`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/payments/payment.service.js#L231-L259) | **CRITICAL** | `router.post("/", requireAuth, validateCreatePayment, handleCreatePayment)` lacks role checks. In `payment.service.js`, only `RAZORPAY` and `STRIPE` are forced to `PENDING`. An authenticated student can submit `gateway: "MANUAL"`, `status: "SUCCESS"`, triggering `updateTargetRegistrationStatus` to issue a hall ticket without paying. **Fix:** Restrict `POST /api/payments` to `requireRole("ADMIN")`, or enforce `status = "PENDING"` unconditionally for all offline payments submitted by non-admins. |
| **C-02** | **Unauthenticated Static File Serving of Sensitive Student Documents and Photos** | [`backend/src/app.js:30`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/app.js#L30) | **CRITICAL** | `app.use("/uploads", express.static(...))` serves private student homework, exam papers, and personal photo IDs publicly. Any internet user guessing or acquiring the filename can access student PII without credentials. **Fix:** Remove public `express.static("/uploads")`. Implement an authenticated streaming download route `GET /api/uploads/:filename` that validates JWT and user ownership/role, or move to private cloud object storage (S3) with presigned URLs. |
| **C-03** | **Stored XSS via Unrestricted SVG Uploads in Multer Middleware** | [`backend/src/middleware/upload.middleware.js:34, 39-51`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/middleware/upload.middleware.js#L34) | **CRITICAL** | `ALLOWED_EXTENSIONS` includes `.svg` and only checks file extension without validating MIME type. Malicious SVG files containing `<script>` or event handlers (`onload`) execute JavaScript when opened in a browser under the application domain, leading to session hijacking. **Fix:** Remove `.svg` from `ALLOWED_EXTENSIONS`. Restrict images to `image/jpeg`, `image/png`, and `image/webp`. Enforce `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff` headers on file responses. |
| **C-04** | **Client-Controlled 2FA Bypass for Privileged Accounts** | [`backend/src/modules/auth/auth.controller.js:279`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/auth/auth.controller.js#L279) | **CRITICAL** | In `login()`, 2FA verification is only triggered `if (requires2FA === true)` from the request body. An attacker possessing an admin or faculty password can omit `requires2FA` to receive a valid session token immediately, bypassing 2FA. **Fix:** Enforce 2FA server-side based on user role or DB flag (`if (user.role === "ADMIN" || user.twoFactorEnabled)`), ignoring `req.body.requires2FA`. |
| **C-05** | **Hardcoded Test Secrets and Dev Fallbacks in Source Code** | [`backend/src/config/env.js:5, 32-34`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/config/env.js#L5)<br>[`backend/src/modules/payments/payment.service.js:209`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/payments/payment.service.js#L209) | **CRITICAL** | Fallback test keys (`rzp_test_T2CUQ6SUgQAvux` and `8uMFk50wA5kUolX0CNkNSiAB`) and `default_jwt_secret_dev_key` are hardcoded in the codebase. If `NODE_ENV` is missing or misconfigured, the backend runs in test mode with known keys. **Fix:** Remove all fallback keys from code. Require `NODE_ENV === "production"` and terminate process startup if `JWT_SECRET`, `RAZORPAY_KEY_ID`, or `RAZORPAY_KEY_SECRET` are not set. |
| **C-06** | **Critical Transitive Vulnerability: IP Spoofing via IPv4-Mapped IPv6 Subnet (`proxy-addr`)** | [`backend/src/app.js:13`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/app.js#L13)<br>[`backend/package.json:15`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/package.json#L15) | **CRITICAL** | Transitive dependency `proxy-addr` in Express 4.21.2 is vulnerable to GHSA-jqcg-44mw-7w3h (Critical IP spoofing). Because `app.set("trust proxy", 1)` is active, attackers can forge `X-Forwarded-For` headers to bypass IP-based rate limiting on login, OTP, and registration. **Fix:** Upgrade subdependencies (`npm audit fix`) and configure Nginx to explicitly override and sanitize `X-Forwarded-For` and `X-Real-IP`. |
| **C-07** | **Accidental Production Data Wipe Risk: Script Missing Environment Guard** | [`backend/scripts/executeProductionCleanup.js:1-12, 46`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/scripts/executeProductionCleanup.js#L1) | **CRITICAL** | `executeProductionCleanup.js` reads `cleanup_manifest.json` and invokes `db.collection(coll).deleteMany()` directly against whatever database is configured in `.env`. Unlike other scripts, it never imports `assertNotProduction()`. **Fix:** Add `assertNotProduction("executeProductionCleanup")` at the top of the file, and exclude all `backend/scripts/*.js` files from the production deployment archive. |

---

## 4. Important Issues (Should Fix)

| # | Issue | File & Line | Risk Level | Exact Fix |
| :- | :--- | :--- | :--- | :--- |
| **I-01** | **NoSQL Query Injection via Unsanitized `req.query` Parameters** | [`backend/src/modules/payments/payment.controller.js:79-87`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/payments/payment.controller.js#L79)<br>[`backend/src/modules/students/student.controller.js:115-122`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/students/student.controller.js#L115) | **HIGH** | `req.query` parameters are passed directly into Mongoose filters without sanitization. Express parses query parameters like `status[$ne]=SUCCESS` as MongoDB query selector objects. **Fix:** Install `express-mongo-sanitize` in `app.js` and validate query parameters with Joi schemas. |
| **I-02** | **Health Check Does Not Monitor Database Connectivity** | [`backend/src/routes/index.js:30-35`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/routes/index.js#L30) | **HIGH** | `GET /api/health` returns `200 OK` unconditionally without checking MongoDB state. If the database crashes, monitoring tools and reverse proxy health checks report the service as healthy. **Fix:** Check `mongoose.connection.readyState === 1` and return `503 Service Unavailable` if MongoDB is disconnected. |
| **I-03** | **Missing Process Lifecycle Handlers (Graceful Shutdown & Unhandled Rejections)** | [`backend/src/server.js:16-24`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/server.js#L16) | **HIGH** | Server lacks handlers for `SIGTERM`, `SIGINT`, `unhandledRejection`, and `uncaughtException`. Reloads via PM2 (`pm2 reload api`) abruptly kill in-flight DB operations and WebSocket handshakes. **Fix:** Add graceful shutdown logic closing HTTP connections, Socket.IO, and Mongoose connection cleanly with a 10s timeout. |
| **I-04** | **Startup Race Condition: Server Binds Before Database Connects** | [`backend/src/server.js:9, 16`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/server.js#L9)<br>[`backend/src/config/db.js:3-12`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/config/db.js#L3) | **HIGH** | `connectDB()` is called without `await`. `httpServer.listen(PORT)` begins accepting traffic before MongoDB connection completes, leading to rejected queries on startup. **Fix:** Wrap startup in an async function: `await connectDB(); httpServer.listen(...)`. |
| **I-05** | **JWT Stored in Browser `localStorage` (XSS Exposure)** | [`frontend/src/utils/token.ts:29, 45`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/utils/token.ts#L29)<br>[`frontend/src/api/axios.js:16`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/api/axios.js#L16) | **HIGH** | Tokens stored in `localStorage` are vulnerable to exfiltration if any script injection or 3rd-party script compromise occurs. **Fix:** Store authentication tokens in `httpOnly`, `Secure`, `SameSite=Strict/Lax` cookies, preventing client-side script access. |
| **I-06** | **Excessive Global JSON Body Size Limit (25MB)** | [`backend/src/app.js:21-27`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/app.js#L21) | **MEDIUM** | `express.json({ limit: "25mb" })` allows massive JSON payloads that block Node's single-threaded event loop during synchronous JSON parsing. **Fix:** Lower JSON body limit to `1mb` (`express.json({ limit: "1mb" })`). File uploads already use Multer streaming multipart. |
| **I-07** | **Next.js Build-Time Inlining of `NEXT_PUBLIC_API_BASE_URL`** | [`frontend/src/api/axios.js:4`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/api/axios.js#L4)<br>[`frontend/src/context/SocketContext.tsx:29`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/context/SocketContext.tsx#L29) | **HIGH** | Next.js bakes `NEXT_PUBLIC_*` values into client bundles during `next build`. If built prior to configuring `.env.production`, bundles retain `http://localhost:5000/api`, causing client requests to fail on external networks. **Fix:** Ensure production `.env.production` is present before executing `next build` on the Linux deployment host. |
| **I-08** | **Unbounded Queries and Missing Pagination in Analytics, CMS, and Exams** | [`backend/src/modules/analytics/analytics.service.js:1343, 1374`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/analytics/analytics.service.js#L1343)<br>[`backend/src/modules/cms/cms.service.js:12`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/cms/cms.service.js#L12) | **HIGH** | `analytics.service.js` executes `ExamRegistration.find()` and `StudentProfile.find()` without limits, loading entire database tables into V8 heap memory. **Fix:** Implement cursor streaming or pagination with default limits (`limit(50)`). |
| **I-09** | **Incomplete Webhook Configuration: `RAZORPAY_WEBHOOK_SECRET` Missing from `.env.example`** | [`backend/src/config/env.js:34`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/config/env.js#L34)<br>[`backend/src/modules/payments/payment.service.js:456`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/payments/payment.service.js#L456) | **HIGH** | `env.js` falls back to `RAZORPAY_KEY_SECRET` if `RAZORPAY_WEBHOOK_SECRET` is omitted. In Razorpay, webhook signing secrets are separate from API keys. Using the API secret causes HMAC verification failures on live webhooks. **Fix:** Add `RAZORPAY_WEBHOOK_SECRET` to `.env.example` and remove the fallback in `payment.service.js`. |
| **I-10** | **Unindexed Frequently Queried Models (`EventRegistration`, `DownloadResource`)** | [`backend/src/modules/events/event-registration.model.js:1`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/events/event-registration.model.js#L1)<br>[`backend/src/modules/downloads/download-resource.model.js:1`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/downloads/download-resource.model.js#L1) | **MEDIUM** | Models lack index definitions for `eventId`, `studentId`, `registrationStatus`, and `category`, resulting in collection scans under high student concurrency. **Fix:** Add compound and single-field indexes in schemas. |
| **I-11** | **User Enumeration in Forgot Password and Registration Responses** | [`backend/src/modules/auth/auth.controller.js:38, 525-529`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/auth/auth.controller.js#L38) | **MEDIUM** | `forgotPassword` returns HTTP 400 with specific parent messaging if the email belongs to a parent, but HTTP 200 for unknown emails. `register` returns 409 if email exists. **Fix:** Return uniform HTTP 200 responses for password resets and generic messaging on registration. |
| **I-12** | **Socket.IO and Rate Limiter State Unsafe in PM2 Cluster Mode** | [`backend/src/socket/index.js:23-42`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/socket/index.js#L23)<br>[`backend/src/middleware/rate-limit.middleware.js:18-29`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/middleware/rate-limit.middleware.js#L18) | **HIGH** | In-memory socket rooms and `express-rate-limit` counters cannot be shared across multiple cluster workers without Redis. Running `instances: "max"` will break socket connections. **Fix:** Run API in PM2 `fork` mode (`instances: 1`). If horizontal scaling is needed, integrate `@socket.io/redis-adapter` and `rate-limit-redis`. |

---

## 5. Minor Improvements

1. **HTTP Response Compression:** Express does not use the `compression` middleware. JSON API responses for timetables and large exam schedules are transmitted uncompressed unless handled by Nginx.
2. **Structured Logging & Rotation:** The backend relies entirely on `console.log` / `console.error`. Logs should be structured via Winston/Pino and managed using `pm2-logrotate`.
3. **Large Public Assets:** [`frontend/public/`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/public) contains `Markaz Foundation Day - Empowering Generations Since 1978..mp4` (14.2 MB) alongside duplicate uncompressed PNG/JPEG files. Large media files should be hosted on a CDN or streaming service.
4. **Duplicate Lockfiles Warning:** Next.js build emits a warning due to both root `package-lock.json` and `frontend/package-lock.json`. Set `outputFileTracingRoot` in `next.config.mjs` or standardize on root workspaces.
5. **Next.js Security Headers:** [`frontend/next.config.mjs`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/next.config.mjs) lacks default security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and CSP).
6. **CORS Development Fallback in Production:** [`backend/src/config/cors.js:4-10`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/config/cors.js#L4) includes `http://localhost:3000` and `http://127.0.0.1:3000` in the production allowed origins list.

---

## 6. Environment Variables Table

### 6.1 Backend (`backend/.env`)

| Variable Name | Purpose | Required in Prod? | Safe Example / Default | Production Notes |
| :--- | :--- | :---: | :--- | :--- |
| `NODE_ENV` | Sets runtime mode | **Yes** | `production` | Must be strictly `production`. Disables verbose error stacks and locks down CORS. |
| `PORT` | Local port Express listens on | **Yes** | `5000` | Bind internally. Nginx reverse proxies traffic to this port. |
| `APP_URL` | Public frontend URL | **Yes** | `https://portal.institution.edu` | Used for CORS origin validation and email CTA link generation. Must include protocol, no trailing slash. |
| `SETUP_BASE_URL` | Account setup link base | Optional | `https://portal.institution.edu/account-setup` | Base URL embedded in invitation and password reset emails. |
| `MONGODB_URI` | MongoDB connection string | **Yes** | `mongodb://127.0.0.1:27017/misc` or Atlas URI | For local instances, require authentication. Include `authSource=admin` if configured. |
| `JWT_SECRET` | Secret for signing auth tokens | **Yes** | *[64-character random hex]* | **Never use default.** Generate via `openssl rand -hex 32`. Startup throws fatal error if default or empty. |
| `SMTP_HOST` | Outgoing mail server | **Yes** | `smtp.mailgun.org` or `smtp.gmail.com` | Institutional or transactional email provider. |
| `SMTP_PORT` | SMTP connection port | **Yes** | `587` | Port 587 (STARTTLS) or 465 (SSL/TLS). |
| `SMTP_SECURE` | Enable SSL/TLS encryption | **Yes** | `false` (for 587) / `true` (for 465) | Set `false` for port 587; set `true` for port 465. |
| `SMTP_USER` | SMTP username/email | **Yes** | `notifications@institution.edu` | Authenticated email account username. |
| `SMTP_PASS` | SMTP password/app password | **Yes** | *[Secure app password]* | Use dedicated App Password or SMTP API credential. |
| `SMTP_FROM_NAME` | Sender name header | Optional | `MISC Academic Portal` | Display name shown to recipients. |
| `SMTP_FROM_EMAIL` | Sender address header | Optional | `no-reply@institution.edu` | Verified domain address to prevent SPF/DKIM flags. |
| `RAZORPAY_KEY_ID` | Razorpay public key identifier | **Yes** (if payments enabled) | `rzp_live_...` | **Must be live key (`rzp_live_...`).** Remove all test key fallbacks. |
| `RAZORPAY_KEY_SECRET` | Razorpay secret API key | **Yes** (if payments enabled) | *[Live Secret]* | Private key used for order creation and HMAC verification. |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret | **Yes** (if webhooks enabled) | *[Webhook Secret from Dashboard]* | Dedicated secret generated in Razorpay Dashboard -> Settings -> Webhooks. |
| `STRIPE_SECRET_KEY` | Stripe gateway secret | No (Stub) | *[Leave empty]* | Currently unused stub in production. |
| `ADMIN_INITIAL_USERNAME` | First admin account username | Optional | `superadmin` | Used once during initial database bootstrap via `seedAdmin.js`. |
| `ADMIN_INITIAL_PASSWORD` | First admin account password | Optional | *[Complex temporary password]* | Required by `seedAdmin.js` when `NODE_ENV=production`. |
| `ALLOW_PROD_TEST_EXECUTION` | Test script safety override | No | `false` | Must remain `false` or unset on production servers. |

---

### 6.2 Frontend (`frontend/.env.production`)

| Variable Name | Purpose | Required in Prod? | Safe Example / Default | Production Notes |
| :--- | :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for Axios client | **Yes** | `https://portal.institution.edu/api` | **BsetText before `next build`.** Baked into static JavaScript client bundles. |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | Optional | `https://portal.institution.edu` | URL for WebSocket handshake. Defaults to `API_BASE_URL` without `/api`. |
| `NODE_ENV` | Next.js execution mode | Automatic | `production` | Managed automatically by Next.js during build and start. |

---

## 7. Exact Code Changes Needed (Before / After Diffs)

### Fix 1: Restrict `POST /api/payments` to Prevent Payment Bypass
**File:** [`backend/src/modules/payments/payment.routes.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/payments/payment.routes.js#L28)

```diff
--- a/backend/src/modules/payments/payment.routes.js
+++ b/backend/src/modules/payments/payment.routes.js
@@ -16,6 +16,7 @@ const {
   validateVerifyPayment,
 } = require("./payment.validator");
 const { requireAuth } = require("../../middleware/auth.middleware");
+const { requireRole } = require("../../middleware/role.middleware");
 
 const router = express.Router();
 
@@ -25,7 +26,7 @@ router.post("/webhook/razorpay", handleRazorpayWebhook);
 router.post("/create-order", requireAuth, validateCreateOrder, handleCreateOrder);
 router.post("/verify", requireAuth, validateVerifyPayment, handleVerifyPayment);
 router.get("/overview", requireAuth, handleGetPaymentOverview);
 
-router.post("/", requireAuth, validateCreatePayment, handleCreatePayment);
+router.post("/", requireAuth, requireRole("ADMIN"), validateCreatePayment, handleCreatePayment);
 router.get("/", requireAuth, handleGetPayments);
 router.get("/:transactionId", requireAuth, handleGetPaymentByTransactionId);
```

---

### Fix 2: Remove Hardcoded Secrets and Require Strict Production Variables
**File:** [`backend/src/config/env.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/config/env.js#L5-L36)

```diff
--- a/backend/src/config/env.js
+++ b/backend/src/config/env.js
@@ -2,14 +2,16 @@ const path = require("path");
 require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
 require("dotenv").config();
 
-const DEV_DEFAULT_JWT_SECRET = "default_jwt_secret_dev_key";
-
-if (
-  process.env.NODE_ENV === "production" &&
-  (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "" || process.env.JWT_SECRET === DEV_DEFAULT_JWT_SECRET)
-) {
-  throw new Error("FATAL: JWT_SECRET must be explicitly set to a secure string in production and cannot equal the dev default.");
+if (process.env.NODE_ENV === "production") {
+  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
+    throw new Error("FATAL: JWT_SECRET must be set to a secure string of at least 32 characters in production.");
+  }
+  if (!process.env.MONGODB_URI) {
+    throw new Error("FATAL: MONGODB_URI must be explicitly configured in production.");
+  }
 }
 
 const env = {
@@ -15,7 +17,7 @@ const env = {
   NODE_ENV: process.env.NODE_ENV || "development",
   PORT: parseInt(process.env.PORT || "5000", 10),
   MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/misc",
-  JWT_SECRET: process.env.JWT_SECRET || DEV_DEFAULT_JWT_SECRET,
+  JWT_SECRET: process.env.JWT_SECRET || "",
   APP_URL: process.env.APP_URL || "http://localhost:3000",
   SETUP_BASE_URL: process.env.SETUP_BASE_URL || "http://localhost:3000/account-setup",
   
@@ -29,9 +31,9 @@ const env = {
   SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "no-reply@misc.edu",
 
   // Payment Gateways (Strict production isolation)
-  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || (process.env.NODE_ENV === "production" ? "" : "rzp_test_T2CUQ6SUgQAvux"),
-  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || (process.env.NODE_ENV === "production" ? "" : "8uMFk50wA5kUolX0CNkNSiAB"),
-  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || (process.env.NODE_ENV === "production" ? "" : "8uMFk50wA5kUolX0CNkNSiAB"),
+  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
+  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
+  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
   STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
 };
```

---

### Fix 3: Enforce Server-Side 2FA Enforcement in Login Flow
**File:** [`backend/src/modules/auth/auth.controller.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/auth/auth.controller.js#L279)

```diff
--- a/backend/src/modules/auth/auth.controller.js
+++ b/backend/src/modules/auth/auth.controller.js
@@ -276,7 +276,9 @@ const login = async (req, res) => {
       }
     }
 
-    if (requires2FA === true) {
+    // Authoritative server-side 2FA policy: Admins require 2FA unconditionally
+    const shouldEnforce2FA = user.role === "ADMIN" || requires2FA === true;
+    if (shouldEnforce2FA) {
       const otpResult = await sendAndStoreOtp(user.email, "LOGIN_2FA", { userId: user._id });
       return res.status(200).json({
         success: true,
```

---

### Fix 4: Remove Executable SVG Upload Support and Add MIME Validation
**File:** [`backend/src/middleware/upload.middleware.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/middleware/upload.middleware.js#L34-L51)

```diff
--- a/backend/src/middleware/upload.middleware.js
+++ b/backend/src/middleware/upload.middleware.js
@@ -31,7 +31,7 @@ const ALLOWED_EXTENSIONS = new Set([
   ".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt",
   ".xls", ".xlsx", ".csv", ".ods",
   ".ppt", ".pptx", ".odp",
-  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
+  ".png", ".jpg", ".jpeg", ".webp", ".gif",
   ".zip", ".rar", ".7z", ".tar", ".gz",
   ".mp3", ".wav", ".mp4", ".webm"
 ]);
@@ -47,6 +47,11 @@ const fileFilter = (req, file, cb) => {
     return cb(new Error(`File extension ${ext} is not allowed. Allowed types include PDF, documents, spreadsheets, images, and archives.`));
   }
 
+  // Disallow executable content types
+  if (file.mimetype === "image/svg+xml" || file.mimetype === "text/html") {
+    return cb(new Error("File content type rejected for security reasons."));
+  }
+
   cb(null, true);
 };
```

---

### Fix 5: Graceful Shutdown and Async Database Connection Bootstrap
**File:** [`backend/src/server.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/server.js#L9-L24)

```diff
--- a/backend/src/server.js
+++ b/backend/src/server.js
@@ -1,24 +1,58 @@
 const http = require("http");
+const mongoose = require("mongoose");
 const env = require("./config/env");
 const connectDB = require("./config/db");
 const app = require("./app");
-const { initSocketServer } = require("./socket");
+const { initSocketServer, closeSocketServer } = require("./socket");
 
 const PORT = env.PORT || 5000;
 
-connectDB();
-
-const httpServer = http.createServer(app);
-
-// Attach Socket.IO real-time server
-initSocketServer(httpServer);
-
-const server = httpServer.listen(PORT, () => {
-  console.log(`MISC Backend Server running in ${env.NODE_ENV} mode on port ${PORT}`);
-});
-
-server.on("error", (error) => {
-  console.error("Server Startup Error:", error.message);
-});
+let server;
+
+async function startServer() {
+  try {
+    await connectDB();
+
+    const httpServer = http.createServer(app);
+    initSocketServer(httpServer);
+
+    server = httpServer.listen(PORT, () => {
+      console.log(`MISC Backend Server running in ${env.NODE_ENV} mode on port ${PORT}`);
+    });
+
+    server.on("error", (error) => {
+      console.error("Server Startup Error:", error.message);
+      process.exit(1);
+    });
+  } catch (err) {
+    console.error("Failed to start server:", err);
+    process.exit(1);
+  }
+}
+
+startServer();
+
+async function gracefulShutdown(signal) {
+  console.log(`[SHUTDOWN] Received ${signal}. Closing HTTP and database connections...`);
+  if (server) {
+    server.close(async () => {
+      console.log("[SHUTDOWN] HTTP server closed.");
+      await closeSocketServer();
+      await mongoose.connection.close(false);
+      console.log("[SHUTDOWN] MongoDB connection closed cleanly.");
+      process.exit(0);
+    });
+  } else {
+    process.exit(0);
+  }
+}
+
+process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
+process.on("SIGINT", () => gracefulShutdown("SIGINT"));
+
+process.on("unhandledRejection", (reason) => {
+  console.error("[FATAL] Unhandled Rejection:", reason);
+});
+
+process.on("uncaughtException", (error) => {
+  console.error("[FATAL] Uncaught Exception:", error);
+  process.exit(1);
+});
 
 module.exports = server;
```

---

### Fix 6: Database-Aware Health Check Endpoint
**File:** [`backend/src/routes/index.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/routes/index.js#L30-L35)

```diff
--- a/backend/src/routes/index.js
+++ b/backend/src/routes/index.js
@@ -1,4 +1,5 @@
 const express = require("express");
+const mongoose = require("mongoose");
 const authRoutes = require("../modules/auth/auth.routes");
 const adminRoutes = require("../modules/admin/admin.routes");
 
@@ -28,8 +29,15 @@ const router = express.Router();
 
 // Health Check Endpoint
 router.get("/health", (req, res) => {
+  const isDbConnected = mongoose.connection.readyState === 1;
+  if (!isDbConnected) {
+    return res.status(503).json({
+      success: false,
+      status: "DEGRADED",
+      database: "DISCONNECTED",
+    });
+  }
   res.status(200).json({
     success: true,
+    status: "HEALTHY",
+    database: "CONNECTED",
   });
 });
```

---

### Fix 7: Safe JSON Request Body Limit
**File:** [`backend/src/app.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/app.js#L21)

```diff
--- a/backend/src/app.js
+++ b/backend/src/app.js
@@ -19,7 +19,7 @@ app.use(corsMiddleware);
 app.use(
   express.json({
-    limit: "25mb",
+    limit: "1mb",
     verify: (req, res, buf) => {
       req.rawBody = buf ? buf.toString() : "";
     },
```

---

## 8. Files to Add

### 8.1 PM2 Configuration (`ecosystem.config.js`)
Place in repository root (`c:\Users\hp\OneDrive\Desktop\misc\ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: "misc-api",
      cwd: "./backend",
      script: "src/server.js",
      instances: 1, // MUST be 1 for in-memory Socket.IO and rate-limiter safety
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/var/log/pm2/misc-api-error.log",
      out_file: "/var/log/pm2/misc-api-out.log",
      merge_logs: true,
      time: true,
      kill_timeout: 10000,
    },
    {
      name: "misc-web",
      cwd: "./frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: "max", // Can scale across CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "800M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/misc-web-error.log",
      out_file: "/var/log/pm2/misc-web-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
```

---

### 8.2 Nginx Server Block (`/etc/nginx/sites-available/portal.institution.edu`)

```nginx
# Upstream Definitions
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream express_upstream {
    server 127.0.0.1:5000;
    keepalive 32;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name portal.institution.edu;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Virtual Host
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name portal.institution.edu;

    ssl_certificate /etc/letsencrypt/live/portal.institution.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.institution.edu/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Maximum file upload size (Matches Multer 25MB limit)
    client_max_body_size 25M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # 1. API Endpoints
    location /api/ {
        proxy_pass http://express_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 2. WebSocket Real-Time Gateway (Socket.IO)
    location /socket.io/ {
        proxy_pass http://express_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 3. Static Uploads (Proxied to backend for security validation)
    location /uploads/ {
        proxy_pass http://express_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # 4. Next.js Static Assets Cache
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 5. Frontend Web Application (Next.js App Router)
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 8.3 Apache VirtualHost Alternative (`/etc/apache2/sites-available/portal.institution.edu.conf`)

```apache
<VirtualHost *:80>
    ServerName portal.institution.edu
    DocumentRoot /var/www/html
    RewriteEngine On
    RewriteCond %{HTTPS} !=on
    RewriteRule ^/?(.*) https://%{SERVER_NAME}/$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName portal.institution.edu

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/portal.institution.edu/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/portal.institution.edu/privkey.pem
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite HIGH:!aNULL:!MD5

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

    LimitRequestBody 26214400

    ProxyPreserveHost On
    ProxyRequests Off

    # WebSocket Proxy for Socket.IO
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://127.0.0.1:5000/$1 [P,L]

    # API Proxy
    ProxyPass /api http://127.0.0.1:5000/api
    ProxyPassReverse /api http://127.0.0.1:5000/api

    # Uploads Proxy
    ProxyPass /uploads http://127.0.0.1:5000/uploads
    ProxyPassReverse /uploads http://127.0.0.1:5000/uploads

    # Next.js Application Proxy
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

---

### 8.4 Production Environment File Templates

#### Backend Template (`backend/.env.production`)
```ini
# Node Server Environment
PORT=5000
NODE_ENV=production
APP_URL=https://portal.institution.edu
SETUP_BASE_URL=https://portal.institution.edu/account-setup

# Database Connection (Isolated from Laravel MySQL)
MONGODB_URI=mongodb://misc_user:REPLACE_WITH_STRONG_PASSWORD@127.0.0.1:27017/misc?authSource=admin

# JWT Authentication (Generate via: openssl rand -hex 32)
JWT_SECRET=REPLACE_WITH_GENERATED_64_CHAR_HEX_KEY

# SMTP Transactional Mailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notifications@institution.edu
SMTP_PASS=REPLACE_WITH_SMTP_APP_PASSWORD
SMTP_FROM_NAME="MISC Portal"
SMTP_FROM_EMAIL=notifications@institution.edu

# Razorpay Payment Gateway (LIVE Keys)
RAZORPAY_KEY_ID=rzp_live_REPLACE_WITH_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=REPLACE_WITH_LIVE_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=REPLACE_WITH_DASHBOARD_WEBHOOK_SECRET

# Bootstrap Configuration (Initial Seed Only)
ADMIN_INITIAL_USERNAME=superadmin
ADMIN_INITIAL_PASSWORD=REPLACE_WITH_STRONG_INITIAL_PASSWORD
```

#### Frontend Template (`frontend/.env.production`)
```ini
# Production Frontend Environment (Must be set BEFORE running 'next build')
NEXT_PUBLIC_API_BASE_URL=https://portal.institution.edu/api
NEXT_PUBLIC_SOCKET_URL=https://portal.institution.edu
```

---

## 9. Ubuntu Deployment Runbook

### Step 1: System Package Prerequisites
```bash
# 1. Update package registry
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 22 LTS (or 20 LTS) via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# 3. Verify node and npm
node -v
npm -v

# 4. Install PM2 globally and configure systemd autostart
sudo npm install -g pm2
pm2 startup systemd
```

### Step 2: MongoDB Installation & Hardening (If Self-Hosted)
> *Note: If using MongoDB Atlas, skip local installation and supply the Atlas URI in `backend/.env`.*

```bash
# 1. Install MongoDB Community Edition
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt update && sudo apt install -y mongodb-org

# 2. Start and enable MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# 3. Restrict RAM usage to avoid starving the Laravel MySQL stack
# Edit /etc/mongod.conf:
# storage:
#   wiredTiger:
#     engineConfig:
#       cacheSizeGB: 1
# net:
#   bindIp: 127.0.0.1  # MUST NOT be 0.0.0.0

# 4. Create database administrative user
mongosh admin --eval '
db.createUser({
  user: "misc_user",
  pwd: "GENERATE_STRONG_PASSWORD_HERE",
  roles: [ { role: "readWrite", db: "misc" } ]
})'

# 5. Enable authorization in /etc/mongod.conf:
# security:
#   authorization: enabled

sudo systemctl restart mongod
```

### Step 3: Application Code Deployment & Build Sequence
```bash
# 1. Clone repository into dedicated directory
sudo mkdir -p /var/www/misc-portal
sudo chown -R $USER:$USER /var/www/misc-portal
git clone <repo-url> /var/www/misc-portal
cd /var/www/misc-portal

# 2. Create persistent backend uploads directory with proper permissions
mkdir -p backend/uploads
chmod 750 backend/uploads

# 3. Deploy environment files (DO NOT COMMIT THESE TO GIT)
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env

# 4. Install backend dependencies and run audit fix
cd /var/www/misc-portal/backend
npm ci --production
npm audit fix

# 5. Install frontend dependencies
cd /var/www/misc-portal/frontend
npm ci

# 6. CRITICAL BUILD ORDER: Run next build ONLY AFTER .env is populated
npm run build

# 7. Seed Initial Superadmin (Run once during first deployment)
cd /var/www/misc-portal/backend
node scripts/seedAdmin.js
```

### Step 4: PM2 Launch & Process Supervision
```bash
cd /var/www/misc-portal
mkdir -p /var/log/pm2

# Install PM2 logrotate to prevent filling the disk
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Start processes via ecosystem config
pm2 start ecosystem.config.js

# Save process list for system reboot persistence
pm2 save
```

### Step 5: Web Server Configuration & SSL Setup
```bash
# Copy Nginx config to sites-available
sudo cp /path/to/nginx-config /etc/nginx/sites-available/portal.institution.edu
sudo ln -s /etc/nginx/sites-available/portal.institution.edu /etc/nginx/sites-enabled/

# Test syntax and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt SSL certificate
sudo certbot --nginx -d portal.institution.edu
```

### Step 6: Zero-Downtime Update Procedure
```bash
#!/bin/bash
set -e
cd /var/www/misc-portal

echo "Pulling latest changes..."
git pull origin main

echo "Installing backend dependencies..."
cd backend
npm ci --production
cd ..

echo "Building frontend with updated environment..."
cd frontend
npm ci
npm run build
cd ..

echo "Reloading processes with zero downtime..."
pm2 reload ecosystem.config.js --update-env

echo "Deployment complete."
```

### Step 7: Rollback Plan
```bash
# If a build or release fails, revert git HEAD and reload PM2 immediately:
cd /var/www/misc-portal
git log -n 5 --oneline
git checkout <PREVIOUS_STABLE_COMMIT_HASH>

cd frontend && npm ci && npm run build && cd ..
cd backend && npm ci --production && cd ..

pm2 reload ecosystem.config.js --update-env
```

---

## 10. Database & Uploads Backup Plan

### 10.1 Automated Backup Script (`/usr/local/bin/backup-misc.sh`)
```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/misc"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEST="${BACKUP_DIR}/${TIMESTAMP}"
MONGO_URI="mongodb://misc_user:STRONG_PASSWORD@127.0.0.1:27017/misc?authSource=admin"

mkdir -p "${DEST}"

# 1. MongoDB Database Dump
echo "Dumping MongoDB database..."
mongodump --uri="${MONGO_URI}" --gzip --archive="${DEST}/misc_mongo_${TIMESTAMP}.gz"

# 2. Archive User Uploads Directory
echo "Archiving uploads..."
tar -czf "${DEST}/misc_uploads_${TIMESTAMP}.tar.gz" -C /var/www/misc-portal/backend uploads

# 3. Enforce 14-day retention policy
find "${BACKUP_DIR}" -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +

echo "Backup completed successfully at ${DEST}"
```

### 10.2 Cron Schedule (`/etc/cron.d/misc-backup`)
```cron
# Run full backup every morning at 02:00 AM
0 2 * * * root /usr/local/bin/backup-misc.sh >> /var/log/misc-backup.log 2>&1
```

### 10.3 Restore Verification Test Procedure
```bash
# Test restoring into a temporary sandbox database
TEST_DB="misc_restore_test"
mongorestore --uri="mongodb://127.0.0.1:27017/${TEST_DB}" --gzip --archive=/var/backups/misc/<TIMESTAMP>/misc_mongo_<TIMESTAMP>.gz

# Verify document counts
mongosh "${TEST_DB}" --eval "db.users.countDocuments()"

# Clean up sandbox
mongosh "${TEST_DB}" --eval "db.dropDatabase()"
```

---

## 11. Pre-Launch Verification Checklist

- [ ] **Secret Rotation:** Rotate all JWT secrets, database credentials, and email passwords that have ever been shared, tested in non-production, or pushed to staging environments.
- [ ] **Payment Gateway Switch:** Replace Razorpay test keys with live credentials (`rzp_live_*`). Create the webhook endpoint in the Razorpay Dashboard targeting `https://portal.institution.edu/api/payments/webhook/razorpay` and copy the generated secret into `RAZORPAY_WEBHOOK_SECRET`.
- [ ] **Payment Security Hardened:** Apply `requireRole("ADMIN")` to `POST /api/payments` to prevent unauthorized manual payment marking.
- [ ] **Protected Uploads Route:** Disable unauthenticated `express.static("/uploads")` and restrict SVG files from being uploaded.
- [ ] **Frontend Build Baked Correctly:** Verify that `frontend/.env.production` contains `https://portal.institution.edu/api` before running `next build`.
- [ ] **Database Network Isolation:** Verify `net.bindIp` in `/etc/mongod.conf` is `127.0.0.1` and MongoDB authentication is enabled.
- [ ] **Firewall Hardened:** Execute `sudo ufw status` and ensure port `27017` (MongoDB) and port `5000` (Express) are blocked from external access. Only ports `80`, `443`, and `22` (SSH) should be open.
- [ ] **Cleanup Scripts Excluded:** Ensure `backend/scripts/executeProductionCleanup.js`, `db_dump.jsonl`, and QA test scripts are deleted or excluded from the deployment directory.
- [ ] **PM2 Autostart Configured:** Run `pm2 save` and `pm2 startup` so services resume automatically after an OS restart.
- [ ] **Initial Admin Bootstrapped:** Run `node scripts/seedAdmin.js` with secure credentials and log in to verify dashboard access.

---

## 12. Questions for the Institution's IT Team

1. **Server Capacity & Memory Budget:** What are the exact CPU core count and available RAM on the Linux server? Can the host support Node.js (approx. 500MB) and MongoDB (1GB+ cache) concurrently with the active PHP-FPM and MySQL workloads without risk of OOM termination?
2. **Database Architecture:** Does the institution prefer self-hosting MongoDB on the existing server, or should we connect to an external managed cluster such as MongoDB Atlas to keep local server resources dedicated to Laravel and MySQL?
3. **Web Server Setup:** Does the existing setup run Nginx or Apache, and is there an existing reverse proxy managing SSL certificates (e.g., Cloudflare or Certbot)?
4. **Subdomain & DNS Delegation:** Has the target subdomain (e.g., `portal.institution.edu`) been pointed to the server's public IP address?
5. **SMTP Relay Rules:** Does the institution provide an internal SMTP relay server, or should the application connect to an external transactional provider (e.g., Google Workspace App Password, SendGrid, Mailgun) over port 587?
6. **Firewall & Outbound Connections:** Are outbound HTTPS connections on port 443 permitted for Razorpay API calls (`api.razorpay.com`) and SMTP connections on port 587?
