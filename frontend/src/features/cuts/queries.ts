import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Catalogs, Cut, Project, Revision } from '../../lib/types';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: () => api<Project[]>('/projects/') });
}
export function useCatalogs(project: number) {
  return useQuery({ queryKey: ['catalogs', project], queryFn: () => api<Catalogs>(`/projects/${project}/catalogs/`), enabled: project > 0 });
}
export function useCuts(project: number) {
  return useQuery({ queryKey: ['cuts', project], queryFn: () => api<Cut[]>(`/cuts/?project=${project}`), enabled: project > 0 });
}
export function useCut(id: number) {
  return useQuery({ queryKey: ['cut', id], queryFn: () => api<Cut>(`/cuts/${id}/`), enabled: Number.isSafeInteger(id) && id > 0 });
}
export function useHistory(id: number) {
  return useQuery({ queryKey: ['cut-history', id], queryFn: () => api<Revision[]>(`/cuts/${id}/history/`), enabled: Number.isSafeInteger(id) && id > 0 });
}
