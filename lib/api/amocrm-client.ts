import { apiClient } from './client';
import type {
  AmoCRMIntegration,
  AmoCRMPipelineBinding,
  AmoCRMPipelineBindingCreate,
  AmoCRMPipelineBindingUpdate,
  AmoCRMReferenceData,
  AmoCRMLeadStatusChange,
  AmoCRMLeadAddNote,
} from '@/types/amocrm';

export class AmoCRMClient {
  private baseUrl = '/api/v1/integration/amocrm';

  // Integration management
  async getIntegrationStatus(): Promise<AmoCRMIntegration> {
    const response = await apiClient.backend.get(`${this.baseUrl}/status`);
    return response.data;
  }

  async updateIntegration(
    data: Partial<AmoCRMIntegration>
  ): Promise<AmoCRMIntegration> {
    const response = await apiClient.backend.patch(
      `${this.baseUrl}/update`,
      data
    );
    return response.data;
  }

  async getAuthorizationUrl(): Promise<{
    authorization_url: string;
    state: string;
    instructions: string;
  }> {
    const response = await apiClient.backend.get(
      `${this.baseUrl}/oauth/authorize`
    );
    return response.data;
  }

  // Reference data
  async getReferenceData(): Promise<AmoCRMReferenceData> {
    const response = await apiClient.backend.get(`${this.baseUrl}/reference`);
    return response.data;
  }

  // Pipeline bindings
  async getPipelineBindings(): Promise<AmoCRMPipelineBinding[]> {
    const response = await apiClient.backend.get(`${this.baseUrl}/bindings`);
    return response.data;
  }

  async createPipelineBinding(
    data: AmoCRMPipelineBindingCreate
  ): Promise<AmoCRMPipelineBinding> {
    const response = await apiClient.backend.post(
      `${this.baseUrl}/bindings`,
      data
    );
    return response.data;
  }

  async updatePipelineBinding(
    id: number,
    data: AmoCRMPipelineBindingUpdate
  ): Promise<AmoCRMPipelineBinding> {
    const response = await apiClient.backend.patch(
      `${this.baseUrl}/bindings/${id}`,
      data
    );
    return response.data;
  }

  async deletePipelineBinding(id: number): Promise<void> {
    await apiClient.backend.delete(`${this.baseUrl}/bindings/${id}`);
  }

  // Lead actions
  async changeLeadStatus(
    data: AmoCRMLeadStatusChange
  ): Promise<{ status: string }> {
    const response = await apiClient.backend.post(
      `${this.baseUrl}/leads/status`,
      data
    );
    return response.data;
  }

  async addLeadNote(data: AmoCRMLeadAddNote): Promise<{ status: string }> {
    const response = await apiClient.backend.post(
      `${this.baseUrl}/leads/note`,
      data
    );
    return response.data;
  }
}

export const amocrmClient = new AmoCRMClient();
