// AmoCRM Integration Types
export interface AmoCRMIntegration {
  id: number;
  company_id: number;
  is_active: boolean;
  base_domain?: string;
  sync_enabled: boolean;
  neurox_mode_enabled: boolean;
  amocrm_mode_enabled: boolean;
  auto_create_lead: boolean;
  auto_create_contact: boolean;
  auto_create_task: boolean;
  field_mappings: Record<string, any>;
  default_pipeline_id?: number;
  default_status_id?: number;
  default_responsible_user_id?: number;
  webhook_url?: string;
  subscribed_events: string[];
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
  is_authenticated: boolean;
  token_expires_at?: string;
  token_status: 'not_authenticated' | 'expired' | 'expiring_soon' | 'valid';
}

export interface AmoCRMPipeline {
  id: number;
  name: string;
  sort: number;
  is_main: boolean;
  is_unsorted_on: boolean;
  is_archive: boolean;
  account_id: number;
  statuses: AmoCRMStatus[];
}

export interface AmoCRMStatus {
  id: number;
  name: string;
  sort: number;
  color: string;
  is_editable: boolean;
}

export interface AmoCRMUser {
  id: number;
  name: string;
  email: string;
  lang?: string;
  rights: Record<string, any>;
}

export interface AmoCRMPipelineBinding {
  id: number;
  integration_id: number;
  pipeline_id: number;
  pipeline_name?: string;
  responsible_user_id?: number;
  allowed_status_ids: number[];
  service_bot_id: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AmoCRMPipelineBindingCreate {
  pipeline_id: number;
  pipeline_name?: string;
  responsible_user_id?: number;
  allowed_status_ids: number[];
  service_bot_id: number;
}

export interface AmoCRMPipelineBindingUpdate {
  responsible_user_id?: number;
  allowed_status_ids?: number[];
  service_bot_id?: number;
  active?: boolean;
}

export interface AmoCRMReferenceData {
  pipelines: AmoCRMPipeline[];
  users: AmoCRMUser[];
}

export interface AmoCRMLeadStatusChange {
  lead_id: number;
  status_id: number;
}

export interface AmoCRMLeadAddNote {
  lead_id: number;
  text: string;
}

export interface ServiceBot {
  id: number;
  name: string;
  prompt: string;
  talkativeness: number;
  temperature: number;
  timezone: string;
  is_robot_question: string;
  llm_model: string;
  is_deleted?: boolean;
  settings?: any;
  avatar?: string;
}
