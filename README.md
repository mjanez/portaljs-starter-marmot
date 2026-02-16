# PortalJS Marmot Starter

A modern, production-ready frontend template for [Marmot](https://github.com/marmotdata/marmot) catalogs built with Next.js, React, and Tailwind CSS.

This starter kit provides a beautiful, customizable portal for your data assets, powered by Marmot's high-performance catalog.

## Features

- **Modern Tech Stack**: Next.js, React, Tailwind CSS
- **Unified Search**: Find tables, topics, dashboards, and more
- **Provider Views**: Browse assets by source (Postgres, Kafka, S3, etc.)
- **Glossary**: Business terms and definitions
- **Docker Ready**: Full stack deployment with Docker Compose
- **Responsive**: Mobile-friendly design

## Quick Start

### 1. Requirements

- Docker & Docker Compose
- Node.js 18+ (for local development)

### 2. Run with Docker (Recommended)

The easiest way to get started is using Docker Compose. This spins up Marmot, PostgreSQL, and the PortalJS frontend.

1. **Configure Environment**
   ```bash
   cp .env.example .env
   # No changes needed for default setup
   ```

2. **Start Services**
   ```bash
   docker compose up -d
   ```

3. **Initialize API Key**
   Run the initialization script to create an API key in Marmot and save it to your `.env` file:
   ```bash
   ./scripts/00_init-api-key.sh
   # Restart portal to pick up the key
   docker compose restart portaljs
   ```

4. **Populate Sample Data** (Optional)
   ```bash
   ./scripts/01_setup-sample-data.sh
   ```

5. **Visit the Portal**
   Open http://localhost:3000

> [!TIP]
> **Marmot UI**: http://localhost:8080 (`admin`/`admin`)

### 3. Local Development

If you want to modify the frontend code:

1. **Start Marmot Backend**
   ```bash
   docker compose up -d marmot postgres
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Local Environment**
   Ensure your `.env` has the correct `DMS_API_KEY` (run the init script if you haven't).

4. **Run Dev Server**
   ```bash
   npm run dev
   ```
   
>[!TIP]
> Open http://localhost:3000

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_DMS` | Marmot API URL | `http://localhost:8080` |
| `DMS_API_KEY` | API Key for Marmot | (Required) |
| `NEXT_PUBLIC_THEME_COLOR` | Theme accent color | `#4977AB` |

### Customizing the Theme

Edit `tailwind.config.js` to change colors, fonts, and other design tokens. The `NEXT_PUBLIC_THEME_COLOR` env var controls the primary accent color.

## Project Structure

- `pages/` - Next.js pages
- `components/` - React components
- `lib/` - API clients and helpers
  - `marmot.ts` - Core API fetch wrapper
  - `queries/` - Data fetching logic (Assets, Providers, Glossary)
- `schemas/` - TypeScript interfaces
- `scripts/` - Setup and utility scripts

## Documentation

- [Marmot Documentation](https://marmotdata.io/docs)
- [PortalJS Documentation](https://portaljs.org)

## License

MIT
