import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type UploadedResume = {
  resumeUrl: string;
  resumeName: string;
  resumeUploadedAt: Date;
};

const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024;
const R2_UPLOAD_TIMEOUT_MS = 25_000;

function getR2Config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error("Cloudflare R2 environment variables are required.");
  }

  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucketName: R2_BUCKET_NAME,
    publicUrl: R2_PUBLIC_URL.replace(/\/$/, ""),
  };
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function normalizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function getUploadErrorMessage(error: unknown, signal: AbortSignal) {
  if (signal.aborted || (error instanceof Error && error.name === "AbortError")) {
    return "Resume upload timed out. Try again.";
  }

  return error instanceof Error ? error.message : "Resume upload failed.";
}

export async function uploadResumePdf(file: File | null): Promise<UploadedResume | null> {
  if (!file || file.size === 0) {
    return null;
  }

  if (file.size > MAX_RESUME_SIZE_BYTES) {
    throw new Error("Resume PDF must be 10 MB or smaller.");
  }

  if (!isPdf(file)) {
    throw new Error("Only PDF resume uploads are supported.");
  }

  const config = getR2Config();
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    maxAttempts: 2,
  });

  const safeName = normalizeFilename(file.name || "resume.pdf");
  const key = `resumes/${randomUUID()}-${safeName}`;
  const body = Buffer.from(await file.arrayBuffer());
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), R2_UPLOAD_TIMEOUT_MS);

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: body,
        ContentType: "application/pdf",
        ContentDisposition: `inline; filename="${safeName}"`,
      }),
      { abortSignal: abortController.signal },
    );
  } catch (error) {
    throw new Error(getUploadErrorMessage(error, abortController.signal));
  } finally {
    clearTimeout(timeout);
  }

  return {
    resumeUrl: `${config.publicUrl}/${key}`,
    resumeName: file.name || safeName,
    resumeUploadedAt: new Date(),
  };
}
