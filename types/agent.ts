export interface Agent {
  id: string;
  name: string;
  avatar: string;
  model: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  expenses: {
    unavailable: number;
    botcoin: number;
  };
  temperature?: number;
  instructions?: string;
  llmModel: string;
  totalConversations: number;
  // Backend fields mapping
  company_id: number;
  prompt: string;
  enable_functions: boolean;
  talkativeness: number;
  timezone: string;
  settings: any;
  is_robot_question: string;
}
