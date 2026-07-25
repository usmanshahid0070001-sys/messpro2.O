import { useState, useEffect, useRef } from 'react';
import { QrCode, Scan, Download, AlertCircle, CheckCircle2, XCircle, Timer, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import QRCode from 'react-qr-code';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useGetManagerQR, useGetLiveQRAttendance } from '../../hooks/queries/useAttendanceQueries';
import { useScanStudentQR, useRespondGuestPermission } from '../../hooks/mutations/useAttendanceMutations';
import toast from 'react-hot-toast';

export default function QRAttendance() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(user?.hostelId);
  const { data: qrResponse, isLoading: qrLoading } = useGetManagerQR();
  const { data: liveResponse, isLoading: liveLoading } = useGetLiveQRAttendance();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [recentAttendances, setRecentAttendances] = useState([]);
  
  // Set initial live data
  useEffect(() => {
    if (liveResponse?.data) {
      // Reverse to show newest at top if they are chronologically ordered, or just set it
      setRecentAttendances(liveResponse.data.reverse());
    }
  }, [liveResponse]);
  
  // Real-time Guest Requests from Students
  const [activeGuestRequest, setActiveGuestRequest] = useState(null);
  
  // Local Guest Requests from Manager scanning Outside Student
  const [localGuestPrompt, setLocalGuestPrompt] = useState(null);

  const { mutateAsync: scanStudentQR } = useScanStudentQR();
  const { mutateAsync: respondToGuest } = useRespondGuestPermission();

  const requestTimeoutRef = useRef(null);

  // --- Socket Listeners ---
  useEffect(() => {
    if (!socket) return;

    socket.on('attendance_success', (data) => {
      // Update count if exists, else add to top
      setRecentAttendances(prev => {
        const exists = prev.find(p => p.rollNumber === data.rollNumber);
        if (exists) {
          return prev.map(p => p.rollNumber === data.rollNumber ? { ...p, count: data.count } : p);
        }
        return [data, ...prev];
      });
      toast.success(`${data.name} marked present! (Count: ${data.count || 1})`);
    });

    socket.on('guest_permission_request', (requestData) => {
      setActiveGuestRequest(requestData);
      
      // Auto-cancel after 10 seconds
      if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = setTimeout(() => {
        handleRespondGuest(requestData, false); // auto reject
      }, 10000);
    });

    return () => {
      socket.off('attendance_success');
      socket.off('guest_permission_request');
      if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
    };
  }, [socket]);

  // --- Handlers ---
  const handleRespondGuest = async (requestData, isApproved) => {
    if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
    setActiveGuestRequest(null);

    try {
      await respondToGuest({
        requestId: requestData.requestId,
        studentId: requestData.studentId,
        isApproved
      });
      if (isApproved) {
        setRecentAttendances(prev => [{ ...requestData, isGuest: true, count: 1 }, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManagerRespondLocalGuest = async (isApproved) => {
    const student = localGuestPrompt.student;
    setLocalGuestPrompt(null);
    setScanResult(null);

    if (!isApproved) {
      toast('Guest rejected.', { icon: '🚫' });
      return;
    }

    try {
      const res = await respondToGuest({
        requestId: 'local_' + Date.now(),
        studentId: student._id,
        isApproved: true
      });
      if (res.status === 'success') {
        toast.success(`Guest ${student.name} approved!`);
        const count = res.data?.count || 1;
        setRecentAttendances(prev => [{ name: student.name, rollNumber: student.rollNumber, isGuest: true, count }, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = async (result) => {
    if (!result || result.length === 0 || scanResult) return; // Prevent double scan
    
    const scannedText = result[0].rawValue;
    setScanResult(scannedText); // block further scans

    try {
      // Assuming Student QR just contains their rollNumber (or a JSON with { rollNumber, hostelId })
      // For simplicity, let's say it's just the roll number string, or JSON.
      let studentRollNumber = scannedText;
      try {
        const parsed = JSON.parse(scannedText);
        studentRollNumber = parsed.rollNumber || scannedText;
      } catch (e) {
        // it's just a raw string
      }

      const res = await scanStudentQR({ studentRollNumber });

      if (res.status === 'requires_permission') {
        setLocalGuestPrompt(res);
      } else if (res.status === 'success') {
        toast.success(`Attendance Marked! (Count: ${res.data.count || 1})`);
        
        setRecentAttendances(prev => {
          const exists = prev.find(p => p.rollNumber === studentRollNumber);
          if (exists) {
            return prev.map(p => p.rollNumber === studentRollNumber ? { ...p, count: res.data.count } : p);
          }
          return [{ name: res.data.mealInfo?.name || 'Student', rollNumber: studentRollNumber, isGuest: false, count: res.data.count || 1 }, ...prev];
        });
        
        setTimeout(() => setScanResult(null), 2000);
      } else {
        setTimeout(() => setScanResult(null), 2000);
      }
    } catch (error) {
      setTimeout(() => setScanResult(null), 2000);
    }
  };

  const qrToken = qrResponse?.data?.token;

  return (
    <div className="space-y-6 relative">
      {/* Global Guest Request Overlay */}
      <AnimatePresence>
        {activeGuestRequest && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-gray-900 border border-amber-500/30 shadow-2xl shadow-amber-500/20 rounded-2xl p-5 overflow-hidden"
          >
            {/* Countdown Bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 10, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-amber-500"
            />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-white font-bold text-lg leading-tight">Guest Request</h3>
                <p className="text-gray-400 text-sm mt-1">
                  <strong className="text-gray-200">{activeGuestRequest.name}</strong> ({activeGuestRequest.rollNumber}) from another hostel wants to eat here.
                </p>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => handleRespondGuest(activeGuestRequest, true)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Accept Guest
                  </button>
                  <button 
                    onClick={() => handleRespondGuest(activeGuestRequest, false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: QR Code & Scanner Button */}
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-black/20 flex flex-col items-center border-[8px] border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 opacity-50 pointer-events-none" />
            <div className="relative z-10 p-4 bg-white rounded-2xl shadow-inner border border-gray-100 min-h-[256px] min-w-[256px] flex items-center justify-center">
              {qrLoading ? (
                  <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              ) : qrToken ? (
                <QRCode value={qrToken} size={256} className="w-64 h-64" />
              ) : (
                <p className="text-gray-500">Failed to load QR</p>
              )}
            </div>
            <p className="mt-6 text-gray-800 font-bold text-xl tracking-tight z-10">MessPro Attendance</p>
            <p className="text-gray-500 text-sm mt-1 z-10 flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {isConnected ? 'Live sync active' : 'Connecting...'}
            </p>
          </div>
          
          <button 
            onClick={() => setIsScanning(true)}
            className="flex items-center gap-2 px-8 py-4 mt-4 rounded-xl text-lg font-bold transition-all bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:scale-[1.02] w-full max-w-sm justify-center"
          >
            <Scan className="w-5 h-5" />
            Scan Student QR
          </button>
        </div>

        {/* Right: Live Feed */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-emerald-500" />
              Live Attendances
            </h3>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">
              {recentAttendances.length} total
            </span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {liveLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : recentAttendances.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No attendances yet for this meal.
              </div>
            ) : (
              recentAttendances.map((att, idx) => (
                <motion.div
                  key={idx + '-' + att.rollNumber}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${att.isGuest ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{att.name}</p>
                      <p className="text-gray-400 text-xs">{att.rollNumber}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${att.isGuest ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {att.isGuest ? 'Guest' : 'Present'}
                    </span>
                    {att.count > 1 && (
                      <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Count: {att.count}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
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
              
              <h3 className="text-xl font-bold text-white mb-6">Scan Student QR</h3>

              
              <div className="text-center space-y-2 z-10">
                <p className="text-gray-400 text-sm max-w-sm">
                  Hold the student's QR code steady in front of the camera to mark their attendance.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
