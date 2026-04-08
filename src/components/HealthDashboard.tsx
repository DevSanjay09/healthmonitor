import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Heart, Activity, Thermometer, Footprints, Battery, MapPin, 
  AlertTriangle, Signal, Cpu, Zap, BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HealthData, generateInitialData, simulateNextData } from '../services/healthSimulation';
import { SmartWatch3D } from './SmartWatch3D';
import { getHealthInsights } from '../services/geminiService';

export const HealthDashboard = () => {
  const [data, setData] = useState<HealthData>(generateInitialData());
  const [history, setHistory] = useState<HealthData[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = simulateNextData(prev);
        setHistory(h => [...h, next].slice(-30));
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSOS = () => {
    setIsEmergency(true);
    setTimeout(() => setIsEmergency(false), 5000);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const insight = await getHealthInsights(history);
    setAiInsight(insight);
    setIsAnalyzing(false);
  };

  const MetricCard = ({ icon: Icon, label, value, unit, color, trend }: any) => (
    <div className="hardware-card p-4 flex flex-col gap-2 relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}22`, color }}>
          <Icon size={20} />
        </div>
        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">{label}</div>
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-2xl font-bold font-mono">{value}</span>
        <span className="text-xs text-neutral-500">{unit}</span>
      </div>
      <div className="h-1 w-full bg-neutral-800 rounded-full mt-2 overflow-hidden">
        <motion.div 
          className="h-full" 
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (value / (unit === 'BPM' ? 200 : 100)) * 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Header */}
      <header className="lg:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Zap className="text-green-400" />
            VitalsCore <span className="text-neutral-500 font-light">S3</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-1 font-mono">Real-time IoT Health Simulation Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
            <div className={`status-dot ${data.components.gsm === 'connected' ? 'active' : 'inactive'}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">GSM: {data.components.gsm}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
            <Battery size={14} className={data.battery < 20 ? 'text-red-400' : 'text-green-400'} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">{data.battery}%</span>
          </div>
        </div>
      </header>

      {/* Left Column: 3D & Components */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <SmartWatch3D heartRate={data.heartRate} />
        
        <div className="hardware-card p-5">
          <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4">Internal Components</h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(data.components).map(([key, status]) => (
              <div key={key} className="flex justify-between items-center p-2 rounded bg-neutral-900/50 border border-neutral-800/50">
                <div className="flex items-center gap-3">
                  <Cpu size={14} className="text-neutral-500" />
                  <span className="text-xs font-mono uppercase">{key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase">{status}</span>
                  <div className={`status-dot ${status === 'active' || status === 'connected' || status === 'locked' ? 'active' : 'inactive'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSOS}
          className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
        >
          <AlertTriangle size={20} className="group-hover:animate-bounce" />
          Trigger SOS Alert
        </button>
      </div>

      {/* Right Column: Metrics & Graphs */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard icon={Heart} label="Heart Rate" value={data.heartRate} unit="BPM" color="#f87171" />
          <MetricCard icon={Activity} label="SpO2" value={data.spo2} unit="%" color="#60a5fa" />
          <MetricCard icon={Thermometer} label="Temperature" value={data.temperature} unit="°C" color="#fbbf24" />
          <MetricCard icon={Footprints} label="Daily Steps" value={data.steps} unit="Steps" color="#4ade80" />
        </div>

        {/* Real-time Graph */}
        <div className="hardware-card p-6 h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Biometric Trends (Live)</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[10px] text-neutral-400 uppercase">HR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[10px] text-neutral-400 uppercase">SpO2</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#666" fontSize={10} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151619', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
              />
              <Area type="monotone" dataKey="heartRate" stroke="#f87171" fillOpacity={1} fill="url(#colorHR)" strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="spo2" stroke="#60a5fa" fillOpacity={1} fill="url(#colorSpo2)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hardware-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit size={14} className="text-purple-400" />
                Gemini Health AI
              </h3>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-400 px-3 py-1 rounded hover:bg-purple-500 hover:text-white transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Generate Insight'}
              </button>
            </div>
            <div className="min-h-[100px] flex items-center justify-center bg-neutral-900/50 rounded-lg p-4 border border-neutral-800/50">
              {aiInsight ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-neutral-300 leading-relaxed italic"
                >
                  "{aiInsight}"
                </motion.p>
              ) : (
                <p className="text-xs text-neutral-500 font-mono">Click generate to analyze recent trends with Gemini AI.</p>
              )}
            </div>
          </div>

          <div className="hardware-card p-6 flex flex-col gap-4">
            <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} className="text-amber-400" />
              GPS Tracking (NEO-6M)
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-500">LATITUDE</span>
                <span>{data.gps.lat}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-500">LONGITUDE</span>
                <span>{data.gps.lng}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-500">SATELLITES</span>
                <span className="text-amber-400">{data.gps.satellites} Locked</span>
              </div>
              <div className="h-24 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:10px_10px]" />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-neutral-500 mt-8">SIGNAL STABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Overlay */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-red-900/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-md w-full hardware-card p-8 text-center border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
            >
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <AlertTriangle size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 uppercase tracking-tighter">Emergency Alert</h2>
              <p className="text-neutral-300 mb-6">Fall detected or SOS triggered. Sending GPS coordinates to emergency contacts via SIM800L GSM.</p>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-red-400 text-left mb-6">
                <div>&gt; AT+CMGS="+1234567890"</div>
                <div>&gt; EMERGENCY: FALL DETECTED</div>
                <div>&gt; LOC: ${data.gps.lat}, ${data.gps.lng}</div>
                <div className="animate-pulse">_ SENDING...</div>
              </div>
              <button 
                onClick={() => setIsEmergency(false)}
                className="px-8 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-sm"
              >
                Cancel Alert
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
