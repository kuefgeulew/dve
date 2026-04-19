import { create } from 'zustand';
import {
  aggregateStats,
  getEvolutionRecommendations,
  getTopErrors,
} from '../engine/evolutionAdvisor';
import { historicalLog } from '../mock/historicalLog';
import type {
  ErrorLogEntry,
  EvolutionRecommendation,
  OperatorAction,
  TopError,
  ValidationStats,
} from '../types';
import { generateId } from '../utils/idGenerator';
import { useAppStore } from './appStore';

interface LogStore {
  entries: ErrorLogEntry[];

  // Write operations
  addEntry: (entry: Omit<ErrorLogEntry, 'id' | 'timestamp' | 'sessionId'>) => string;
  updateEntryAction: (entryId: string, action: OperatorAction, proceedTimestamp: string) => void;
  markWarningAcknowledged: (entryId: string, ruleId: string) => void;

  // Read operations (derived from entries - computed on call, not stored)
  getStats: () => ValidationStats;
  getTopErrors: (limit?: number) => TopError[];
  getEvolutionRecommendations: () => EvolutionRecommendation[];
}

export const useLogStore = create<LogStore>((set, get) => ({
  entries: [...historicalLog],

  addEntry: (entry) => {
    const id = generateId();
    const { sessionId } = useAppStore.getState();
    const fullEntry: ErrorLogEntry = {
      ...entry,
      id,
      timestamp: new Date().toISOString(),
      sessionId,
    };
    set((state) => ({ entries: [...state.entries, fullEntry] }));
    return id;
  },

  updateEntryAction: (entryId, operatorAction, proceedTimestamp) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === entryId ? { ...e, operatorAction, proceedTimestamp } : e,
      ),
    }));
  },

  markWarningAcknowledged: (entryId, ruleId) => {
    set((state) => ({
      entries: state.entries.map((e) => {
        if (e.id !== entryId) return e;
        return {
          ...e,
          acknowledgedWarningIds: e.acknowledgedWarningIds.includes(ruleId)
            ? e.acknowledgedWarningIds
            : [...e.acknowledgedWarningIds, ruleId],
          warnings: e.warnings.map((w) =>
            w.ruleId === ruleId ? { ...w, acknowledged: true } : w,
          ),
        };
      }),
    }));
  },

  getStats: () => aggregateStats(get().entries),

  getTopErrors: (limit = 5) => getTopErrors(get().entries, limit),

  getEvolutionRecommendations: () => getEvolutionRecommendations(),
}));
