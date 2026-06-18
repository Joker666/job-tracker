"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { jobApplications, jobInterviews } from "@/db/schema";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/status";
import { uploadResumePdf } from "@/lib/r2";

type ActionResult = {
  ok: boolean;
  error?: string;
};

export async function verifyAppAccess(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const expectedUsername = process.env.APP_ACCESS_USERNAME;
  const expectedPassword = process.env.APP_ACCESS_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return {
      ok: false,
      error: "Access credentials are not configured.",
    };
  }

  const username = getString(formData, "username");
  const password = getString(formData, "password");

  if (username !== expectedUsername || password !== expectedPassword) {
    return {
      ok: false,
      error: "Invalid username or password.",
    };
  }

  return { ok: true };
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);

  return value.length > 0 ? value : "";
}

function parseStatus(value: FormDataEntryValue | null): ApplicationStatus {
  if (
    typeof value === "string" &&
    APPLICATION_STATUSES.includes(value as ApplicationStatus)
  ) {
    return value as ApplicationStatus;
  }

  return "SAVED";
}

function validateRequired(input: {
  title: string;
  companyName: string;
  status: ApplicationStatus;
  jobUrl: string | null;
}) {
  if (!input.title) {
    return "Title is required.";
  }

  if (!input.companyName) {
    return "Company name is required.";
  }

  if (!APPLICATION_STATUSES.includes(input.status)) {
    return "Status is required.";
  }

  if (
    input.jobUrl &&
    !input.jobUrl.startsWith("http://") &&
    !input.jobUrl.startsWith("https://")
  ) {
    return "Job URL must start with http:// or https://.";
  }

  return null;
}

function readJobForm(formData: FormData) {
  const title = getString(formData, "title");
  const companyName = getString(formData, "companyName");
  const status = parseStatus(formData.get("status"));

  return {
    title,
    companyName,
    description: getOptionalString(formData, "description"),
    jobUrl: getOptionalString(formData, "jobUrl") || null,
    location: getOptionalString(formData, "location"),
    salaryRange: getOptionalString(formData, "salaryRange"),
    note: getOptionalString(formData, "note"),
    status,
  };
}

function readResumeFile(formData: FormData) {
  const file = formData.get("resume");

  return file instanceof File ? file : null;
}

function readInterviews(formData: FormData) {
  const dates = formData.getAll("interviewDate");
  const types = formData.getAll("interviewType");
  const interviews: Array<{
    interviewDate: Date;
    interviewType: string;
  }> = [];

  for (let index = 0; index < Math.max(dates.length, types.length); index += 1) {
    const dateValue = dates[index];
    const typeValue = types[index];
    const rawDate = typeof dateValue === "string" ? dateValue.trim() : "";
    const interviewType =
      typeof typeValue === "string" ? typeValue.trim() : "";

    if (!rawDate && !interviewType) {
      continue;
    }

    if (!rawDate || !interviewType) {
      throw new Error("Each interview needs both a date and a type.");
    }

    const interviewDate = new Date(rawDate);

    if (Number.isNaN(interviewDate.getTime())) {
      throw new Error("Interview date is invalid.");
    }

    interviews.push({
      interviewDate,
      interviewType,
    });
  }

  return interviews;
}

export async function createJobApplication(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const job = readJobForm(formData);
  const validationError = validateRequired(job);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  let resume;
  let interviews;

  try {
    resume = await uploadResumePdf(readResumeFile(formData));
    interviews = readInterviews(formData);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Save failed.",
    };
  }

  await db.transaction(async (tx) => {
    const [createdJob] = await tx
      .insert(jobApplications)
      .values({
        ...job,
        ...(resume ?? {}),
      })
      .returning({ id: jobApplications.id });

    if (interviews.length > 0) {
      await tx.insert(jobInterviews).values(
        interviews.map((interview) => ({
          ...interview,
          jobApplicationId: createdJob.id,
        })),
      );
    }
  });

  revalidatePath("/");

  return { ok: true };
}

export async function updateJobApplication(
  id: string,
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const job = readJobForm(formData);
  const validationError = validateRequired(job);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  let resume;
  let interviews;

  try {
    resume = await uploadResumePdf(readResumeFile(formData));
    interviews = readInterviews(formData);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Save failed.",
    };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(jobApplications)
      .set({
        ...job,
        ...(resume ?? {}),
        updatedAt: new Date(),
      })
      .where(eq(jobApplications.id, id));

    await tx
      .delete(jobInterviews)
      .where(eq(jobInterviews.jobApplicationId, id));

    if (interviews.length > 0) {
      await tx.insert(jobInterviews).values(
        interviews.map((interview) => ({
          ...interview,
          jobApplicationId: id,
        })),
      );
    }
  });

  revalidatePath("/");

  return { ok: true };
}

export async function deleteJobApplication(id: string) {
  await db.delete(jobApplications).where(eq(jobApplications.id, id));
  revalidatePath("/");
}

export async function updateJobApplicationStatus(
  id: string,
  status: ApplicationStatus,
) {
  if (!APPLICATION_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  await db
    .update(jobApplications)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(jobApplications.id, id));

  revalidatePath("/");

  return { ok: true };
}
