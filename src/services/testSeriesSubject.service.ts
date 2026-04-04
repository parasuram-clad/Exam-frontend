import apiClient from "./apiClient";

export interface SubjectAnswer {
  mcq_id: number;
  selected_option: string;
}

export interface SubjectSubmitRequest {
  test_series_attempt_id: number;
  answers: SubjectAnswer[];
  started_at: string;
  submitted_at: string;
}

export interface SubjectSyllabus {
  subject: string;
  topics: string[];
}

export interface SubjectRoadmapEntry {
  series_no: number;
  day: number;
  test_date: string;
  status: "LOCKED" | "UNLOCKED" | "COMPLETED";
  access?: "FREE" | "SUBSCRIBED" | "REQUIRES_SUBSCRIPTION";
  syllabus?: SubjectSyllabus;
  obtained_marks?: number | null;
  total_marks?: number | null;
}

export interface SubjectPlan {
  plan_id: number;
  subject_name: string;
  exam_type: string;
  sub_division: string;
  total_series: number;
  subscribed: boolean;
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
  roadmap: SubjectRoadmapEntry[];
}

export interface SubjectRoadmapResponse {
  access: Array<{
    exam_type: string;
    sub_division: string;
    plan_type: string;
    subject_name: string;
    plan_id: number;
    subscribed: boolean;
  }>;
  plans: SubjectPlan[];
}

export const testSeriesSubjectService = {
  async generatePlan(subjectId: number, year: number, language: string, learnerType: string = "GENERAL") {
    const response = await apiClient.post("/test-series/subject/generate-plan", {
      subject_id: subjectId,
      year,
      language,
      learner_type: learnerType,
    });
    return response.data;
  },

  async getRoadmap(): Promise<SubjectRoadmapResponse> {
    const response = await apiClient.get<SubjectRoadmapResponse>("/test-series/subject/roadmap");
    return response.data;
  },

  async getQuestions(plan_id: number, seriesNo: number) {
    const response = await apiClient.get("/test-series/subject/questions", {
      params: { plan_id, series_no: seriesNo },
    });
    return response.data;
  },

  async submitTest(data: SubjectSubmitRequest) {
    const response = await apiClient.post("/test-series/subject/submit", data);
    return response.data;
  },

  async getResult(plan_id: number, seriesNo: number) {
    const response = await apiClient.get("/test-series/subject/result", {
      params: { plan_id, series_no: seriesNo },
    });
    return response.data;
  },

  async getHistory(plan_id: number) {
    const response = await apiClient.get("/test-series/subject/history", {
      params: { plan_id },
    });
    return response.data;
  },

  async getAvailableSubjects(examType: string, subDivision: string, language: string) {
    const response = await apiClient.get("/test-series/subject/list", {
      params: {
        exam_type: examType,
        sub_division: subDivision,
        language: language,
      },
    });
    return response.data;
  },
};
