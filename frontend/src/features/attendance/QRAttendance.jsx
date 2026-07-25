import { useState } from 'react';
import { QrCode, Scan, Camera, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import QRCode from 'react-qr-code';

export default function QRAttendance() {
  const [activeMode, setActiveMode] = useState('display'); // 'display' or 'scan'
  const [scanResult, setScanResult] = useState(null);

  // Generate a random ID for today's display QR (just as an example, this should come from backend)
  const todayQRValue = "attendance-session-12345";

  const handleScan = (result) => {
    if (result && result.length > 0) {
      setScanResult(result[0].rawValue);
      // Here you would typically make an API call to mark the student present
      setTimeout(() => setScanResult(null), 3000); // Clear after 3 seconds
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 inline-flex">
          <button
            onClick={() => setActiveMode('display')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeMode === 'display'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Display QR
          </button>
          <button
            onClick={() => setActiveMode('scan')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeMode === 'scan'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scan className="w-4 h-4" />
            Scan Student QR
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeMode === 'display' ? (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-black/20 flex flex-col items-center border-[8px] border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 opacity-50 pointer-events-none" />
              <div className="relative z-10 p-4 bg-white rounded-2xl shadow-inner border border-gray-100">
                <QRCode value={todayQRValue} size={256} className="w-64 h-64" />
              </div>
              <p className="mt-6 text-gray-800 font-bold text-xl tracking-tight z-10">Scan for Today's Attendance</p>
              <p className="text-gray-500 text-sm mt-1 z-10">Point student app scanner here</p>
            </div>
            
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
              <Download className="w-5 h-5 text-gray-400" />
              <span>Download Printable Version</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <div className="glass-panel p-8 rounded-3xl max-w-lg w-full flex flex-col items-center relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 pointer-events-none" />
              
              <div className="w-full aspect-video bg-black rounded-2xl border border-white/10 relative flex items-center justify-center overflow-hidden mb-6 shadow-inner">
                {scanResult ? (
                  <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                    <p className="text-white font-bold text-lg">Student Marked Present!</p>
                    <p className="text-emerald-200 text-sm mt-1 break-all px-4 text-center">{scanResult}</p>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <Scanner
                      onScan={handleScan}
                      onError={(err) => console.error(err)}
                      styles={{
                        container: { width: '100%', height: '100%', borderRadius: '1rem' },
                        video: { objectFit: 'cover' }
                      }}
                      components={{
                        tracker: true,
                        audio: false,
                        onOff: false
                      }}
                    />
                    {/* Scanner Corner Marks */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl opacity-70 pointer-events-none z-10" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl opacity-70 pointer-events-none z-10" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl opacity-70 pointer-events-none z-10" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl opacity-70 pointer-events-none z-10" />
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2 z-10">
                <h3 className="text-xl font-bold text-white">Position QR Code within frame</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  Hold the student's QR code steady in front of the camera to mark their attendance.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl max-w-lg text-amber-200/90 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p>Camera permissions are required. Ensure your browser allows access to the camera to use this feature.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
