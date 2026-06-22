import type { ApplicationStatus } from "@/lib/status";

export const ACCESS_STORAGE_KEY = "job-tracker-access-granted";
export const VIEW_MODE_STORAGE_KEY = "job-tracker-view-mode";

export const INTERVIEW_TYPE_OPTIONS = [
  "Recruiter screen",
  "Behavioral",
  "Technical",
  "System design",
  "Take-home",
  "Hiring manager",
  "Final",
];

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const STATUS_COLORS: Record<ApplicationStatus, { bg: string; accentBg: string }> = {
  SAVED: { bg: "bg-[#FFDE4D]", accentBg: "bg-[#FFF9C4]" },
  APPLIED: { bg: "bg-[#38BDF8]", accentBg: "bg-[#E0F7FA]" },
  INTERVIEWING: { bg: "bg-[#C084FC]", accentBg: "bg-[#F3E5F5]" },
  OFFER: { bg: "bg-[#4ADE80]", accentBg: "bg-[#E8F5E9]" },
  REJECTED: { bg: "bg-[#FB7185]", accentBg: "bg-[#FFEBEE]" },
};
