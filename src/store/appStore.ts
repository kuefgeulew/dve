/**
 * AppStore — application-level state: operator identity, branch, session, and UI mode.
 * Session ID is generated once at store creation and remains stable for the browser session.
 */

import { create } from 'zustand';
import { type AppMode, DEFAULT_APP_MODE } from '../constants/appModes';
import { generateId } from '../utils/idGenerator';

interface AppStore {
  mode: AppMode;
  operatorId: string;
  branchCode: string;
  sessionId: string;

  setMode: (mode: AppMode) => void;
  setOperatorId: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  mode: DEFAULT_APP_MODE,
  operatorId: 'OP-1042',
  branchCode: 'BR-DHK-017',
  sessionId: generateId(),
  setMode: (mode) => set({ mode }),
  setOperatorId: (operatorId) => set({ operatorId }),
}));
