# Setup (Local developement)

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![ClickHouse](https://img.shields.io/badge/ClickHouse-FFCC01?style=for-the-badge&logo=clickhouse&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ 
- npm or yarn package manager

## Database Setup (ClickHouse)

### 1. Start ClickHouse Database

Navigate to the `database` directory and start the ClickHouse container:

```bash
cd data
docker-compose up -d
```

This will start a dockerized ClickHouse instance accessible on the default port.

### 2. Connect to ClickHouse

Connect to the database using the ClickHouse client:

```bash
docker exec -it gwgvg_clickhouse clickhouse-client -u dev -d gwarchivist
```

### 3. Create Database Schema

Once ClickHouse Docker created, create the tables by executing the schema file:

**Bash/Linux/Mac:**
```bash
docker exec -i gwgvg_clickhouse clickhouse-client -u dev -d gwarchivist < database/schema.sql
```

**PowerShell (Windows):**
```powershell
Get-Content database\schema.sql | docker exec -i gwgvg_clickhouse clickhouse-client -u dev -d gwarchivist --multiquery
```

For more information about the database schema, see [database-schema.md](database-schema.md).

## Application Setup (Frontend & Backend)

### 1. Install Dependencies

Navigate to the `app` directory and install the required packages:

```bash
cd app
npm install
```

### 2. Build & Start the Application

You can either build and start in production mode or run in development mode:

**Production Mode:**
```bash
npm run build
npm run start
```

**Development Mode:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Load Sample Data

Once your API is functional, you can load sample match data using the curl commands provided in `data/sample.txt`:

```bash
curl -X POST http://127.0.0.1:3000/api/matchs \
  -H "Content-Type: application/json" \
  -d '{"map_id":...}'
```

Expected response:
```json
{"success":true,"match_id":"1753813824032000","players_inserted":16,"npcs_inserted":0}
```

The `data/sample.txt` file contains 10 sample matches that can be loaded to test the API functionality.

For more detailed information, see the documentation in the `docs/` directory.