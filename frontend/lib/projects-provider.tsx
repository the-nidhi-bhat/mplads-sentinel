"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiUrl } from "./api";
import type { Project } from "./mock-data";

type ProjectsContextValue = {
  projects: Project[];
  refresh: () => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextValue>({ projects: [], refresh: async () => {} });

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  const refresh = useCallback(async () => {
    const response = await fetch(apiUrl("/api/projects"));
    if (!response.ok) throw new Error(`Projects request failed with ${response.status}`);
    const data = (await response.json()) as Project[];
    setProjects(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    refresh().catch(() => {
      if (!cancelled) setProjects([]);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return <ProjectsContext.Provider value={{ projects, refresh }}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  return useContext(ProjectsContext).projects;
}

export function useRefreshProjects() {
  return useContext(ProjectsContext).refresh;
}
