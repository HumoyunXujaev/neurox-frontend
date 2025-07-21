import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './config';
import { tokenManager } from '../auth/token-manager';
import { toast } from 'sonner';

interface ApiError {
  error?: string;
  message?: string;
  detail?: string;
  status_code?: number;
}

class ApiClient {
  private authClient: AxiosInstance;
  private backendClient: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    // Auth Service Client
    this.authClient = axios.create({
      baseURL: API_CONFIG.AUTH_SERVICE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Backend Service Client
    this.backendClient = axios.create({
      baseURL: API_CONFIG.BACKEND_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for backend client
    this.backendClient.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor for backend client
    this.backendClient.interceptors.response.use(
      (response: any) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.backendClient(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = tokenManager.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await this.authClient.post(
              API_ENDPOINTS.auth.refresh,
              {
                refresh_token: refreshToken,
              }
            );

            const { access_token, refresh_token } = response.data;
            tokenManager.setTokens(access_token, refresh_token);

            this.refreshSubscribers.forEach((callback) =>
              callback(access_token)
            );
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.backendClient(originalRequest);
          } catch (refreshError) {
            tokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        if (error.response?.data) {
          const errorMessage =
            error.response.data.detail ||
            error.response.data.message ||
            error.response.data.error ||
            'Произошла ошибка';

          if (error.response.status >= 500) {
            toast.error('Ошибка сервера', {
              description: errorMessage,
            });
          } else if (error.response.status >= 400) {
            toast.error(errorMessage);
          }
        } else if (error.request) {
          toast.error('Ошибка сети', {
            description: 'Проверьте подключение к интернету',
          });
        }

        return Promise.reject(error);
      }
    );

    // Auth client response interceptor
    this.authClient.interceptors.response.use(
      (response: any) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.data) {
          const errorMessage =
            error.response.data.detail ||
            error.response.data.message ||
            error.response.data.error ||
            'Ошибка авторизации';

          toast.error(errorMessage);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  get auth() {
    return {
      register: (data: RegisterData) =>
        this.authClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data),

      login: (data: LoginData) =>
        this.authClient.post<AuthResponse>(API_ENDPOINTS.auth.login, data),

      logout: () => {
        const token = tokenManager.getAccessToken();
        return this.authClient.post(
          API_ENDPOINTS.auth.logout,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      },

      getMe: () => {
        const token = tokenManager.getAccessToken();
        return this.authClient.get<User>(API_ENDPOINTS.auth.me, {
          headers: { Authorization: `Bearer ${token}` },
        });
      },

      verifyEmail: (token: string) =>
        this.authClient.post(API_ENDPOINTS.auth.verify, { token }),
    };
  }

  // Backend methods
  get backend() {
    return this.backendClient;
  }

  get company() {
    return {
      list: (params?: PaginationParams) =>
        this.backendClient.get<PaginatedResponse<Company>>(
          API_ENDPOINTS.company.list,
          { params }
        ),

      get: (id: number) =>
        this.backendClient.get<Company>(API_ENDPOINTS.company.get(id)),

      create: (data: CreateCompanyData) =>
        this.backendClient.post<Company>(API_ENDPOINTS.company.create, data),

      update: (id: number, data: UpdateCompanyData) =>
        this.backendClient.patch<Company>(
          API_ENDPOINTS.company.update(id),
          data
        ),

      delete: (id: number) =>
        this.backendClient.delete(API_ENDPOINTS.company.delete(id)),
    };
  }

  get infoFlow() {
    return {
      list: (params?: InfoFlowListParams) =>
        this.backendClient.get<PaginatedResponse<InfoFlow>>(
          API_ENDPOINTS.infoFlow.list,
          { params }
        ),

      get: (id: number) =>
        this.backendClient.get<InfoFlow>(API_ENDPOINTS.infoFlow.get(id)),

      create: (data: CreateInfoFlowData) =>
        this.backendClient.post<InfoFlow>(API_ENDPOINTS.infoFlow.create, data),

      update: (id: number, data: UpdateInfoFlowData) =>
        this.backendClient.patch<InfoFlow>(
          API_ENDPOINTS.infoFlow.update(id),
          data
        ),

      delete: (id: number) =>
        this.backendClient.delete(API_ENDPOINTS.infoFlow.delete(id)),

      getOAuthLink: (id: number, flowType: string) =>
        this.backendClient.get<{ url: string }>(
          API_ENDPOINTS.infoFlow.oauth(id, flowType)
        ),

      // we need to add x-authorization header with main service key
      setAuthHeader: (serviceKey: string | undefined) => {
        this.backendClient.defaults.headers.common['x-authorization'] =
          serviceKey;
      },
    };
  }

  get chat() {
    return {
      // Create a new chat
      create: (data: CreateChatData) =>
        this.backendClient.post<Chat>('/api/v1/chat/', data),

      // Get chat by ID
      get: (id: number) => this.backendClient.get<Chat>(`/api/v1/chat/${id}`),

      // List chats for info flow
      list: (infoFlowId: number, params?: PaginationParams) =>
        this.backendClient.get<PaginatedResponse<Chat>>(
          API_ENDPOINTS.chat.list(infoFlowId),
          { params }
        ),

      // Get messages for appeal
      getMessages: (appealId: number, params?: PaginationParams) =>
        this.backendClient.get<PaginatedResponse<Message>>(
          API_ENDPOINTS.chat.messages(appealId),
          { params }
        ),

      // Send message as company/operator
      sendMessage: (data: MessageCreateData) =>
        this.backendClient.post<Message>(API_ENDPOINTS.chat.sendMessage, {
          appeal_id: data.appeal_id,
          message: data.text,
          message_type: data.type || 'text',
        }),

      // Mark messages as read
      markMessagesAsRead: (appealId: number, lastMessageId: number) =>
        this.backendClient.patch(
          `/api/v1/message/${appealId}/messages/mark_as_read`,
          null,
          { params: { last_message_id: lastMessageId } }
        ),

      // New endpoints for service bot chat
      createConversation: (infoFlowId: number, data: ConversationCreateData) =>
        this.backendClient.post<ConversationResponse>(
          `/api/v1/text_bot/${infoFlowId}/conversation/`,
          data,
          {
            headers: {
              'Bot-authorization':
                API_CONFIG.BOTS_CONNECTION_SECRET || 'secret_key',
            },
          }
        ),

      getServiceBotConfig: (infoFlowId: number) =>
        this.backendClient.get<ServiceBotConfigResponse>(
          `/api/v1/text_bot/${infoFlowId}/service_bot_settings/`,
          {
            headers: {
              'Bot-authorization':
                API_CONFIG.BOTS_CONNECTION_SECRET || 'bot_secret_key',
            },
          }
        ),
    };
  }

  get appeal() {
    return {
      list: (params?: AppealListParams) =>
        this.backendClient.get<PaginatedResponse<Appeal>>(
          API_ENDPOINTS.appeal.list,
          { params }
        ),

      get: (id: number) =>
        this.backendClient.get<Appeal>(API_ENDPOINTS.appeal.get(id)),

      // Create new appeal
      create: (data: CreateAppealData) =>
        this.backendClient.post<Appeal>('/api/v1/appeal/', data),

      // Update appeal
      update: (id: number, data: UpdateAppealData) =>
        this.backendClient.patch<Appeal>(API_ENDPOINTS.appeal.update(id), data),

      // update: (id: number, data: UpdateAppealData) =>
      //   this.backendClient.patch<Appeal>(API_ENDPOINTS.appeal.update(id), data),

      assign: (id: number, operatorId: number) =>
        this.backendClient.post<Appeal>(API_ENDPOINTS.appeal.assign(id), {
          operator_id: operatorId,
        }),

      close: (id: number) =>
        this.backendClient.post<Appeal>(API_ENDPOINTS.appeal.close(id)),
    };
  }

  get serviceBot() {
    return {
      list: (params?: PaginationParams) =>
        this.backendClient.get<PaginatedResponse<ServiceBot>>(
          API_ENDPOINTS.serviceBot.list,
          { params }
        ),

      get: (id: number) =>
        this.backendClient.get<ServiceBot>(API_ENDPOINTS.serviceBot.get(id)),

      // we need to add x-authorization header with main service key
      setAuthHeader: (serviceKey: string | undefined) => {
        this.backendClient.defaults.headers.common['x-authorization'] =
          serviceKey;
      },

      create: (data: CreateServiceBotData) =>
        this.backendClient.post<ServiceBot>(
          API_ENDPOINTS.serviceBot.create,
          data
        ),

      update: (id: number, data: UpdateServiceBotData) =>
        this.backendClient.patch<ServiceBot>(
          API_ENDPOINTS.serviceBot.update(id),
          data
        ),

      delete: (id: number, data: any) =>
        this.backendClient.delete(API_ENDPOINTS.serviceBot.delete(id), data),
    };
  }

  // Service Bot Relation endpoints
  get serviceBotRelation() {
    return {
      // Create bot-flow relation
      create: (data: ServiceBotRelation) =>
        this.backendClient.post(
          '/api/v1/service_bot_relation/info_flow/',
          data
        ),

      // Get relations for bot
      getByBot: (botId: number) =>
        this.backendClient.get<ServiceBotRelation[]>(
          `/api/v1/service_bot_relation/service_bot/${botId}/`
        ),

      // Get relations for flow
      getByFlow: (flowId: number) =>
        this.backendClient.get<ServiceBotRelation[]>(
          `/api/v1/service_bot_relation/info_flow/${flowId}/`
        ),

      // Delete relation
      delete: (botId: number, flowId: number) =>
        this.backendClient.delete(
          `/api/v1/service_bot_relation/${botId}/${flowId}/`
        ),
    };
  }

  get operator() {
    return {
      getStats: (params?: OperatorStatsParams) =>
        this.backendClient.get<OperatorStats>(API_ENDPOINTS.operator.stats, {
          params,
        }),

      list: (params?: PaginationParams) =>
        this.backendClient.get<PaginatedResponse<Operator>>(
          API_ENDPOINTS.operator.list,
          { params }
        ),
    };
  }

  get sender() {
    return {
      create: (data: any) => this.backendClient.post('/api/v1/sender/', data),
    };
  }
}

// Types
interface RegisterData {
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  name: string;
  company_id?: number;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  company_id?: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: number;
  auto_assign_appeals: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InfoFlow {
  id: number;
  company_id: number;
  name: string;
  type: string;
  data: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Chat {
  id: number;
  info_flow_id: number;
  messenger_chat_id: string;
  type: string;
  meta: Record<string, any>;
}

interface Message {
  id: number;
  appeal_id: number;
  sender: {
    id: string;
    type: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
  text: string;
  type: string;
  attachments: any[];
  created_at: string;
}

interface Appeal {
  id: number;
  company_id: number;
  info_flow_id: number;
  chat_id: number;
  operator_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ServiceBot {
  id: number;
  company_id: number;
  prompt: string;
  enable_functions: boolean;
  // decimal
  talkativeness: number;
  temperature: number;
  timezone: string;
  settings: any;
  is_robot_question: string;
  llm_model: string;
  name: string;
  avatar?: string;
}

interface Operator {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface OperatorStats {
  operator_id: number;
  company_id: number;
  appeals_cnt: number;
  appeals_accepted_cnt: number;
  appeals_closed_cnt: number;
  mean_response_time_in_seconds: number;
  mean_pending_time_in_seconds: number;
}

interface PaginationParams {
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
}

interface PaginatedResponse<T> {
  page: number;
  page_size: number;
  pages: number;
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
  total: number;
  limit: number;
  offset: number;
}

interface ConversationCreateData {
  type: string;
  messenger_chat_id: string;
  meta: any;
}

interface MessageCreateData {
  appeal_id: number;
  text: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'file';
  attachments?: any[];
}

interface ServiceBotConfigResponse {
  company_id?: number;
  bot_id?: number;
  bot_name?: string;
  bot_avatar?: string;
  bot_prompt?: string;
  bot_talkativeness?: number;
  bot_temperature?: number;
  bot_timezone?: string;
  settings?: any;
  bot_is_robot_question?: string;
  bot_llm_model?: string;
}

interface ConversationResponse {
  status: boolean;
  appeal?: Appeal;
  bot?: ServiceBot;
}

interface CreateCompanyData {
  auto_assign_appeals: boolean;
  is_active: boolean;
}

interface ServiceBotRelation {
  service_bot_id: number;
  info_flow_id: number;
  is_active: boolean;
}

interface CreateAppealData {
  id: any;
  chat_id: number;
  company_id: number;
  service_bot_id?: number;
  status?: string;
  needs_an_operator?: boolean;
  is_ruled_by_bot?: boolean;
  operator: number;
}

interface UpdateAppealData {
  status?: string;
  operator_id?: number;
  needs_an_operator?: boolean;
  is_ruled_by_bot?: boolean;
}

interface CreateChatData {
  info_flow_id: number;
  type: string;
  messenger_chat_id: string;
  meta?: any;
}

interface CreateServiceBotData {
  id?: number;
  company_id: number;
  prompt: string;
  talkativeness: number;
  temperature: number;
  timezone: string;
  is_robot_question: string;
  llm_model: string;
  name: string;
  avatar?: string;
}

interface UpdateCompanyData extends Partial<CreateCompanyData> {}

interface InfoFlowListParams extends PaginationParams {
  company_id?: number;
  type?: string;
}

interface CreateInfoFlowData {
  company_id: number;
  name: string;
  type: string;
  data: Record<string, any>;
}

interface UpdateInfoFlowData extends Partial<CreateInfoFlowData> {}

interface SendMessageData {
  appeal_id: number;
  text: string;
  type?: string;
  attachments?: any[];
}

interface AppealListParams extends PaginationParams {
  company_id?: number;
  status?: string;
  operator_id?: number;
  info_flow_id: any;
}

interface UpdateAppealData {
  status?: string;
  operator_id?: number;
}

interface CreateServiceBotData {
  id?: number; // Optional for new agents
  company_id: number;
  prompt: string;
  // enable_functions: boolean;
  talkativeness: number;
  temperature: number;
  timezone: string;
  // settings: any;
  is_robot_question: string;
  llm_model: string;
  name: string;
  avatar?: string;
}

interface UpdateServiceBotData extends Partial<CreateServiceBotData> {}

interface OperatorStatsParams extends PaginationParams {
  company_id?: number;
  start_date?: string;
  end_date?: string;
}

// Export singleton instance
export const apiClient = new ApiClient();

export type {
  RegisterData,
  LoginData,
  AuthResponse,
  User,
  Company,
  InfoFlow,
  Chat,
  Message,
  Appeal,
  ServiceBot,
  ServiceBotRelation,
  Operator,
  OperatorStats,
  PaginationParams,
  PaginatedResponse,
  CreateServiceBotData,
  UpdateServiceBotData,
  CreateChatData,
  CreateAppealData,
  UpdateAppealData,
};
