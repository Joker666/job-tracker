"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/status";
import { uploadResumePdf } from "@/lib/r2";

type ActionResult = {
  ok: boolean;
  error?: string;
};

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

  try {
    resume = await uploadResumePdf(readResumeFile(formData));
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Resume upload failed.",
    };
  }

  await db.insert(jobApplications).values({
    ...job,
    ...(resume ?? {}),
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

  try {
    resume = await uploadResumePdf(readResumeFile(formData));
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Resume upload failed.",
    };
  }

  await db
    .update(jobApplications)
    .set({
      ...job,
      ...(resume ?? {}),
      updatedAt: new Date(),
    })
    .where(eq(jobApplications.id, id));

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
