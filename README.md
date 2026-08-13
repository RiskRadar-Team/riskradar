# RiskRadar Frontend

RiskRadar is a web-based cybersecurity application that helps users
assess the phishing and scam risk of URLs, emails, and suspicious
messages. This repository contains the Next.js frontend for the
application, including authentication pages, user dashboards, URL
scanning, scan history, and the administrative interface for managing
threat-intelligence data.

## Features

-   User authentication with access tokens, refresh-token cookies, password reset OTPs, and role-based access control.
-   URL scanning for suspicious structure, blacklisted or whitelisted domains/URLs, phishing keywords, Google Safe Browsing, VirusTotal, and optional Gemini analysis.
-   Email scanning for urgency, credential requests, sender and header signals, links, keywords, and optional AI analysis.
-   Message scanning for suspicious links, urgency, impersonation, financial/credential requests, and optional AI analysis.
-   Persistent scan history, findings, user dashboard, and admin dashboard.
-   Admin management of domains, URLs, phishing keywords, users, and reference data.

## Stack

-   Next.js 16
-   React 19
-   JavaScript / JSX
-   Tailwind CSS 4
-   Framer Motion
-   Lucide React
-   REST API integration with the RiskRadar backend

## Quick start

Prerequisites: Node.js 18+ and a running RiskRadar backend.

Install the dependencies:

``` bash
npm install
```

Create `.env.local` in the project root:

``` dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/riskradar
```

Start the frontend:

``` bash
npm run dev
```

The application is available at:

``` text
http://localhost:3000
```

## Environment variables

  ----------------------------------------------------------------------------
  Variable                     Required                Purpose
  ---------------------------- ----------------------- -----------------------
  `NEXT_PUBLIC_API_BASE_URL`   Yes                     Base URL of the
                                                       RiskRadar backend API

  ----------------------------------------------------------------------------

Example:

``` dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/riskradar
```

For production, configure the same variable in the hosting provider's
environment-variable settings.

Do not commit `.env.local` or other files containing
environment-specific secrets or configuration to source control.

## Backend integration

The frontend communicates with the RiskRadar backend through the API
service layer in `src/lib/`.

The backend API is expected to provide routes beginning with:

``` text
/riskradar
```

Examples of frontend-connected backend workflows include:

  Workflow             Backend endpoint
  -------------------- ----------------------------------------
  Register             `POST /riskradar/auth/register`
  Login                `POST /riskradar/auth/login`
  Refresh session      `POST /riskradar/auth/refresh-token`
  Logout               `POST /riskradar/auth/logout`
  Forgot password      `POST /riskradar/auth/forgot-password`
  Reset password       `POST /riskradar/auth/reset-password`
  URL scan             `POST /riskradar/scan/url`
  Email scan           `POST /riskradar/scan/email`
  Message scan         `POST /riskradar/scan/message`
  User history         `GET /riskradar/history`
  User dashboard       `GET /riskradar/dashboard`
  Admin dashboard      `GET /riskradar/admin/dashboard`
  Admin scans          `GET /riskradar/admin/scans`
  Domain management    `/riskradar/domain`
  URL intelligence     `/riskradar/url`
  Phishing keywords    `/riskradar/keyword`
  Threat types         `/riskradar/threat`
  Keyword categories   `/riskradar/keyword-category`

Protected API requests use the authenticated user's access token.
Refresh-token authentication is handled through the backend's HTTP-only
cookie mechanism.

## Application structure

``` text
riskradar/
├── public/
│
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── dashboard/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── DomainFormModal.jsx
│   │   │   ├── KeywordFormModal.jsx
│   │   │   └── UrlFormModal.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── RadarVisual.jsx
│   │   │   ├── ScanResultCard.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   │
│   │   ├── CTA.jsx
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── HowItWorks.jsx
│   │   └── Navbar.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   └── lib/
│       ├── accountService.js
│       ├── adminDashboardService.js
│       ├── adminScanService.js
│       ├── apiClient.js
│       ├── dashboardService.js
│       ├── domainService.js
│       ├── historyService.js
│       ├── keywordService.js
│       ├── mockDashboardData.js
│       ├── passwordResetService.js
│       ├── scanService.js
│       ├── urlService.js
│       └── userService.js
│
├── .env.local
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── package-lock.json
└── postcss.config.mjs
```

## Main pages

### Landing page

The landing page introduces RiskRadar and explains its main
capabilities, including phishing detection and security analysis.

### Authentication

The frontend includes:

-   Login
-   Registration
-   Forgot password
-   Password reset

### User dashboard

The dashboard provides the authenticated user with access to the main
security workflows:

-   URL scanning
-   Email analysis
-   Message analysis
-   Detection history
-   Security status
-   Recent activity
-   Threat overview

### Admin dashboard

The admin interface provides administrative access to the application's
threat-intelligence and monitoring features.

Administrators can work with:

-   Dashboard statistics
-   Scan information
-   Domains
-   URLs
-   Phishing keywords
-   Keyword categories
-   Threat types
-   User management
-   Active/inactive status controls

Admin operations are protected by the backend's role-based
authorization. The frontend should not be treated as the security
boundary; the backend validates the user's `ADMIN` role for protected
admin endpoints.

## Threat intelligence workflow

RiskRadar does not rely exclusively on external reputation services.

The backend maintains its own threat-intelligence data, including
information such as:

-   Blacklisted domains and URLs
-   Whitelisted domains and URLs
-   Phishing keywords
-   Keyword categories
-   Threat types
-   Risk information

The frontend's admin pages provide interfaces for managing this
information through the backend API.

External providers such as Google Safe Browsing, VirusTotal, and Gemini
are handled by the backend rather than directly from the browser.

## API client

The central API communication layer is:

``` text
src/lib/apiClient.js
```

Feature-specific service files are separated by responsibility:

``` text
accountService.js
adminDashboardService.js
adminScanService.js
dashboardService.js
domainService.js
historyService.js
keywordService.js
passwordResetService.js
scanService.js
urlService.js
userService.js
```

This keeps API calls separate from UI components and makes the frontend
easier to maintain.

## Authentication

Authentication is managed through:

``` text
src/context/AuthContext.jsx
```

The backend returns an access token after successful authentication and
uses an HTTP-only refresh-token cookie for session renewal.

When making browser requests that rely on the refresh-token cookie, the
frontend must send requests with credentials enabled.

The backend remains responsible for:

-   Validating access tokens
-   Refreshing sessions
-   Checking whether accounts are active
-   Checking user roles
-   Protecting admin endpoints


## Deployment

The frontend and backend may be hosted on different domains in
production.

Because the backend uses an HTTP-only refresh-token cookie, production
authentication should be tested carefully across the frontend and
backend domains. The browser must be allowed to send credentials for
requests that use the refresh-token cookie.

## Important notes

-   `NEXT_PUBLIC_API_BASE_URL` is exposed to the browser, so it must
    contain only the API base URL and not private secrets.
-   Do not place Gemini, VirusTotal, Google Safe Browsing, database,
    JWT, or other backend secrets in the frontend environment variables.
-   Those provider credentials belong in the backend environment.
-   The frontend does not directly connect to PostgreSQL.
-   The frontend does not directly call Gemini, Google Safe Browsing, or
    VirusTotal.
-   Admin authorization is enforced by the backend.
-   Keep `.env.local` out of GitHub.

## Build status

The frontend currently contains the landing page, authentication pages,
user dashboard components, admin dashboard components, scanning
interfaces, history-related services, and API service layers required to
communicate with the RiskRadar backend.


