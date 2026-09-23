export const USER_ROLE = {
  owner: 'owner',
  manager: 'manager',
  worker: 'worker',
} as const;

export type TUserRole = keyof typeof USER_ROLE;

export const userSearchableFields = ['name', 'email', 'phone'];
