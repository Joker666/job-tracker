<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


Build a minimal job tracker app in my existing Next.js project named `job-tracker`.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL using Neon
- Drizzle ORM
- Cloudflare R2 for PDF resume uploads
- Server Actions or API routes

Core features:
1. Job applications CRUD
   - title
   - company name
   - description
   - location
   - salary range
   - note
   - status
   - uploaded resume PDF

2. Kanban board
   - Main page should show a kanban board.
   - Columns:
     - Saved
     - Applied
     - Interviewing
     - Offer
     - Rejected
   - Job cards should be draggable between columns.
   - Moving a card should update the job status in Neon Postgres.

3. Resume tracking
   - Each job application can have one uploaded PDF resume.
   - Use Cloudflare R2 to store uploaded resume files.
   - Validate PDF uploads only.
   - Store these fields directly on the job record:
     - resumeUrl
     - resumeName
     - resumeUploadedAt
   - Show a link to view/download the submitted resume from each job card or job detail page.

Database:
- Use Neon Postgres.
- Use Drizzle.
- Create a `JobApplication` model with:
  - id
  - title
  - companyName
  - description
  - location
  - salaryRange
  - note
  - status
  - resumeUrl
  - resumeName
  - resumeUploadedAt
  - createdAt
  - updatedAt
- Use an enum for application status:
  - SAVED
  - APPLIED
  - INTERVIEWING
  - OFFER
  - REJECTED

UI:
- Keep the design minimal and clean.
- Main route should be the kanban board.
- Add a button to create a new job application.
- Add edit and delete actions.
- Use a modal or separate page for the job form.
- Include the resume upload field in the form.
- Show company, title, location, salary range, status, note preview, and resume link on cards.

Implementation expectations:
- Provide all required code changes.
- Include Drizzle schema and migration instructions.
- Include Cloudflare R2 upload implementation.
- Include `.env.example` with:
  - DATABASE_URL
  - R2_ACCOUNT_ID
  - R2_ACCESS_KEY_ID
  - R2_SECRET_ACCESS_KEY
  - R2_BUCKET_NAME
  - R2_PUBLIC_URL
- Include setup instructions for:
  - Neon database
  - Drizzle migration
  - Cloudflare R2 bucket
  - Running locally
- No authentication needed.
- Keep the app intentionally simple and production-friendly.


Implement the job-tracker app phase by phase. After each phase, make sure the app still runs and the deliverables are complete.

Phase 1: Project setup
- Install Drizzle ORM, postgres driver, and drizzle-kit.
- Add database client setup.
- Add `.env.example`.

Deliverables:
- `db/index.ts`
- `drizzle.config.ts`
- `.env.example`

Phase 2: Database schema
- Create `job_applications` table.
- Add status enum:
  - SAVED
  - APPLIED
  - INTERVIEWING
  - OFFER
  - REJECTED
- Store resume fields directly on the job record:
  - resume_url
  - resume_name
  - resume_uploaded_at

Deliverables:
- `db/schema.ts`
- Generated Drizzle migration
- Migration runs against Neon Postgres

Phase 3: Job CRUD
- Create server actions or API routes using Drizzle.
- Support create, read, update, delete.
- Validate required fields:
  - title
  - companyName
  - status

Deliverables:
- Working create/edit/delete flows
- Jobs loaded from Neon using Drizzle

Phase 4: Resume upload with Cloudflare R2
- Configure R2 using S3-compatible SDK.
- Validate PDF files only.
- Upload PDF to R2.
- Save `resumeUrl`, `resumeName`, `resumeUploadedAt` on the job record.

Deliverables:
- R2 upload utility
- PDF upload works
- Resume link shown in UI
- Non-PDF uploads rejected

Phase 5: Job form UI
- Add create/edit form with:
  - title
  - company name
  - description
  - location
  - salary range
  - note
  - status
  - PDF resume upload

Deliverables:
- Create form
- Edit form
- End-to-end save flow

Phase 6: Kanban board
- Add columns:
  - Saved
  - Applied
  - Interviewing
  - Offer
  - Rejected
- Group cards by status.
- Drag cards between columns.
- Persist status updates with Drizzle.

Deliverables:
- Working kanban board
- Drag-and-drop status updates
- Status persists in Neon

Phase 7: Polish
- Add loading/error states.
- Add empty states.
- Clean up UI.
- Add README setup steps.

Deliverables:
- `README.md`
- Clean minimal UI
- No obvious TypeScript/runtime errors

Final acceptance criteria:
- Next.js app uses Drizzle ORM.
- Jobs are stored in Neon Postgres.
- Resume PDFs are stored in Cloudflare R2.
- Each job tracks the exact submitted resume.
- Kanban status changes persist.
- No authentication required.
