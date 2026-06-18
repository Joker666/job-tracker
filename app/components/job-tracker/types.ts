import type { ApplicationStatus } from "@/lib/status";

export type ActionState = {
  ok: boolean;
  error?: string;
};

export type JobInterviewView = {
  id: string;
  interviewDate: string;
  interviewType: string;
};

export type JobApplicationView = {
  id: string;
  title: string;
  companyName: string;
  description: string;
  jobUrl: string | null;
  location: string;
  salaryRange: string;
  note: string;
  status: ApplicationStatus;
  resumeUrl: string | null;
  resumeName: string | null;
  resumeUploadedAt: string | null;
  createdAt: string;
  updatedAt: string;
  interviews: JobInterviewView[];
};

export type TrackerProps = {
  jobs: JobApplicationView[];
};

export type FormMode = { type: "create"; job?: never } | { type: "edit"; job: JobApplicationView };
