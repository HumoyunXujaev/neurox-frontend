import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent } from '@/hooks/use-agents';

interface AgentStatusMap {
  [agentId: string]: string | 'active' | 'inactive';
}

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  agentStatuses: AgentStatusMap;
  setAgents: (agents: Agent[]) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  updateAgent: (updatedAgent: Agent) => void;
  deleteAgent: (agentId: string) => void;
  addAgent: (agent: Agent) => void;
  toggleAgentStatus: (agentId: string) => void;
  getAgentStatus: (agentId: string) => string | 'active' | 'inactive';
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents: [],
      selectedAgent: null,
      agentStatuses: {},

      setAgents: (agents) => {
        const { selectedAgent, agentStatuses } = get();

        // Merge agents with their statuses from localStorage
        const agentsWithStatus = agents.map((agent) => ({
          ...agent,
          status: agentStatuses[agent.id] || 'active',
        }));

        set({
          agents: agentsWithStatus,
          selectedAgent: selectedAgent
            ? agentsWithStatus.find((a) => a.id === selectedAgent.id) || null
            : null,
        });
      },

      setSelectedAgent: (agent) => {
        if (agent) {
          const status = get().agentStatuses[agent.id] || 'active';
          set({
            selectedAgent: { ...agent, status },
          });
        } else {
          set({ selectedAgent: null });
        }
      },

      updateAgent: (updatedAgent) => {
        const { agents, selectedAgent, agentStatuses } = get();
        const status = agentStatuses[updatedAgent.id] || 'active';
        const agentWithStatus = { ...updatedAgent, status };

        const newAgents = agents.map((agent) =>
          agent.id === updatedAgent.id ? agentWithStatus : agent
        );

        set({
          agents: newAgents,
          selectedAgent:
            selectedAgent?.id === updatedAgent.id
              ? agentWithStatus
              : selectedAgent,
        });
      },

      deleteAgent: (agentId) => {
        const { agents, selectedAgent, agentStatuses } = get();
        const newAgents = agents.filter((agent) => agent.id !== agentId);
        const newStatuses = { ...agentStatuses };
        delete newStatuses[agentId];

        set({
          agents: newAgents,
          agentStatuses: newStatuses,
          selectedAgent:
            selectedAgent?.id === agentId
              ? newAgents[0] || null
              : selectedAgent,
        });
      },

      addAgent: (agent) => {
        const { agents, agentStatuses } = get();
        const newStatuses = { ...agentStatuses, [agent.id]: 'active' };

        set({
          agents: [...agents, { ...agent, status: 'active' }],
          agentStatuses: newStatuses,
        });
      },

      toggleAgentStatus: (agentId) => {
        const { agents, selectedAgent, agentStatuses } = get();
        const currentStatus = agentStatuses[agentId] || 'active';
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        const newStatuses = { ...agentStatuses, [agentId]: newStatus };

        // Update agents array with new status
        const newAgents = agents.map((agent) =>
          agent.id === agentId ? { ...agent, status: newStatus } : agent
        );

        // Update selected agent if it's the one being toggled
        const updatedSelectedAgent =
          selectedAgent?.id === agentId
            ? { ...selectedAgent, status: newStatus }
            : selectedAgent;

        set({
          agents: newAgents,
          agentStatuses: newStatuses,
          selectedAgent: updatedSelectedAgent,
        });
      },

      getAgentStatus: (agentId) => {
        const { agentStatuses } = get();
        return agentStatuses[agentId] || 'active';
      },
    }),
    {
      name: 'agent-store',
      partialize: (state) => ({
        agentStatuses: state.agentStatuses,
        selectedAgentId: state.selectedAgent?.id,
      }),
    }
  )
);
