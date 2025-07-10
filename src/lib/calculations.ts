// Utility functions for calculating metrics dynamically

export interface CallData {
  id: string;
  score: number;
  duration: number; // in seconds
  date: string;
  agentId: string;
  hasIssues?: boolean;
}

export interface AgentData {
  id: string;
  name: string;
  calls: CallData[];
}

export interface ListData {
  id: string;
  name: string;
  agents: AgentData[];
  dateRange: string;
}

export interface CompanyData {
  lists: ListData[];
}

export interface Criterion {
  name: string;
  score: number;
  color?: string;
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  GOOD: 7.0,
  BAD: 4.0,
  ATTENTION: 4.0
};

// Calculate average score from an array of scores
export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

// Calculate performance distribution (Good/Neutral/Bad percentages)
export function calculatePerformanceDistribution(scores: number[]) {
  if (scores.length === 0) {
    return { good: 0, neutral: 0, bad: 0, goodCount: 0, neutralCount: 0, badCount: 0 };
  }

  const goodCount = scores.filter(score => score >= PERFORMANCE_THRESHOLDS.GOOD).length;
  const badCount = scores.filter(score => score < PERFORMANCE_THRESHOLDS.BAD).length;
  const neutralCount = scores.length - goodCount - badCount;

  const total = scores.length;
  
  return {
    good: Math.round((goodCount / total) * 100),
    neutral: Math.round((neutralCount / total) * 100),
    bad: Math.round((badCount / total) * 100),
    goodCount,
    neutralCount,
    badCount
  };
}

// Calculate agent metrics
export function calculateAgentMetrics(agent: AgentData) {
  const scores = agent.calls.map(call => call.score);
  const average = calculateAverage(scores);
  const performance = calculatePerformanceDistribution(scores);
  const hasAttention = scores.some(score => score < PERFORMANCE_THRESHOLDS.ATTENTION);
  const totalCalls = agent.calls.length;
  const totalDuration = agent.calls.reduce((acc, call) => acc + call.duration, 0);

  return {
    id: agent.id,
    name: agent.name,
    average: average.toFixed(1),
    performance,
    totalFeedbacks: totalCalls,
    hasAttention,
    totalDuration,
    averageDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
    calls: agent.calls
  };
}

// Calculate list metrics
export function calculateListMetrics(list: ListData) {
  const allCalls = list.agents.flatMap(agent => agent.calls);
  const allScores = allCalls.map(call => call.score);
  
  const average = calculateAverage(allScores);
  const performance = calculatePerformanceDistribution(allScores);
  const totalCalls = allCalls.length;
  const callsInAttention = allCalls.filter(call => call.score < PERFORMANCE_THRESHOLDS.ATTENTION).length;
  const hasAttention = callsInAttention > 0;

  // Calculate agent metrics for ranking
  const agentsWithMetrics = list.agents.map(agent => calculateAgentMetrics(agent));
  
  // Sort agents by average score (descending)
  agentsWithMetrics.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));

  return {
    id: list.id,
    name: list.name,
    dateRange: list.dateRange,
    average: average.toFixed(1),
    performance,
    totalCalls,
    callsInAttention,
    hasAttention,
    agents: agentsWithMetrics
  };
}

// Calculate company-wide metrics
export function calculateCompanyMetrics(company: CompanyData) {
  const allLists = company.lists.map(list => calculateListMetrics(list));
  const allScores = company.lists.flatMap(list => 
    list.agents.flatMap(agent => agent.calls.map(call => call.score))
  );

  const companyAverage = calculateAverage(allScores);
  const companyPerformance = calculatePerformanceDistribution(allScores);
  const totalCallsInAttention = allLists.reduce((acc, list) => acc + list.callsInAttention, 0);

  // Calculate list averages for dashboard
  const listAverages = allLists.map(list => parseFloat(list.average));
  const listsAverage = calculateAverage(listAverages);

  return {
    companyAverage: companyAverage.toFixed(1),
    listsAverage: listsAverage.toFixed(1),
    performance: companyPerformance,
    totalCallsInAttention,
    lists: allLists.map(list => ({
      id: list.id,
      name: list.name,
      average: list.average,
      performance: list.performance,
      totalCalls: list.totalCalls,
      hasAttention: list.hasAttention
    }))
  };
}

// Calculate criteria scores (for radar chart) - Updated with more realistic criteria
export function calculateCriteriaScores(calls: CallData[]): Criterion[] {
  if (calls.length === 0) return [];
  
  const avgScore = calculateAverage(calls.map(call => call.score));
  
  // Define criteria with realistic names
  const criteriaNames = [
    'Simpatia',
    'Cordialidade', 
    'Negociação',
    'Tempo',
    'Abordagem',
    'Finalização',
    'Formalidade'
  ];
  
  // Generate realistic criteria scores with some variation
  const baseScore = avgScore;
  const variation = 2; // +/- variation range
  
  return criteriaNames.map(name => {
    const score = Math.max(1, Math.min(10, baseScore + (Math.random() - 0.5) * variation));
    return {
      name,
      score: Math.round(score * 10) / 10
    };
  });
}

// Calculate agent-specific criteria scores
export function calculateAgentCriteriaScores(agent: AgentData): Criterion[] {
  return calculateCriteriaScores(agent.calls);
}

// Format duration from seconds to "Xmin Ys" format
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}min ${remainingSeconds}s`;
}

// Format date string
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' às');
}

// Generate score color based on performance thresholds
export function getScoreColor(score: number): string {
  if (score >= 7) return 'text-[#059669]'; // Verde para notas 7.0-10.0
  if (score >= 4) return 'text-[#d97706]'; // Amarelo para notas 4.0-6.9
  return 'text-[#dc2626]'; // Vermelho para notas 0.0-3.9
}

// Generate random realistic call data
export function generateCallData(agentId: string, count: number, baseScore: number = 5): CallData[] {
  const calls: CallData[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Generate score with some variation around base score
    const variation = Math.random() * 4 - 2; // -2 to +2 variation
    const score = Math.max(0, Math.min(10, baseScore + variation));
    
    // Generate random duration between 2-15 minutes
    const duration = Math.floor(Math.random() * (15 * 60 - 2 * 60) + 2 * 60);
    
    // Generate date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const callDate = new Date(now);
    callDate.setDate(callDate.getDate() - daysAgo);
    callDate.setHours(Math.floor(Math.random() * 8) + 9); // 9 AM to 5 PM
    callDate.setMinutes(Math.floor(Math.random() * 60));
    
    calls.push({
      id: `call_${agentId}_${i + 1}`,
      score: Math.round(score * 10) / 10,
      duration,
      date: callDate.toISOString(),
      agentId,
      hasIssues: score < PERFORMANCE_THRESHOLDS.ATTENTION
    });
  }
  
  return calls.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
