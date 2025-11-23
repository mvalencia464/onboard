import React, { useEffect, useState } from 'react';
import { Scan, Database, Globe, CheckCircle2, Loader2 } from 'lucide-react';

interface ScanningStepProps {
  businessName: string;
}

const ScanningStep: React.FC<ScanningStepProps> = ({ businessName }) => {
  const [status, setStatus] = useState('Initializing scan...');
  const [progress, setProgress] = useState(0);

  // Simulate the visual progress of the scan steps
  useEffect(() => {
    const steps = [
      { pct: 10, msg: `Locating "${businessName}" on Google Maps...` },
      { pct: 30, msg: 'Analyzing Google Business Profile categories...' },
      { pct: 50, msg: 'Extracting service keywords and reviews...' },
      { pct: 70, msg: 'Identifying local competitors and SEO opportunities...' },
      { pct: 90, msg: 'Generating website skeleton and copy...' },
      { pct: 100, msg: 'Finalizing data model...' },
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus(steps[currentStep].msg);
        setProgress(steps[currentStep].pct);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800); // Slightly faster than real time to feel snappy but substantial

    return () => clearInterval(interval);
  }, [businessName]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-stone text-white p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-brand-orange/30 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-4 border-brand-orange rounded-full"></div>
          <Scan className="w-10 h-10 text-white animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">Building Skeleton</h2>
          <p className="text-gray-400 h-6 transition-all duration-300">{status}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-brand-orange h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Simulated Data Points Found */}
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mt-8 opacity-75">
          <div className="flex flex-col items-center gap-2">
            <Globe className={`w-5 h-5 ${progress > 30 ? 'text-green-500' : 'text-gray-600'}`} />
            <span>Web Presence</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Database className={`w-5 h-5 ${progress > 60 ? 'text-green-500' : 'text-gray-600'}`} />
            <span>Services</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 ${progress > 90 ? 'text-green-500' : 'text-gray-600'}`} />
            <span>SEO Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanningStep;