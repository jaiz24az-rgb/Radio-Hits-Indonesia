import { useState, useEffect } from 'react';
import { BatteryInfo } from '../types';

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export function useBattery() {
  const [battery, setBattery] = useState<BatteryInfo>({
    supported: false,
    level: 1,
    charging: false,
  });

  const [batterySaverMode, setBatterySaverMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('radio_battery_saver');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let batteryManager: BatteryManager | null = null;
    let updateBatteryFn: (() => void) | null = null;

    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithBattery) : null;

      if (nav && typeof nav.getBattery === 'function') {
        nav.getBattery()
          .then((bm) => {
            if (!bm) return;
            batteryManager = bm;

            const updateBattery = () => {
              try {
                const level = typeof bm.level === 'number' ? bm.level : 1;
                const charging = Boolean(bm.charging);
                const chargingTime = typeof bm.chargingTime === 'number' ? bm.chargingTime : 0;
                const dischargingTime = typeof bm.dischargingTime === 'number' ? bm.dischargingTime : 0;

                setBattery({
                  supported: true,
                  level,
                  charging,
                  chargingTime,
                  dischargingTime,
                });

                // Auto suggest / enable battery saver if battery level is below 20% and not charging
                if (level <= 0.20 && !charging) {
                  setBatterySaverMode((prev) => {
                    if (!prev) {
                      try {
                        localStorage.setItem('radio_battery_saver', JSON.stringify(true));
                      } catch {
                        // ignore
                      }
                    }
                    return true;
                  });
                }
              } catch {
                // ignore
              }
            };

            updateBatteryFn = updateBattery;
            updateBattery();

            try {
              bm.addEventListener('levelchange', updateBattery);
              bm.addEventListener('chargingchange', updateBattery);
            } catch {
              // ignore
            }
          })
          .catch(() => {
            // Battery API blocked or not supported
          });
      }
    } catch {
      // ignore
    }

    return () => {
      if (batteryManager && updateBatteryFn) {
        try {
          batteryManager.removeEventListener('levelchange', updateBatteryFn);
          batteryManager.removeEventListener('chargingchange', updateBatteryFn);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleBatterySaver = (force?: boolean) => {
    const next = force !== undefined ? force : !batterySaverMode;
    setBatterySaverMode(next);
    try {
      localStorage.setItem('radio_battery_saver', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  return {
    battery,
    batterySaverMode,
    toggleBatterySaver,
  };
}
