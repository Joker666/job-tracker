import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

type UploadedResume = {
  resumeUrl: string;
  resumeName: string;
  resumeUploadedAt: Date;
};

function getR2Config() {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    R2_PUBLIC_URL,
  } = process.env;

  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET_NAME ||
    !R2_PUBLIC_URL
  ) {
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

export async function uploadResumePdf(file: File | null): Promise<UploadedResume | null> {
  if (!file || file.size === 0) {
    return null;
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
  });

  const safeName = normalizeFilename(file.name || "resume.pdf");
  const key = `resumes/${randomUUID()}-${safeName}`;
  const body = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${safeName}"`,
    }),
  );

  return {
    resumeUrl: `${config.publicUrl}/${key}`,
    resumeName: file.name || safeName,
    resumeUploadedAt: new Date(),
  };
}
