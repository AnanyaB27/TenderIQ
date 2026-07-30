import { create } from "zustand";

interface ActiveOrganizationState {
  organizationId: string | null;
  setOrganizationId: (organizationId: string | null) => void;
}

export const useActiveOrganizationStore = create<ActiveOrganizationState>((set) => ({
  organizationId: null,
  setOrganizationId: (organizationId) => set({ organizationId }),
}));
