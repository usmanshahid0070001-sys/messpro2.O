import { useState, useEffect, useRef } from 'react';
import { QrCode, Scan, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import QRCode from 'react-qr-code';
import { useAuth } from '../../context/AuthContext';
import { useScanManagerQR, useRequestGuestPermission } from '../../hooks/mutations/useAttendanceMutations';
import toast from 'react-hot-toast';

export default function StudentQRAttendance() {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [crossHostelPrompt, setCrossHostelPrompt] = useState(null);
  const [waitingForManager, setWaitingForManager] = useState(false);

  const { mutateAsync: scanManagerQR } = useScanManagerQR();
  const { mutateAsync: requestPermission } = useRequestGuestPermission();

  const handleScan = async (result) => {
    if (!result || result.length === 0 || scanResult) return;
    
    const scannedText = result[0].rawValue;
    setScanResult(scannedText); // block multiple scans

    try {
      const res = await scanManagerQR({ token: scannedText });

      if (res.status === 'requires_permission') {
        setCrossHostelPrompt(res);
      } else if (res.status === 'success') {
        toast.success(`Present for ${res.data.mealType}!`);
        setTimeout(() => setScanResult(null), 2000);
      } else {
        setTimeout(() => setScanResult(null), 2000);
      }
    } catch (error) {
      setTimeout(() => setScanResult(null), 2000);
    }
  };

  const handleRequestPermission = async (managerHostelId) => {
    setCrossHostelPrompt(null);
    setWaitingForManager(true);
    
    try {
      await requestPermission({ managerHostelId });
      toast.success('Request sent! Manager will accept you from their device.', { duration: 5000 });
      // Close the scanner after request
      setTimeout(() => {
        setWaitingForManager(false);
        setScanResult(null);
        setIsScanning(false);
        setCrossHostelPrompt(null);
      }, 2000);
    } catch (err) {
      setWaitingForManager(false);
      setScanResult(null);
    }
  };

  const handleCancelPermission = () => {
    setCrossHostelPrompt(null);
    setScanResult(null);
  };

  // Student's static QR payload (e.g. just their roll number, or a json payload)
  const studentQRValue = JSON.stringify({
    rollNumber: user?.id,
    hostelId: user?.hostelId
  });

  const handleStartScan = async () => {
    try {
      // Explicitly ask for camera permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the test stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setIsScanning(true);
    } catch (err) {
      console.error('Camera permission error:', err);
      toast.error(
        err.name === 'NotAllowedError' 
          ? 'Camera access denied. Please grant permissions.' 
          : 'Camera unavailable. (Requires HTTPS or localhost on mobile)'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">QR Attendance</h2>
          <p className="text-gray-400 mt-1">Scan the Mess QR or show your code.</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-black/20 flex flex-col items-center border-[8px] border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 opacity-50 pointer-events-none" />
          <div className="relative z-10 p-4 bg-white rounded-2xl shadow-inner border border-gray-100">
            <QRCode value={studentQRValue} size={256} className="w-64 h-64" />
          </div>
          <p className="mt-6 text-gray-800 font-bold text-xl tracking-tight z-10">{user?.name}</p>
          <p className="text-gray-500 font-medium z-10">{user?.id}</p>
          <p className="text-gray-400 text-xs mt-2 z-10">Show this to the mess manager to mark attendance.</p>
        </div>

        <button
          onClick={handleStartScan}
          className="flex items-center gap-2 px-8 py-4 mt-4 rounded-xl text-lg font-bold transition-all bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:scale-[1.02]"
        >
          <Scan className="w-5 h-5" />
          Scan Manager QR
        </button>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-lg glass-panel p-6 rounded-3xl relative flex flex-col items-center border border-white/10 shadow-2xl">
              <button 
                onClick={() => setIsScanning(false)}
                className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors z-30"
              >
                <AlertCircle className="w-5 h-5 hidden" />
                <span className="text-sm font-bold px-1">✕</span>
              </button>
              
              <h3 className="text-xl font-bold text-white mb-6">Scan Manager QR</h3>
              
              <div className="w-full aspect-square md:aspect-video bg-black rounded-2xl border border-white/10 relative flex items-center justify-center overflow-hidden mb-6 shadow-inner">
                
                {waitingForManager ? (
                  <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-20 p-6 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                    <p className="text-white font-bold text-lg">Request Sent!</p>
                    <p className="text-gray-400 text-sm mt-1">Wait for manager to accept.</p>
                  </div>
                ) : crossHostelPrompt ? (
                  <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-20 p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
                    <p className="text-white font-bold">Different Hostel Detected</p>
                    <p className="text-gray-300 text-sm mt-1 mb-4">Ask manager for permission?</p>
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => handleRequestPermission(crossHostelPrompt.managerHostelId)} 
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm transition-colors"
                      >
                        Request
                      </button>
                      <button 
                        onClick={handleCancelPermission} 
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : scanResult ? (
                  <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
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
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl opacity-70 pointer-events-none z-10" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl opacity-70 pointer-events-none z-10" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl opacity-70 pointer-events-none z-10" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl opacity-70 pointer-events-none z-10" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
