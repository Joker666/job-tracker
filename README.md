# Job Tracker

A minimal Next.js App Router job tracker with Drizzle ORM, Neon Postgres, Cloudflare R2 resume uploads, and a draggable kanban board.

## Features

- Job application CRUD for title, company, job URL, description, location, salary range, note, and status.
- Kanban columns for Saved, Applied, Interviewing, Offer, and Rejected.
- Drag-and-drop status updates persisted to Postgres.
- One submitted resume PDF per job, stored in Cloudflare R2.
- Resume metadata stored directly on `job_applications`: `resume_url`, `resume_name`, and `resume_uploaded_at`.
- Multiple interviews per job, each with an interview date and dropdown type.

## Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/job-tracker?sslmode=require"
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""
```

## Neon setup

1. Create a Neon project and database.
2. Copy the pooled or direct connection string.
3. Set `DATABASE_URL` in `.env`.
4. Keep `sslmode=require` in the connection string.

## Drizzle migrations

Generate migrations after schema changes:

```bash
pnpm db:generate
```

Apply migrations to Neon:

```bash
pnpm db:migrate
```

The initial migration creates:

- `application_status` enum with `SAVED`, `APPLIED`, `INTERVIEWING`, `OFFER`, `REJECTED`
- `job_applications` table

The interview tracking migration creates:

- `job_interviews` table
- `job_interviews.job_application_id` foreign key with cascade delete
- `interview_date` and `interview_type` fields for each interview round

The job URL migration adds:

- `job_applications.job_url` for the original job posting link

## Cloudflare R2 setup

1. Create an R2 bucket.
2. Create an R2 API token with object read/write access for the bucket.
3. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`.
4. Configure public access for downloads through a custom domain or public bucket URL.
5. Set `R2_PUBLIC_URL` to that public base URL, without a trailing slash.

Only PDF files are accepted. Uploaded files are stored under `resumes/` and linked from the job card.

## Local development

Install dependencies:

```bash
pnpm install
```

Run migrations:

```bash
pnpm db:migrate
```

Start the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production notes

- There is intentionally no authentication in this version.
- Server Actions validate required fields before writes.
- R2 credentials are only required when a resume is uploaded.
- Dragging a card between kanban columns updates `job_applications.status`.
