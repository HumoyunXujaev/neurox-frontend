import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  type ServiceBot,
  type PaginatedResponse,
} from '@/lib/api/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

interface UseAgentsOptions {
  limit?: number;
  autoLoad?: boolean;
}

export interface Agent {
  id: any;
  name: string;
  avatar: string;
  status: string | 'active' | 'inactive';
  llmModel: string;
  totalConversations: number;
  temperature: number;
  instructions: string;
  // Backend fields mapping
  company_id: number;
  prompt: string;
  enable_functions: boolean;
  talkativeness: number;
  timezone: string;
  settings: any;
  is_robot_question:
    | string
    | 'tell-that-bot'
    | 'dont-tell_that-bot'
    | 'tell-if-asked';
}

// Маппинг данных из ServiceBot в Agent
function mapServiceBotToAgent(bot: ServiceBot): Agent {
  return {
    id: bot.id.toString(),
    name: bot.name,
    avatar:
      bot.avatar ||
      `https://api.dicebear.com/9.x/notionists/png?seed=${bot.id}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
    status: 'active', // По умолчанию активен, можно добавить поле в бэкенд
    llmModel: bot.llm_model,
    totalConversations: 0, // Нужно будет получать из статистики
    temperature: bot.temperature,
    instructions: bot.prompt,
    // Backend fields
    company_id: bot.company_id,
    prompt: bot.prompt,
    enable_functions: bot.enable_functions,
    talkativeness: bot.talkativeness,
    timezone: bot.timezone,
    settings: bot.settings,
    is_robot_question: bot.is_robot_question,
  };
}

// Маппинг Agent обратно в данные для бэкенда
function mapAgentToServiceBotData(agent: Agent): Partial<ServiceBot> {
  return {
    company_id: agent.company_id,
    name: agent.name,
    avatar: agent.avatar,
    llm_model: agent.llmModel,
    temperature: agent.temperature,
    prompt: agent.prompt,
    // enable_functions: agent.enable_functions || true,
    talkativeness: agent.talkativeness || 50,
    timezone: agent.timezone || 'UTC',
    settings: agent.settings || {},
    is_robot_question: agent.is_robot_question,
  };
}

export function useAgents(options: UseAgentsOptions = {}) {
  const { limit = 50, autoLoad = true } = options;
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const { user } = useAuth();

  const fetchAgents = useCallback(async () => {
    if (!user?.company_id) {
      console.log('No company_id available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.serviceBot.list({
        limit,
        offset,
      });
      console.log('Fetched agents:', response.data);

      const { results, total: totalCount } = response.data;
      console.log('Total agents:', totalCount);
      console.log('Results:', results);

      // Фильтруем только агентов текущей компании и маппим данные
      const companyAgents = results
        .filter((bot) => bot.company_id === user.company_id)
        .map(mapServiceBotToAgent);

      setAgents(results);
      setTotal(totalCount);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch agents';
      setError(errorMessage);
      toast.error('Ошибка загрузки агентов', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, user?.company_id]);

  const createAgent = useCallback(
    async (agentData: Partial<Agent>) => {
      if (!user?.company_id) {
        toast.error('Ошибка', {
          description: 'Компания не найдена',
        });
        return null;
      }

      try {
        setIsLoading(true);

        const serviceBotData = {
          // generate a unique ID for the new agent(int32)
          id: Math.floor(Date.now() / 100000),
          company_id: user.company_id,
          name: agentData.name || 'Новый агент',
          prompt:
            agentData.instructions ||
            agentData.prompt ||
            'You are a helpful assistant.',
          // enable_functions: true,
          talkativeness: agentData.talkativeness || 50.5,
          temperature: agentData.temperature || 0.7,
          timezone: 'UTC',
          // settings: {},
          is_robot_question: 'tell-if-asked',
          llm_model: agentData.llmModel || 'o4-mini-2025-04-16',
          avatar: agentData.avatar,
        };

        apiClient.serviceBot.setAuthHeader(
          process.env.NEXT_PUBLIC_MAIN_SERVICE_API_KEY
        );
        // also need to provide company_id

        console.log(serviceBotData, 'creaating with data');
        const response = await apiClient.serviceBot.create(serviceBotData);
        const newAgent = mapServiceBotToAgent(response.data);
        console.log(response, 'response');
        setAgents((prev) => [...prev, newAgent]);
        toast.success('Агент создан успешно');

        return newAgent;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create agent';
        toast.error('Ошибка создания агента', {
          description: errorMessage,
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.company_id]
  );

  const updateAgent = useCallback(
    async (agentId: any, updates: Partial<Agent>) => {
      try {
        setIsLoading(true);

        const serviceBotData = mapAgentToServiceBotData({
          ...agents.find((a) => a.id === agentId)!,
          ...updates,
        });

        console.log('updating bot with data:', serviceBotData);
        apiClient.serviceBot.setAuthHeader(
          process.env.NEXT_PUBLIC_MAIN_SERVICE_API_KEY
        );
        const response = await apiClient.serviceBot.update(
          parseInt(agentId),
          serviceBotData
        );

        const updatedAgent = mapServiceBotToAgent(response.data);

        setAgents((prev) =>
          prev.map((agent) => (agent.id === agentId ? updatedAgent : agent))
        );

        toast.success('Агент обновлен');
        return updatedAgent;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update agent';
        toast.error('Ошибка обновления агента', {
          description: errorMessage,
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [agents]
  );

  const deleteAgent = useCallback(async (agentId: any, companyId: number) => {
    try {
      setIsLoading(true);

      apiClient.serviceBot.setAuthHeader(
        process.env.NEXT_PUBLIC_MAIN_SERVICE_API_KEY
      );

      // Send company_id as a query parameter
      await apiClient.serviceBot.delete(parseInt(agentId), {
        params: {
          company_id: companyId,
        },
      });

      setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
      toast.success('Агент удален');

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete agent';
      toast.error('Ошибка удаления агента', {
        description: errorMessage,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && agents.length < total) {
      setOffset((prev) => prev + limit);
    }
  }, [isLoading, agents.length, total, limit]);

  const refresh = useCallback(() => {
    setOffset(0);
    fetchAgents();
  }, [fetchAgents]);

  // Auto load on mount if enabled
  useEffect(() => {
    if (autoLoad && user?.company_id) {
      fetchAgents();
    }
  }, [autoLoad, fetchAgents, user?.company_id]);

  return {
    agents,
    isLoading,
    error,
    total,
    hasMore: agents.length < total,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    loadMore,
    refresh,
  };
}
