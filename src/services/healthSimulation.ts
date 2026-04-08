export interface HealthData {
  timestamp: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  steps: number;
  fallDetected: boolean;
  battery: number;
  gps: {
    lat: number;
    lng: number;
    satellites: number;
  };
  components: {
    max30102: 'active' | 'inactive' | 'error';
    mpu6050: 'active' | 'inactive' | 'error';
    gps: 'active' | 'inactive' | 'locked';
    gsm: 'active' | 'inactive' | 'connected';
  };
}

export const generateInitialData = (): HealthData => ({
  timestamp: new Date().toISOString(),
  heartRate: 72,
  spo2: 98,
  temperature: 36.6,
  steps: 1240,
  fallDetected: false,
  battery: 85,
  gps: {
    lat: 28.6139,
    lng: 77.2090,
    satellites: 8,
  },
  components: {
    max30102: 'active',
    mpu6050: 'active',
    gps: 'locked',
    gsm: 'connected',
  },
});

export const simulateNextData = (prev: HealthData): HealthData => {
  // Circadian rhythm simulation (simplified)
  const now = new Date();
  const hour = now.getHours();
  
  // Base values based on time of day
  let baseHR = 70;
  if (hour >= 23 || hour <= 6) baseHR = 55; // Sleeping
  else if (hour >= 8 && hour <= 10) baseHR = 85; // Morning activity
  else if (hour >= 17 && hour <= 19) baseHR = 110; // Exercise simulation
  
  const hrVariation = Math.floor(Math.random() * 5) - 2;
  const newHR = Math.max(40, Math.min(180, baseHR + hrVariation));
  
  const spo2Variation = Math.random() > 0.9 ? -1 : 0;
  const newSpo2 = Math.max(90, Math.min(100, prev.spo2 + spo2Variation));
  
  const tempVariation = (Math.random() * 0.2) - 0.1;
  const newTemp = Math.max(35.5, Math.min(38.0, prev.temperature + tempVariation));
  
  const newSteps = prev.steps + (hour >= 7 && hour <= 22 ? Math.floor(Math.random() * 10) : 0);
  
  const newBattery = Math.max(0, prev.battery - 0.01);

  return {
    ...prev,
    timestamp: now.toISOString(),
    heartRate: newHR,
    spo2: newSpo2,
    temperature: parseFloat(newTemp.toFixed(1)),
    steps: newSteps,
    battery: parseFloat(newBattery.toFixed(1)),
    gps: {
      ...prev.gps,
      satellites: Math.max(4, Math.min(12, prev.gps.satellites + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
    }
  };
};
