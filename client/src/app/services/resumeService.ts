import apiClient from "@/lib/axios";
import type { AnalysisResponse } from "@/types/resumeAnalysis";
import type { ResumeTemplateData } from "@/types/User";

/** Upload and analyze resume */
export async function analyzeResumeApi(file: File): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("resume", file);

  const response = await apiClient.post<AnalysisResponse>("/resume/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// AI Rewrite Suggestion
export async function aiSuggestionsAnalyzeResumeApi(file: File): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("resume", file);

  const response = await apiClient.post<AnalysisResponse>("/resume/ai-suggestion", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/** Get resume analysis history */
export async function fetchResumeHistoryApi() {
  const response = await apiClient.get("/resume/history");
  return response.data.reports;
}

/** Delete a specific resume report */
export async function deleteResumeReportApi(reportId: string) {
  const response = await apiClient.delete(`/resume/${reportId}`);
  return response.data;
}

/** Re-analyze a previously uploaded resume */
export async function reanalyzeResumeApi(reportId: string): Promise<AnalysisResponse> {
  const res = await apiClient.put<AnalysisResponse>(`/resume/reanalyze/${reportId}`);
  return res.data;
}

/** Download original AI analysis report as PDF */
export async function downloadReportPdfApi(reportId: string): Promise<void> {
  const response = await apiClient.get(`/resume/download/${reportId}`, { responseType: "blob" });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `resume-report-${reportId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Get a single resume report by ID */
export async function fetchResumeReportByIdApi(reportId: string) {
  const response = await apiClient.get(`/resume/${reportId}`);
  return response.data;
}

/** Download updated resume as PDF after rewrites */
export async function downloadUpdatedResumePdfApi(
  reportId: string,
  appliedRewrites: Record<string, string>,
  theme: string,
  userData: ResumeTemplateData
) {
  const response = await apiClient.post(
    `/resume/download-updated/${reportId}`,
    { appliedRewrites, theme, userData },
    { responseType: "blob" }
  );
  const blob = new Blob([response.data], { type: "application/pdf" });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `updated-resume-${reportId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
