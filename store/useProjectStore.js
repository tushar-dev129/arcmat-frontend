import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useProjectStore = create(
    persist(
        (set) => ({
            activeProjectId: null,
            activeProjectName: null,
            activeMoodboardId: null,
            activeMoodboardName: null,
            isActiveTemplate: false,

            setActiveProject: (id, name, isTemplate = false) => set({
                activeProjectId: id,
                activeProjectName: name,
                activeMoodboardId: null, // Clear moodboard if project changes
                activeMoodboardName: null,
                isActiveTemplate: !!isTemplate
            }),

            setActiveMoodboard: (id, name, projectId, projectName, isTemplate = false) => set({
                activeProjectId: projectId || null,
                activeProjectName: projectName || null,
                activeMoodboardId: id,
                activeMoodboardName: name,
                isActiveTemplate: !!isTemplate
            }),

            clearActiveProject: () => set({
                activeProjectId: null,
                activeProjectName: null,
                activeMoodboardId: null,
                activeMoodboardName: null,
                isActiveTemplate: false
            }),
        }),
        {
            name: 'active-project-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useProjectStore;
