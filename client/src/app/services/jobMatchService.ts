import apiClient from "@/lib/axios";

export interface JobMatchResponse {
  message: string;
  data: {
    _id: string;
    user: string;
    resumeText: string;
    jobDescription: string;
    createdAt: string;
    updatedAt: string;
    result: {
      score: number;
      missing_keywords: string[];
      matched_keywords: string[];
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
      verdict_summary: string;
    };
  };
}

/**
 * Match resume with job description
 */
export const matchResumeWithJob = async (formData: FormData): Promise<JobMatchResponse> => {
  const response = await apiClient.post<JobMatchResponse>("/job/match", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
