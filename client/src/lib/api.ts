import { apiRequest } from "./queryClient";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    questionsAvailable: number;
    questionsCompleted?: number;
    referralCode: string;
    abGroup?: string;
  };
  password?: string;
}

export interface QuestionResponse {
  id: string;
  questionText: string;
  category: string;
  difficulty: string;
  tip?: string;
}

export interface SubmitAnswerResponse {
  evaluation: {
    score: number;
    positiveComment: string;
    improvementComment: string;
    structureScore: number;
    contentScore: number;
    communicationScore: number;
  };
  questionsRemaining: number;
}

export const authApi = {
  register: async (email: string, referralCode?: string): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/register", { email, referralCode });
    return response.json();
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    return response.json();
  },
};

export const questionApi = {
  getRandom: async (excludeIds: string[] = []): Promise<QuestionResponse> => {
    const excludeParam = excludeIds.length > 0 ? `?exclude=${excludeIds.join(',')}` : '';
    const response = await apiRequest("GET", `/api/questions/random${excludeParam}`);
    return response.json();
  },

  submit: async (userId: string, questionId: string, answer: string): Promise<SubmitAnswerResponse> => {
    const response = await apiRequest("POST", "/api/questions/submit", { userId, questionId, answer });
    return response.json();
  },
};

export const userApi = {
  getProgress: async (userId: string) => {
    const response = await apiRequest("GET", `/api/user/${userId}/progress`);
    return response.json();
  },

  getAnswers: async (userId: string) => {
    const response = await apiRequest("GET", `/api/user/${userId}/answers`);
    return response.json();
  },

  getReferrals: async (userId: string) => {
    const response = await apiRequest("GET", `/api/user/${userId}/referrals`);
    return response.json();
  },
};

export const marketingApi = {
  getConfig: async (abGroup: string) => {
    const response = await apiRequest("GET", `/api/marketing/${abGroup}`);
    return response.json();
  },
};
