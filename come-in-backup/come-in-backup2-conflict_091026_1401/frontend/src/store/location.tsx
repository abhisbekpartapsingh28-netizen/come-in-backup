import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";

type LocationContextValue = {
  location: string;
  setLocation: (val: string) => void;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

const STORAGE_KEY = "@comein_location_v1";
const DEFAULT_LOCATION = "Set delivery location";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<string>(DEFAULT_LOCATION);

  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.getItem<string>(STORAGE_KEY, "");
        if (typeof saved === "string" && saved.length > 0) {
          setLocationState(saved);
          return;
        }
        // Legacy builds wrote the location as a raw (non-JSON) string via
        // AsyncStorage. Pull it directly once so we don't lose that data,
        // then rewrite it through the shared storage util going forward.
        const legacy = await AsyncStorage.getItem(STORAGE_KEY);
        if (legacy && legacy.length > 0 && legacy !== DEFAULT_LOCATION) {
          setLocationState(legacy);
          await storage.setItem(STORAGE_KEY, legacy);
        }
      } catch {}
    })();
  }, []);

  const setLocation = useCallback((val: string) => {
    const trimmed = val.trim();
    const next = trimmed.length ? trimmed : DEFAULT_LOCATION;
    setLocationState(next);
    storage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationCtx() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationCtx must be used within LocationProvider");
  return ctx;
}
