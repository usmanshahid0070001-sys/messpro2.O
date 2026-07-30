import { useState, useEffect, useRef, useMemo } from 'react';
import { QrCode, Scan, Download, AlertCircle, CheckCircle2, XCircle, Timer, User as UserIcon, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
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
  const [filterType, setFilterType] = useState('All'); // 'All' | 'Present' | 'Reserved'
  
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
          return prev.map(p => p.rollNumber === data.rollNumber ? { ...p, attendanceCount: data.count } : p);
        }
        return [{...data, attendanceCount: data.count, selectionCount: data.selectionCount || 0}, ...prev];
      });
      toast.success(`${data.name} marked present! (Count: ${data.count || 1})`, { id: `scan_${data.rollNumber}` });
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = async (result) => {
    if (!result || result.length === 0 || scanResult) return; // Prevent double scan
    
    const scannedText = result[0].rawValue;
    setScanResult(scannedText); // block further scans

    let studentRollNumber = scannedText;
    try {
      const parsed = JSON.parse(scannedText);
      studentRollNumber = parsed.rollNumber || scannedText;
    } catch (e) {
      // it's just a raw string
    }

    const toastId = `scan_${studentRollNumber}`;
    toast.loading('Verifying QR Code...', { id: toastId });

    try {
      const res = await scanStudentQR({ studentRollNumber });

      if (res.status === 'requires_permission') {
        toast.dismiss(toastId);
        setLocalGuestPrompt(res);
      } else if (res.status === 'success') {
        toast.success(`Attendance Marked!`);
        
        setTimeout(() => setScanResult(null), 2000);
      } else {
        toast.error('Invalid response from server.', { id: toastId });
        setTimeout(() => setScanResult(null), 2000);
      }
    } catch (error) {
      toast.dismiss(toastId); // Mutation's onError handles the error toast
      setTimeout(() => setScanResult(null), 2000);
    }
  };

  const handleStartScan = async () => {
    try {
      // Explicitly ask for camera permissions first to catch HTTP/HTTPS issues
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  const qrToken = qrResponse?.data ? JSON.stringify({ h: qrResponse.data.h, s: qrResponse.data.s }) : null;

  const filteredAttendances = useMemo(() => {
    if (filterType === 'Present') {
      return recentAttendances.filter(a => a.attendanceCount > 0);
    }
    if (filterType === 'Reserved') {
      return recentAttendances.filter(a => a.selectionCount > 0);
    }
    return recentAttendances;
  }, [recentAttendances, filterType]);

  const exportToExcel = () => {
    const dataToExport = filteredAttendances.map(a => ({
      Name: a.name,
      'Roll Number': a.rollNumber,
      Status: a.isGuest ? 'Guest' : 'Student',
      Reserved: a.selectionCount || 0,
      'Meals Taken': a.attendanceCount || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'QR_Attendance');
    
    const fileName = `QR_Live_Feed_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6 relative">
      {/* Global Guest Request Overlay */}
      <AnimatePresence>
        {activeGuestRequest && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl rounded-2xl p-5 overflow-hidden"
          >
            {/* Countdown Bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 10, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-amber-500"
            />
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-zinc-900 dark:text-zinc-50 font-bold text-base leading-tight">
                  {activeGuestRequest.reason === 'guest' ? 'Guest Request' : 'Permission Required'}
                </h3>
                {activeGuestRequest.reason === 'unselected' ? (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    <strong className="text-zinc-900 dark:text-zinc-200">{activeGuestRequest.name}</strong> ({activeGuestRequest.rollNumber}) did not reserve this meal. Allow walk-in?
                  </p>
                ) : activeGuestRequest.reason === 'extra_meal' ? (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    <strong className="text-zinc-900 dark:text-zinc-200">{activeGuestRequest.name}</strong> ({activeGuestRequest.rollNumber}) has reached their limit. Allow extra meal?
                  </p>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    <strong className="text-zinc-900 dark:text-zinc-200">{activeGuestRequest.name}</strong> ({activeGuestRequest.rollNumber}) from another hostel wants to eat here.
                  </p>
                )}
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => handleRespondGuest(activeGuestRequest, true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleRespondGuest(activeGuestRequest, false)}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 py-2 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: QR Code & Scanner Button */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl flex flex-col items-center">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center min-w-[200px] min-h-[200px]">
              {qrLoading ? (
                  <div className="w-8 h-8 border-4 border-zinc-100 border-t-zinc-900 dark:border-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
              ) : qrToken ? (
                <QRCode value={qrToken} size={200} className="w-48 h-48" />
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Failed to load QR</p>
              )}
            </div>
            <p className="mt-6 text-zinc-900 dark:text-zinc-50 font-bold text-lg tracking-tight">MessPro Attendance</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                {isConnected ? 'Live sync active' : 'Connecting...'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleStartScan}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Scan className="w-4 h-4" />
            Scan Student QR
          </button>
        </div>

        {/* Right: Live Feed */}
        <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 uppercase tracking-wide">
                <Timer className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                Live Feed
              </h3>
              <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
                {['All', 'Present', 'Reserved'].map(ft => (
                  <button
                    key={ft}
                    onClick={() => setFilterType(ft)}
                    className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                      filterType === ft 
                        ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                    }`}
                  >
                    {ft}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {filteredAttendances.length}
              </span>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg text-xs font-bold uppercase transition-colors border border-emerald-200 dark:border-emerald-800/50"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-zinc-100 dark:divide-zinc-900/50">
            {liveLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50 rounded-full animate-spin" />
              </div>
            ) : filteredAttendances.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                <Filter className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-medium">No records match this filter.</p>
              </div>
            ) : (
              filteredAttendances.map((att, idx) => (
                <motion.div
                  key={idx + '-' + att.rollNumber}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{att.name}</p>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono mt-0.5 truncate">{att.rollNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-4">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${
                      att.isGuest 
                        ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900' 
                        : (att.attendanceCount > 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700')
                    }`}>
                      {att.isGuest ? 'Guest' : (att.attendanceCount > 0 ? 'Present' : 'Not Present')}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase border-r border-zinc-200 dark:border-zinc-700 pr-2">
                        Res: <span className={`font-bold ${att.selectionCount > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-900 dark:text-zinc-200'}`}>{att.selectionCount || 0}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase">
                        Eat: <span className={`font-bold ${att.attendanceCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-200'}`}>{att.attendanceCount || 0}</span>
                      </span>
                    </div>
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
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl relative flex flex-col items-center border border-zinc-200 dark:border-zinc-700 shadow-2xl">
              <button 
                onClick={() => setIsScanning(false)}
                className="absolute top-4 right-4 bg-zinc-100 dark:bg-zinc-900/50 w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors border border-zinc-200 dark:border-zinc-800"
              >
                <span className="text-sm font-bold">✕</span>
              </button>
              
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6">Scan QR</h3>

              <div className="w-full aspect-square bg-black rounded-xl overflow-hidden relative flex items-center justify-center mb-6">
                {scanResult ? (
                  <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <div className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-700 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <Scanner
                      onScan={handleScan}
                      onError={(err) => console.error(err)}
                      styles={{
                        container: { width: '100%', height: '100%', borderRadius: '0.75rem' },
                        video: { objectFit: 'cover' }
                      }}
                      components={{
                        tracker: true,
                        audio: false,
                        onOff: false
                      }}
                    />
                    {/* Minimalist framing corners */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/50 pointer-events-none z-10" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/50 pointer-events-none z-10" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50 pointer-events-none z-10" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/50 pointer-events-none z-10" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                  Align QR code within the frame
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
