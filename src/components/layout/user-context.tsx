"use client";

import { createContext, useContext } from "react";

interface UserData {
  name: string;
  email: string;
  avatarColor: string;
  personId: string | null;
  unreadNotifications: number;
}

const UserContext = createContext<UserData>({
  name: "Benutzer",
  email: "",
  avatarColor: "#4A90D9",
  personId: null,
  unreadNotifications: 0,
});

export function UserProvider({
  children,
  userData,
}: {
  children: React.ReactNode;
  userData: UserData;
}) {
  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
