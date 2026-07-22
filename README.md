# <img src="public/globe.svg" width="36" height="36" align="center" /> Lumina-HQ

> **Shedding Light on Organizational Knowledge** — A secure, multi-tenant central command center for ingestion, semantic analysis, and structured extraction of organization-wide documents.

<br />

<p align="center">
  <img src="public/lumina_hq_banner.png" alt="Lumina-HQ Banner" width="100%" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react" alt="React" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/Prisma-7.5.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/Gemini_AI-Google-4285F4?style=for-the-badge&logo=google" alt="Gemini AI" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" /></a>
</p>

---

## 🌟 Introduction

**Lumina-HQ** is an agentic workspace designed for modern, forward-thinking teams. It enables organizations to upload complex documents (PDFs, Markdown, text files) and run powerful AI-driven analysis workflows. With **enterprise-grade tenant isolation**, Lumina-HQ ensures that organizational knowledge remains strictly private, accessible only to authorized members, and is processed securely using top-tier models.

---

## 📸 Product Mockup

Below is a preview of the **Lumina-HQ** workspace dashboard, featuring document uploads, processed document summaries, tone & sentiment analysis, and keyword tag clouds.

<p align="center">
  <img src="public/lumina_hq_mockup.png" alt="Lumina-HQ Dashboard Mockup" width="100%" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
</p>

---

## 🏗️ System Architecture

Lumina-HQ is built on a modern stack leveraging **Next.js (App Router)** for frontend and backend logic, **Clerk** for multi-tenant user authentication, **Vercel Blob** for file storage, **Prisma & PostgreSQL** for persistent metadata storage, and the **Google Gen AI SDK** for driving agentic analysis.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef storage fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;
    classDef security fill:#faf5ff,stroke:#7c3aed,stroke-width:2px;
    classDef ai fill:#fff7ed,stroke:#ea580c,stroke-width:2px;
    classDef insights fill:#fdf2f8,stroke:#db2777,stroke-width:2px;

    %% Ingestion Node
    subgraph Ingestion ["1. Data Ingestion Flow"]
        U[User / Team Member] -->|Uploads PDF/MD/TXT| C[Next.js Client Actions]:::client
        C -->|File Content| VB[(Vercel Blob Storage)]:::storage
        C -->|Parse Text| PP[PDF Parser / Extractor]:::client
    end

    %% Storage & Security Node
    subgraph Security ["2. Storage & Security Layer"]
        PP -->|Parsed Text & Metadata| P[Prisma Client]:::security
        P -->|Save Record| DB[(PostgreSQL Database)]:::storage
        
        subgraph Tenancy ["Multi-Tenant Isolation"]
            Auth[Clerk Auth Guard]:::security -->|Enforces| Org[Organization Domain Isolation]:::security
            Org -->|Restricts Access| DB
        end
    end

    %% Intelligence Node
    subgraph Intelligence ["3. AI Intelligence Engine"]
        P -->|Submit Extracted Content| GAI[Google Gen AI Client]:::ai
        GAI -->|API Call| Gemini[Gemini LLM Models]:::ai
    end

    %% Workflows Node
    subgraph Workflows ["4. Intelligent Action Workflows"]
        Gemini -->|Synthesis| Sy[Executive Briefs]:::insights
        Gemini -->|Interrogation| Qa[Fact-Cited Q&A]:::insights
        Gemini -->|Tone & Intent| Se[Sentiment Mapping]:::insights
        Gemini -->|Entity Map| En[Legal & Org Entities]:::insights
        Gemini -->|Structured Data| Ex[JSON Schema Export]:::insights
    end
```

---

## ⚡ Core Features & AI Workflows

Lumina-HQ offers five specialized AI-driven analysis models to extract value and intelligence from your static files:

| Workflow | Action Name | Description | Icon |
| :--- | :--- | :--- | :---: |
| **Synthesis** | `summary` | Distill lengthy, complex documents into clear, high-level executive briefs. | ✨ |
| **Interrogation** | `qa` | Chat directly with your document base and get cited, factual answers. | 💬 |
| **Tone & Intent** | `sentiment` | Detect emotional undertones, risk areas, and communication styles in text. | 📝 |
| **Entity Map** | `entities` | Identify and link key legal entities, figures, dates, and organizations. | 🏷️ |
| **Structured Data** | `extract` | Convert raw, unstructured text files into clean, production-ready JSON schemas. | 📊 |

### 🔒 Enterprise-Grade Security
* **Isolated Tenancy:** Every document belongs strictly to a Clerk Organization ID. Queries are partitioned at the database level.
* **Signed Access:** Vercel Blob file URLs are restricted and time-limited, ensuring no unauthorized public downloads.

---

## 📁 Repository Structure

The codebase is organized logically, following standard Next.js and Prisma architecture conventions:

```bash
lumina-hq/
├── app/                      # Next.js app routes, layouts, and pages
│   ├── (auth)/               # Auth pages (Sign-in / Sign-up) via Clerk
│   ├── (dashboard)/          # Dashboard interface workspace
│   │   ├── [orgSlug]/        # Org-specific documents and team routes
│   │   └── select-org/       # Clerk Organization onboarding selection page
│   ├── api/                  # Backend endpoints (file processing, AI trigger)
│   ├── data/                 # Static data configurations (features, allowed types)
│   └── globals.css           # Global CSS variables & Tailwind directives
├── components/               # Reusable UI components (shadcn/ui elements)
│   └── ui/                   # Primitive layout blocks (buttons, inputs, cards)
├── lib/                      # Core configuration libraries
│   ├── prisma.ts             # Prisma client connection manager
│   └── utils.ts              # Styling merge and common utility functions
├── prisma/                   # Database schema definitions and migrations
│   └── schema.prisma         # Postgres models (User, Org, Doc)
├── public/                   # Static public assets (SVGs, generated banners)
├── package.json              # App scripts and dependencies
└── tsconfig.json             # TypeScript rules configuration
```

---

## 🚀 Getting Started

To spin up Lumina-HQ on your local machine, follow these simple setup steps:

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org) (v18+ recommended)
* PostgreSQL Database (local instance or hosted service like Neon)
* Clerk Developer Account (for auth)
* Google Gemini API Key

### 2. Install Dependencies
Clone the repository and run:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on the following schema:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lumina_hq?schema=public"

# Clerk Authentication (Get these from your Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Google Gemini API
GEMINI_API_KEY="AIzaSy..."

# Vercel Blob Storage (For document uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 4. Database Setup & Migrations
Run Prisma migrations to generate the Postgres tables and construct the schema:
```bash
npx prisma db push
```

### 5. Start Development Server
Kickstart the local server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience **Lumina-HQ**.

---

## 📄 License
This project is proprietary. All rights reserved. Built with passion for modern document management.
