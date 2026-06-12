import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Profile {
  name: string;
  university: string;
  major: string;
  semester: string;
  concerns: string;
  interests: string;
}

const DEFAULT_PROFILE: Profile = {
  name: "",
  university: "",
  major: "",
  semester: "",
  concerns: "",
  interests: "",
};

interface ProfileStoreValue {
  profile: Profile;
  updateProfile: (profile: Profile) => void;
}

const ProfileContext = createContext<ProfileStoreValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  const value = useMemo<ProfileStoreValue>(
    () => ({
      profile,
      updateProfile: (next) => setProfile(next),
    }),
    [profile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
