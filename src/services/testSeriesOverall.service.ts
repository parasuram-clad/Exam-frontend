import apiClient from "./apiClient";

export interface Answer {
  mcq_id: number;
  selected_option: string;
}

export interface SubmitRequest {
  test_series_attempt_id: number;
  answers: Answer[];
  started_at: string;
  submitted_at: string;
}

export interface GeneratePlanRequest {
  exam_type: string;
  sub_division: string;
  year: number;
  language: string;
  learner_type: string;
}

export interface RoadmapEntry {
  series_no: number;
  day: number;
  test_date: string;
  status: "LOCKED" | "UNLOCKED" | "COMPLETED";
  access: "FREE" | "SUBSCRIBED" | "REQUIRES_SUBSCRIPTION";
  obtained_marks: number | null;
  total_marks: number | null;
  syllabus: any[];
}

export interface OverallRoadmapResponse {
  user_id: number;
  total_plans: number;
  plans: Array<{
    overall_plan_id: number;
    exam_type: string;
    sub_division: string;
    year: number;
    language: string;
    start_date: string;
    total_series: number;
    roadmap: RoadmapEntry[];
    test_details: {
      total_questions: number;
      total_marks: number;
      duration_hours: number;
    };
  }>;
}

export const testSeriesOverallService = {
  async generatePlan(data: GeneratePlanRequest) {
    const response = await apiClient.post("/test-series/overall/generate-plan", data);
    return response.data;
  },

  async getRoadmap(): Promise<OverallRoadmapResponse> {
    const response = await apiClient.get<OverallRoadmapResponse>("/test-series/overall/roadmap");
    return response.data;
  },

  async getQuestions(series_no: number, overall_plan_id: number) {
    const response = await apiClient.get("/test-series/overall/questions", {
      params: { series_no, overall_plan_id },
    });
    return response.data;
  },

  async submitTest(data: SubmitRequest) {
    const response = await apiClient.post("/test-series/overall/submit", data);
    return response.data;
  },

  async getResult(series_no: number, overall_plan_id: number) {
    const response = await apiClient.get("/test-series/overall/result", {
      params: { series_no, overall_plan_id },
    });
    return response.data;
  },

  async getHistory(overall_plan_id: number) {
    const response = await apiClient.get("/test-series/overall/history", {
      params: { overall_plan_id },
    });
    return response.data;
  },
};
