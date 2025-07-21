'use client';

export const API_CONFIG = {
  AUTH_SERVICE_URL:
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8000',
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8100',
  BOTS_CONNECTION_SECRET:
    process.env.NEXT_PUBLIC_BOTS_CONNECTION_SECRET || 'secret_key',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const API_ENDPOINTS = {
  // Auth Service Endpoints
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    publicKey: '/api/v1/auth/public-key',
    verify: '/api/v1/auth/verify-email',
  },

  // Main Backend Endpoints
  company: {
    list: '/api/v1/company/',
    get: (id: number) => `/api/v1/company/${id}`,
    create: '/api/v1/company/',
    update: (id: number) => `/api/v1/company/${id}`,
    delete: (id: number) => `/api/v1/company/${id}`,
  },

  infoFlow: {
    list: '/api/v1/info_flow/list',
    get: (id: number) => `/api/v1/info_flow/${id}`,
    create: '/api/v1/info_flow/',
    update: (id: number) => `/api/v1/info_flow/${id}`,
    delete: (id: number) => `/api/v1/info_flow/${id}`,
    oauth: (id: number, type: string) =>
      `/api/v1/info_flow/${id}/oauth/?flow_type=${type}`,
  },

  chat: {
    create: '/api/v1/chat/',
    get: (id: number) => `/api/v1/chat/${id}`,
    list: (infoFlowId: number) => `/api/v1/info_flow/${infoFlowId}/chats/`,
    messages: (appealId: number) => `/api/v1/message/${appealId}/list/`,
    sendMessage: '/api/v1/message/',
  },

  appeal: {
    list: '/api/v1/appeal/',
    get: (id: number) => `/api/v1/appeal/${id}`,
    create: '/api/v1/appeal/',
    update: (id: number) => `/api/v1/appeal/${id}`,
    assign: (id: number) => `/api/v1/appeal/${id}/assign/`,
    close: (id: number) => `/api/v1/appeal/${id}/close/`,
  },

  serviceBot: {
    list: '/api/v1/service_bot/',
    get: (id: number) => `/api/v1/service_bot/${id}`,
    create: '/api/v1/service_bot/',
    update: (id: number) => `/api/v1/service_bot/${id}`,
    delete: (id: number) => `/api/v1/service_bot/${id}`,
  },

  serviceBotRelation: {
    create: '/api/v1/service_bot_relation/info_flow/',
    getByBot: (botId: number) =>
      `/api/v1/service_bot_relation/service_bot/${botId}/`,
    getByFlow: (flowId: number) =>
      `/api/v1/service_bot_relation/info_flow/${flowId}/`,
    delete: (botId: number, flowId: number) =>
      `/api/v1/service_bot_relation/${botId}/${flowId}/`,
  },

  operator: {
    stats: '/api/v1/operator/stats/',
    list: '/api/v1/operator/',
  },

  websocket: {
    crm: '/api/v1/ws/crm/',
  },
};

export const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const getWebSocketUrl = (endpoint: string, token: string) => {
  const wsUrl = API_CONFIG.BACKEND_URL.replace(/^http/, 'ws');
  return `${wsUrl}${endpoint}?access_token=${token}`;
};
