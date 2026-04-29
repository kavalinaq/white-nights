import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../../../shared/api/client';

export interface FollowUser {
  userId: number;
  nickname: string;
  avatarUrl: string | null;
}

export const useFollowers = (userId: number | undefined) => {
  return useQuery<FollowUser[]>({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const res = await client.get(`/users/${userId}/followers`);
      return res.data;
    },
    enabled: !!userId,
  });
};

export const useFollowing = (userId: number | undefined) => {
  return useQuery<FollowUser[]>({
    queryKey: ['following', userId],
    queryFn: async () => {
      const res = await client.get(`/users/${userId}/following`);
      return res.data;
    },
    enabled: !!userId,
  });
};

export const useFollow = (targetUserId: number, targetNickname: string) => {
  const queryClient = useQueryClient();

  const follow = useMutation({
    mutationFn: () => client.post(`/users/${targetUserId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetNickname] });
    },
  });

  const unfollow = useMutation({
    mutationFn: () => client.delete(`/users/${targetUserId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetNickname] });
    },
  });

  return { follow, unfollow };
};

export const useFollowRequests = () => {
  return useQuery({
    queryKey: ['follow-requests'],
    queryFn: async () => {
      const response = await client.get('/users/me/follow-requests');
      return response.data;
    },
  });
};

export const useHandleFollowRequest = () => {
  const queryClient = useQueryClient();

  const accept = useMutation({
    mutationFn: (followerId: number) => client.post(`/users/me/follow-requests/${followerId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const reject = useMutation({
    mutationFn: (followerId: number) => client.post(`/users/me/follow-requests/${followerId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
    },
  });

  return { accept, reject };
};
