export interface Call {
  id: string;
  filename: string;
  phone_number: string;
  duration_seconds?: number;
  audio_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
  analysis?: CallAnalysis;
  created_at: string;
  updated_at: string;
  company_id: string;
  agent_id?: string;
}

export interface CallAnalysis {
  id: string;
  call_id: string;
  overall_score: number;
  summary?: string;
  highlights?: string;
  improvements?: string;
  criteria_scores: Record<string, number>;
  sub_criteria_scores: Record<string, SubCriteriaScore>;
  transcription?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  key_phrases?: string[];
  created_at: string;
  updated_at: string;
}

export interface SubCriteriaScore {
  score: number;
  feedback?: string;
  keywords_found?: string[];
  explanation?: string;
}

export interface CallFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: Call['status'];
  minScore?: number;
  maxScore?: number;
  agent_id?: string;
  phone_number?: string;
}

export interface CallListResponse {
  calls: Call[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CallUpload {
  file: File;
  metadata: Record<string, any>;
  phone_number: string;
}

export interface BatchAnalysisJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_calls: number;
  processed_calls: number;
  failed_calls: number;
  progress: number;
  created_at: string;
  completed_at?: string;
  webhook_url?: string;
  criteria_id: string;
  company_id: string;
}

export interface CallMetadata {
  name?: string;
  email?: string;
  company?: string;
  department?: string;
  campaign?: string;
  agent?: string;
  priority?: string;
  call_type?: string;
  [key: string]: any;
} 

 
 