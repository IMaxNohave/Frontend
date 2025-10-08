export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  balance: number;
  socialCredit: number;
  robloxId?: string;
}

export interface Session {
  user: User;
  isLoggedIn: boolean;
}

// Simple auth functions for server-side
export const auth = {
  $Infer: {
    Session: {} as Session,
    User: {} as User,
  },
};

export type { Session, User };
