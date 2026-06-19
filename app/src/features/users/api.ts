import { client } from '@/api/common/client';

import {
  type DeviceRegistration,
  type DeviceResponse,
  type UserInfo,
  type UserRegistration,
} from './types';

const BASE_USER_URL = '/api/users/me';

export const registerDevice = async (data: DeviceRegistration) => {
  const res = await client.post<DeviceResponse>('/api/users/devices', data);
  return res.data;
};

export const registerUser = async (payload: Partial<UserRegistration>) => {
  const { data } = await client.put(BASE_USER_URL, payload);
  return data;
};

export const getUserInfo = async () => {
  const { data } = await client.get<UserInfo>(BASE_USER_URL);
  return data;
};

export type MembershipStatus = {
  active: boolean;
  membershipEnd: string | null;
};

const pickMembershipEnd = (user: UserInfo | null | undefined): string | null => {
  if (!user) return null;
  return (
    (user.current_plan_end as string | null | undefined) ??
    (user.planExpiry as string | null | undefined) ??
    null
  );
};

/**
 * Single source of truth for "does this user have an active paid plan?".
 * Reads from /api/users/me (which is populated server-side on every
 * successful payment via activateMembership).
 *
 * Returns `{ active, membershipEnd }`. Never throws — a missing user or
 * 401 simply resolves to `{ active: false }` so callers can fall through to
 * the "no membership" screen instead of crashing the navigation stack.
 */
export const checkMembership = async (): Promise<MembershipStatus> => {
  try {
    const user = await getUserInfo();
    const membershipEnd = pickMembershipEnd(user);
    const isPaid = Boolean(user?.isPaid);
    const notExpired =
      membershipEnd !== null && new Date(membershipEnd) > new Date();
    return {
      active: isPaid && notExpired,
      membershipEnd,
    };
  } catch (err: any) {
    const status = err?.response?.status;
    // 401/403/404 — user is signed in via Clerk but has no user record yet,
    // or no membership on the server. Treat as "no membership".
    if (status === 401 || status === 403 || status === 404) {
      return { active: false, membershipEnd: null };
    }
    // Anything else is a real network failure — bubble it up so the caller
    // can show a "try again" UI instead of silently sending the user to
    // /payment and creating the stuck-loop we hit before.
    throw err;
  }
};

export const resetUser = async () => {
  const res = await client.delete<DeviceResponse>(`/api/users/devices/me`);

  return res.data;
};
export const updatePushToken = async (payload: Partial<DeviceRegistration>) => {
  const { data } = await client.put('/api/users/devices', payload);
  return data;
};