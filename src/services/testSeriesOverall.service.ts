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

export interface OverallPlan {
  plan_id: number;
  exam_type: string;
  sub_division: string;
  year: number;
  language: string;
  start_date: string;
  total_days: number;
  total_series: number;
  plan_version: number;
  test_details: {
    total_questions: number;
    total_marks: number;
    duration_hours: number;
    marking_scheme: {
      correct: number;
      incorrect: number;
      unattempted: number;
    };
  };
  roadmap: RoadmapEntry[];
}

export interface OverallRoadmapResponse {
  access: Array<{
    exam_type: string;
    sub_division: string;
    plan_type: string;
    plan_id: number;
    subscribed: boolean;
  }>;
  plans: OverallPlan[];
}

export const testSeriesOverallService = {
  async generatePlan(data: GeneratePlanRequest) {
    const response = await apiClient.post("/test-series/overall/generate-plan", data);
    return response.data;
  },

  async getRoadmap(planId?: number): Promise<OverallRoadmapResponse> {
    const response = await apiClient.get<OverallRoadmapResponse>("/test-series/overall/roadmap", {
      params: { plan_id: planId }
    });
    return response.data;
  },

  async getQuestions(series_no: number, plan_id: number) {
    const response = await apiClient.get("/test-series/overall/questions", {
      params: { series_no, plan_id },
    });
    return response.data;
  },

  async submitTest(data: SubmitRequest) {
    const response = await apiClient.post("/test-series/overall/submit", data);
    return response.data;
  },

  async getResult(series_no: number, plan_id: number) {
    const response = await apiClient.get("/test-series/overall/result", {
      params: { series_no, plan_id },
    });
    return response.data;
  },

  async getHistory(plan_id: number) {
    const response = await apiClient.get("/test-series/overall/history", {
      params: { plan_id },
    });
    return response.data;
  },
};
