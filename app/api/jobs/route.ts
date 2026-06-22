import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobApplicationStatusEvents, jobApplications } from "@/db/schema";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/status";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const apiToken = process.env.API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { ok: false, error: "API token is not configured on the server." },
        { status: 500, headers: corsHeaders() },
      );
    }

    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey !== apiToken) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Invalid or missing API key." },
        { status: 401, headers: corsHeaders() },
      );
    }

    const body = await request.json();

    const {
      title,
      companyName,
      description = "",
      location = "",
      salaryRange = "",
      note = "",
      status = "SAVED",
      jobUrl = null,
    } = body;

    // Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ ok: false, error: "Job title is required." }, { status: 400, headers: corsHeaders() });
    }

    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return NextResponse.json(
        { ok: false, error: "Company name is required." },
        { status: 400, headers: corsHeaders() },
      );
    }

    if (jobUrl && typeof jobUrl === "string" && !jobUrl.startsWith("http://") && !jobUrl.startsWith("https://")) {
      return NextResponse.json(
        { ok: false, error: "Job URL must start with http:// or https://." },
        { status: 400, headers: corsHeaders() },
      );
    }

    const parsedStatus = APPLICATION_STATUSES.includes(status as ApplicationStatus)
      ? (status as ApplicationStatus)
      : "SAVED";

    const newJob = await db.transaction(async (tx) => {
      const [createdJob] = await tx
        .insert(jobApplications)
        .values({
          title: title.trim(),
          companyName: companyName.trim(),
          description: typeof description === "string" ? description.trim() : "",
          location: typeof location === "string" ? location.trim() : "",
          salaryRange: typeof salaryRange === "string" ? salaryRange.trim() : "",
          note: typeof note === "string" ? note.trim() : "",
          status: parsedStatus,
          jobUrl: typeof jobUrl === "string" ? jobUrl.trim() : null,
        })
        .returning();

      await tx.insert(jobApplicationStatusEvents).values({
        jobApplicationId: createdJob.id,
        fromStatus: null,
        toStatus: parsedStatus,
      });

      return createdJob;
    });

    return NextResponse.json({ ok: true, job: newJob }, { status: 200, headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
