import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { utilitiesApi, UtilityQuery, CreateUtilityRequest } from '@/api/utilities';

export const UTILITY_KEYS = {
    all: ['utilities'] as const,
    config: ['utilities', 'config'] as const,
    list: (filters: UtilityQuery) => [...UTILITY_KEYS.all, filters] as const,
    detail: (id: string) => [...UTILITY_KEYS.all, 'detail', id] as const,
};

export function useUtilityConfig() {
    return useQuery({
        queryKey: UTILITY_KEYS.config,
        queryFn: async () => {
            const res = await utilitiesApi.getConfig();
            return res.data;
        },
        staleTime: Infinity,
    });
}

export function useUtilities(query: UtilityQuery = {}) {
    return useQuery({
        queryKey: UTILITY_KEYS.list(query),
        queryFn: () => utilitiesApi.getAll(query),
    });
}

export function useCreateUtility() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: utilitiesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: UTILITY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['cash'] });
        },
    });
}

export function useUpdateUtility() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateUtilityRequest> }) =>
            utilitiesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: UTILITY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['cash'] });
        },
    });
}

export function useDeleteUtility() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: utilitiesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: UTILITY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['cash'] });
        },
    });
}
