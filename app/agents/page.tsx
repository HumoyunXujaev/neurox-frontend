'use client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { AgentCard } from '@/components/agent-card';
import { AddAgentCard } from '@/components/add-agent-card';
import { useAgentStore } from '@/lib/agent-store';
import { useAgents, type Agent } from '@/hooks/use-agents';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

// Генерация случайного аватара
const getRandomAvatar = () => {
  const randomSeed = Math.floor(Math.random() * 40) + 1;
  return `https://api.dicebear.com/9.x/notionists/png?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

export default function Dashboard() {
  const {
    selectedAgent,
    setSelectedAgent,
    setAgents: setStoreAgents,
    updateAgent: updateStoreAgent,
    deleteAgent: deleteStoreAgent,
    addAgent: addStoreAgent,
  } = useAgentStore();

  const {
    agents,
    isLoading,
    createAgent,
    updateAgent: updateBackendAgent,
    deleteAgent: deleteBackendAgent,
    refresh,
  } = useAgents({ autoLoad: true });

  const { user } = useAuth();
  const [copiedAgentCode, setCopiedAgentCode] = useState<string | null>(null);

  const [, forceUpdate] = useState({});

  useEffect(() => {
    setStoreAgents(agents);
  }, [agents, setStoreAgents]);

  const handleAgentUpdate = async (updatedAgent: Agent) => {
    updateStoreAgent(updatedAgent);

    const { status, ...backendData } = updatedAgent;
    const result = await updateBackendAgent(updatedAgent.id, backendData);
    if (result) {
      const finalAgent = { ...result, status: updatedAgent.status };
      updateStoreAgent(finalAgent);
    }
  };

  const handleAgentDelete = async (agentId: string) => {
    const success = await deleteBackendAgent(agentId, Number(user?.company_id));
    if (success) {
      deleteStoreAgent(agentId);
    }
  };

  const handleAgentAdd = async (newAgent: Agent, isFromCode = false) => {
    // Если агент не создается из кода, присваиваем случайный аватар
    if (!isFromCode && !newAgent.avatar) {
      newAgent.avatar = getRandomAvatar();
    }

    addStoreAgent(newAgent);

    const createdAgent = await createAgent(newAgent);
    if (createdAgent) {
      const finalAgent = { ...createdAgent, status: newAgent.status };
      updateStoreAgent(finalAgent);
      refresh();
    }
  };

  const handleCopyAgentCode = (agent: Agent) => {
    const jsonString = JSON.stringify(agent);
    // Безопасное кодирование в Base64 (поддерживает Unicode)
    const agentCode = btoa(
      encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(Number.parseInt(p1, 16))
      )
    );
    setCopiedAgentCode(agentCode);
    navigator.clipboard.writeText(agentCode);
    toast.success('Код агента скопирован');
  };

  // Обновим обработчик переключения статуса
  const handleToggleStatus = (agentId: string) => {
    // Переключаем статус в store
    useAgentStore.getState().toggleAgentStatus(agentId);

    // Принудительно обновляем UI
    forceUpdate({});
  };

  return (
    <div className='flex h-screen bg-background'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-68'>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-3 md:p-4 lg:p-6 overflow-auto'>
          <div className='max-w-7xl mx-auto'>
            {isLoading && agents.length === 0 ? (
              <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6'>
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgent?.id === agent.id}
                    onSelect={() => setSelectedAgent(agent)}
                    onUpdate={handleAgentUpdate}
                    onDelete={handleAgentDelete}
                    onCopyCode={handleCopyAgentCode}
                    // onToggleStatus={handleToggleStatus}
                  />
                ))}
                <AddAgentCard
                  onAddAgent={handleAgentAdd}
                  copiedAgentCode={copiedAgentCode}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
