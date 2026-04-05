import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface SleepTimerContextType {
  activeMinutes: number | null;
  remainingSeconds: number;
  startTimer: (minutes: number) => void;
  cancelTimer: () => void;
}

const SleepTimerContext = createContext<SleepTimerContextType | null>(null);

export const useSleepTimer = () => {
  const ctx = useContext(SleepTimerContext);
  if (!ctx) throw new Error("useSleepTimer must be used within SleepTimerProvider");
  return ctx;
};

export const SleepTimerProvider: React.FC<{
  children: React.ReactNode;
  onTimerEnd: () => void;
}> = ({ children, onTimerEnd }) => {
  const [activeMinutes, setActiveMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimerEndRef = useRef(onTimerEnd);
  onTimerEndRef.current = onTimerEnd;

  const clearInt = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancelTimer = useCallback(() => {
    clearInt();
    setActiveMinutes(null);
    setRemainingSeconds(0);
  }, [clearInt]);

  const startTimer = useCallback((minutes: number) => {
    clearInt();
    const totalSeconds = minutes * 60;
    setActiveMinutes(minutes);
    setRemainingSeconds(totalSeconds);

    const endTime = Date.now() + totalSeconds * 1000;
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      setRemainingSeconds(left);
      if (left <= 0) {
        clearInt();
        setActiveMinutes(null);
        onTimerEndRef.current();
      }
    }, 1000);
  }, [clearInt]);

  useEffect(() => clearInt, [clearInt]);

  return (
    <SleepTimerContext.Provider value={{ activeMinutes, remainingSeconds, startTimer, cancelTimer }}>
      {children}
    </SleepTimerContext.Provider>
  );
};
