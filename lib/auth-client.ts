"use client";

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

// Simple auth client functions
export const signIn = {
  email: async ({
    email,
    password,
    callbackURL,
  }: {
    email: string;
    password: string;
    callbackURL?: string;
  }) => {
    // Simulate login
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },
  social: async ({
    provider,
    callbackURL,
  }: {
    provider: string;
    callbackURL?: string;
  }) => {
    // Simulate social login
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },
};

export const signUp = {
  email: async ({
    email,
    password,
    name,
    callbackURL,
  }: {
    email: string;
    password: string;
    name: string;
    callbackURL?: string;
  }) => {
    // Simulate signup
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },
};

export const signOut = async () => {
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("currentUser");
  window.location.href = "/";
};

export const useSession = () => {
  if (typeof window === "undefined") return { data: null, status: "loading" };

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const currentUser = localStorage.getItem("currentUser");

  if (currentUser) {
    const user = JSON.parse(currentUser);
    return {
      data: {
        user: {
          ...user,
          balance: isAdmin ? 999999 : 1250,
          socialCredit: 100,
        },
        isLoggedIn: true,
      },
      status: "authenticated",
    };
  }

  return { data: null, status: "unauthenticated" };
};

export const getSession = () => {
  if (typeof window === "undefined") return null;

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const currentUser = localStorage.getItem("currentUser");

  if (currentUser) {
    const user = JSON.parse(currentUser);
    return {
      user: {
        ...user,
        balance: isAdmin ? 999999 : 1250,
        socialCredit: 100,
      },
      isLoggedIn: true,
    };
  }

  return null;
};
