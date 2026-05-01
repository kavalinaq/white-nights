import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../../../shared/api/client';
import { useCursorPagination } from '../../../shared/hooks/useCursorPagination';

export interface Comment {
  commentId: number;
  parentCommentId: number | null;
  text: string;
  createdAt: string;
  author: {
    userId: number;
    nickname: string;
    avatarUrl: string | null;
  };
}

export function useComments(postId: number) {
  const queryClient = useQueryClient();

  const pagination = useCursorPagination<Comment>(
    ['comments', postId],
    `/posts/${postId}/comments`,
    'commentId',
    20,
  );

  const addComment = useMutation({
    mutationFn: ({ text, parentCommentId }: { text: string; parentCommentId?: number }) =>
      client.post<Comment>(`/posts/${postId}/comments`, { text, parentCommentId }),
    onSuccess: (_data, variables) => {
      if (variables.parentCommentId != null) {
        queryClient.invalidateQueries({ queryKey: ['replies', variables.parentCommentId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      }
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: ({ commentId }: { commentId: number; parentCommentId?: number | null }) =>
      client.delete(`/comments/${commentId}`),
    onSuccess: (_data, variables) => {
      if (variables.parentCommentId != null) {
        queryClient.invalidateQueries({ queryKey: ['replies', variables.parentCommentId] });
      }
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  return { ...pagination, addComment, deleteComment };
}

export function useReplies(commentId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['replies', commentId],
    queryFn: () => client.get<Comment[]>(`/comments/${commentId}/replies`).then(r => r.data),
    enabled,
  });
}
