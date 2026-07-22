import { useState } from "react";

export function useSettingsPreferences() {
  const [compact, setCompact] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return {
    compact,
    notifications,
    toggleCompact: () => setCompact((value) => !value),
    toggleNotifications: () => setNotifications((value) => !value),
  };
}
