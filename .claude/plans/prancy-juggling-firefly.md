# Bug Fix Plan

## Context
Audit of the White Nights codebase revealed 5 confirmed bugs ranging from silent failures to stale UI state. These are real functional regressions, not style issues.

---

## Bugs & Fixes

### 1. No 401 response interceptor — silent failures on token expiry (HIGH)
**File:** `frontend/src/shared/api/client.ts`

When the access token expires every API call returns 401, but the client has no response interceptor. The user sees a broken app with no feedback and is never redirected to login.

**Fix:** Add a response interceptor that on 401 calls `useAuthStore.getState().checkAuth()` to attempt a refresh. If refresh fails (throws), call `logout()` and redirect to `/login`.

```ts
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        await useAuthStore.getState().checkAuth();
        return client(error.config);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 2. Login errors never display — wrong error field name (HIGH)
**File:** `frontend/src/features/auth/LoginPage.tsx` line 50

The backend returns problem-details JSON with a `detail` field (confirmed in CLAUDE.md: *"All error responses are problem-details JSON (`type`, `title`, `status`, `detail`)"*). `LoginPage` reads `.response?.data?.message` which is always `undefined`, so the error `<p>` falls back to the generic `'Login failed'` string even when the server sends a specific reason (wrong password, unverified account, etc.).

**Fix:** Change `message` → `detail`:
```tsx
{(mutation.error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Login failed'}
```

---

### 3. Follow-request rejection doesn't refresh profile counts (MEDIUM)
**File:** `frontend/src/features/profile/hooks/useFollow.ts` lines 73–78

`useHandleFollowRequest.accept` invalidates both `['follow-requests']` and `['profile']`. `reject` only invalidates `['follow-requests']`. After rejecting a pending request the sender's profile still shows an inflated follower count until a manual page reload.

**Fix:** Add profile invalidation to the `reject` mutation's `onSuccess`:
```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
  queryClient.invalidateQueries({ queryKey: ['profile'] });
},
```

---

### 4. `ChatService.getChats()` — N+1 queries + missing transaction (MEDIUM)
**File:** `backend/src/main/java/com/whitenights/chat/service/ChatService.java` line 32

`getChats()` has no `@Transactional` annotation. For every chat it calls `toChatResponse()`, which issues 2 extra queries (`chatMemberRepository.findByIdChatId` + `messageRepository.findLatestMessage`) and accesses the lazy `user.getNickname()` relation — yielding 1 + 2N + N queries and a `LazyInitializationException` risk outside a session.

**Fix:** Annotate the method:
```java
@Transactional(readOnly = true)
public List<ChatResponse> getChats(User user) { ... }
```

---

### 5. `as any` error casts replaced with proper types (LOW)
**Files:** `LoginPage.tsx` (covered by fix #2), `ForgotPasswordPage.tsx` line 49, `ResetPasswordPage.tsx` line 74, `VerifyPage.tsx` line 34, `SettingsPage.tsx` line 82

Each uses `(mutation.error as any).response?.data?....` with an eslint-disable comment. Replace with the same typed cast pattern already used in `SettingsPage` post-fix and `VerifyPage`:
```ts
(mutation.error as { response?: { data?: { detail?: string } } }).response?.data?.detail
```
(VerifyPage already uses `message` because that's what the verify endpoint actually returns — keep that one.)

---

## Files to change

| File | Change |
|---|---|
| `frontend/src/shared/api/client.ts` | Add 401 response interceptor |
| `frontend/src/features/auth/LoginPage.tsx` | `message` → `detail`; remove `as any` |
| `frontend/src/features/auth/ForgotPasswordPage.tsx` | Remove `as any` |
| `frontend/src/features/auth/ResetPasswordPage.tsx` | Remove `as any` |
| `frontend/src/features/profile/hooks/useFollow.ts` | Add profile invalidation to reject |
| `backend/.../chat/service/ChatService.java` | Add `@Transactional(readOnly = true)` |

---

## Verification

1. **401 interceptor:** Log in, delete `access_token` from localStorage, navigate — should redirect to `/login` (not show blank/broken page).
2. **Login errors:** Try logging in with wrong password — specific error from server should appear.
3. **Follow rejection:** Accept/reject a follow request on the profile page — follower count should update immediately.
4. **N+1 / chat:** Open `/chat` with several chats — no `LazyInitializationException` in backend logs.
5. **Build/lint:** `npm run lint` and `npm run build` pass with 0 errors.
