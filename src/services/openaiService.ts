
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ClinicalGuidanceRequest {
  patientConditions: string[];
  currentTasks: string[];
  vitalSigns?: any;
  medications?: string[];
  recentAssessments?: any[];
}

interface ClinicalGuidanceResponse {
  mandatoryTasks: {
    task: string;
    priority: 'high' | 'medium' | 'low';
    timeRequired: number; // minutes
    dueDate: string;
    reasoning: string;
  }[];
  qualityMeasures: {
    measure: string;
    status: 'compliant' | 'non-compliant' | 'due';
    action: string;
    timeRequired: number;
  }[];
  clinicalAlerts: {
    alert: string;
    severity: 'critical' | 'warning' | 'info';
    action: string;
    timeRequired: number;
  }[];
  careGaps: {
    gap: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
    timeRequired: number;
  }[];
}

class OpenAIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async getClinicalGuidance(request: ClinicalGuidanceRequest): Promise<ClinicalGuidanceResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert clinical AI assistant specializing in Chronic Care Management (CCM). 
    Analyze patient data and provide specific guidance on:
    1. Mandatory CCM tasks with time estimates
    2. Quality measures compliance
    3. Clinical alerts based on conditions
    4. Care gaps identification

    Respond in JSON format with specific, actionable recommendations.
    Always include time estimates in minutes for each task/action.
    Focus on  CCM requirements and clinical best practices.`;

    const userPrompt = `Patient Analysis:
    Conditions: ${request.patientConditions.join(', ')}
    Current Tasks: ${request.currentTasks.join(', ')}
    Medications: ${request.medications?.join(', ') || 'Not specified'}
    
    Please provide clinical guidance for this CCM patient.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      try {
        return JSON.parse(content);
      } catch {
        // Fallback response if JSON parsing fails
        return this.generateFallbackGuidance(request);
      }
    } catch (error) {
      console.error('OpenAI service error:', error);
      return this.generateFallbackGuidance(request);
    }
  }

  private generateFallbackGuidance(request: ClinicalGuidanceRequest): ClinicalGuidanceResponse {
    const mandatoryTasks = [
      {
        task: 'Monthly comprehensive care plan review',
        priority: 'high' as const,
        timeRequired: 25,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reasoning: 'Required for CCM billing compliance and patient safety'
      },
      {
        task: 'Medication reconciliation and adherence review',
        priority: 'high' as const,
        timeRequired: 15,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reasoning: 'Critical for preventing medication errors and interactions'
      }
    ];

    const qualityMeasures = [
      {
        measure: 'HEDIS Comprehensive Diabetes Care',
        status: 'due' as const,
        action: 'Schedule HbA1c test and eye exam',
        timeRequired: 10
      }
    ];

    const clinicalAlerts = request.patientConditions.includes('diabetes') ? [
      {
        alert: 'Diabetic patient requires quarterly HbA1c monitoring',
        severity: 'warning' as const,
        action: 'Order HbA1c lab test',
        timeRequired: 5
      }
    ] : [];

    const careGaps = [
      {
        gap: 'Missing annual wellness visit',
        impact: 'medium' as const,
        recommendation: 'Schedule comprehensive wellness examination',
        timeRequired: 45
      }
    ];

    return { mandatoryTasks, qualityMeasures, clinicalAlerts, careGaps };
  }
}

export const openaiService = new OpenAIService();
export type { ClinicalGuidanceRequest, ClinicalGuidanceResponse };
