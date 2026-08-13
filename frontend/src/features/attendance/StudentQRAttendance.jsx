import { useState, useEffect, useRef } from'react';
import { QrCode, Scan, AlertCircle, CheckCircle2 } from'lucide-react';
import { motion, AnimatePresence } from'framer-motion';
import { Scanner } from'@yudiel/react-qr-scanner';
import QRCode from'react-qr-code';
import { useAuth } from'../../context/AuthContext';
import { useScanManagerQR, useRequestGuestPermission } from'../../hooks/mutations/useAttendanceMutations';
import toast from'react-hot-toast';

export default function StudentQRAttendance() {
 const { user } = useAuth();
 const [isScanning, setIsScanning] = useState(false);
 const [scanResult, setScanResult] = useState(null);
 const [crossHostelPrompt, setCrossHostelPrompt] = useState(null);
 const [waitingForManager, setWaitingForManager] = useState(false);
 const [successRecord, setSuccessRecord] = useState(null);

 const { mutateAsync: scanManagerQR } = useScanManagerQR();
 const { mutateAsync: requestPermission } = useRequestGuestPermission();

 const handleScan = async (result) => {
 if (!result || result.length === 0 || scanResult) return;
 
 const scannedText = result[0].rawValue;
 setScanResult(scannedText); // block multiple scans
 const toastId = toast.loading('Verifying QR Code...');

 let qrData;
 try {
 qrData = JSON.parse(scannedText);
 if (!qrData.h || !qrData.s) throw new Error('Invalid QR Data');
 } catch (e) {
 toast.error('Invalid QR code format.', { id: toastId });
 setTimeout(() => setScanResult(null), 2000);
 return;
 }

 if (!navigator.geolocation) {
 toast.error('Geolocation is not supported by your browser.', { id: toastId });
 setTimeout(() => setScanResult(null), 2000);
 return;
 }

 navigator.geolocation.getCurrentPosition(
 async (position) => {
 try {
 const res = await scanManagerQR({ 
 h: qrData.h, 
 s: qrData.s, 
 lat: position.coords.latitude, 
 lng: position.coords.longitude 
 });

 if (res.status ==='requires_permission') {
 toast.dismiss(toastId);
 setCrossHostelPrompt(res);
 } else if (res.success || res.status ==='success') {
 toast.success(`Present for ${res.record?.mealType || res.data?.mealType ||'Meal'}!`, { id: toastId });
 setSuccessRecord(res.record || res.data);
 } else {
 toast.error('Invalid response from server.', { id: toastId });
 setTimeout(() => setScanResult(null), 2000);
 }
 } catch (error) {
 toast.dismiss(toastId);
 setTimeout(() => setScanResult(null), 2000);
 }
 },
 (geoError) => {
 toast.error('Location access is required for attendance.', { id: toastId });
 setTimeout(() => setScanResult(null), 2000);
 }
 );
 };

 const handleRequestPermission = async (managerHostelId, reason) => {
 setCrossHostelPrompt(null);
 setWaitingForManager(true);
 
 try {
 await requestPermission({ managerHostelId, reason });
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

 const handleCloseSuccess = () => {
 setSuccessRecord(null);
 setScanResult(null);
 setIsScanning(false);
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
 err.name ==='NotAllowedError'
 ?'Camera access denied. Please grant permissions.'
 :'Camera unavailable. (Requires HTTPS or localhost on mobile)'
 );
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center mb-6">
 <div>
 <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">QR Attendance</h2>
 <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">Scan the Mess QR or show your code.</p>
 </div>
 </div>

 <div className="flex flex-col items-center justify-center space-y-6">
 <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl flex flex-col items-center w-full max-w-md">
 <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center min-w-[200px] min-h-[200px]">
 <QRCode value={studentQRValue} size={200} className="w-48 h-48"/>
 </div>
 <p className="mt-6 text-zinc-900 dark:text-zinc-50 font-bold text-xl tracking-tight">{user?.name}</p>
 <p className="text-zinc-500 dark:text-zinc-400 font-medium font-mono text-sm mt-1">{user?.id}</p>
 <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-3 text-center">Show this to the mess manager<br/>to mark attendance.</p>
 </div>

 <button
 onClick={handleStartScan}
 className="flex items-center justify-center gap-2 w-full max-w-md py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
 >
 <Scan className="w-4 h-4"/>
 Scan Manager QR
 </button>
 </div>

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
 
 <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6">Scan Manager QR</h3>
 
 <div className="w-full aspect-square bg-black rounded-xl overflow-hidden relative flex items-center justify-center mb-6">
 
 {waitingForManager ? (
 <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 flex flex-col items-center justify-center z-20 p-6 text-center">
 <CheckCircle2 className="w-16 h-16 text-green-500 mb-4"/>
 <p className="text-zinc-900 dark:text-zinc-50 font-bold text-lg">Request Sent!</p>
 <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Wait for manager to accept.</p>
 </div>
 ) : crossHostelPrompt ? (
 <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 flex flex-col items-center justify-center z-20 p-6 text-center">
 <AlertCircle className="w-12 h-12 text-amber-500 mb-3"/>
 <p className="text-zinc-900 dark:text-zinc-50 font-bold">Permission Required</p>
 <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 mb-4">{crossHostelPrompt.message}</p>
 <div className="flex gap-2 w-full">
 <button 
 onClick={() => handleRequestPermission(crossHostelPrompt.managerHostelId, crossHostelPrompt.reason)} 
 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
 >
 Request
 </button>
 <button 
 onClick={handleCancelPermission} 
 className="flex-1 bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 py-2.5 rounded-lg text-sm font-semibold transition-colors"
 >
 Cancel
 </button>
 </div>
 </div>
 ) : successRecord ? (
 <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 flex flex-col items-center justify-center z-20 p-6 text-center">
 <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4">
 <CheckCircle2 className="w-8 h-8 text-green-500"/>
 </div>
 <p className="text-zinc-900 dark:text-zinc-50 font-bold text-xl mb-1">Attendance Marked!</p>
 <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Show this screen to the manager if their device hasn't updated.</p>
 
 <div className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 mb-6 text-left">
 <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Meal Details</p>
 <div className="flex justify-between items-center mb-1">
 <span className="text-xs text-zinc-500 dark:text-zinc-400">Meal</span>
 <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{successRecord.mealType} - {successRecord.mealInfo?.name ||'Meal'}</span>
 </div>
 <div className="flex justify-between items-center mb-1">
 <span className="text-xs text-zinc-500 dark:text-zinc-400">Reserved</span>
 <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{successRecord.selection?.count || 0}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-xs text-zinc-500 dark:text-zinc-400">Eaten</span>
 <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{successRecord.attendance?.count || 1}</span>
 </div>
 </div>

 <button 
 onClick={handleCloseSuccess} 
 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-semibold transition-colors"
 >
 Done
 </button>
 </div>
 ) : scanResult ? (
 <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
 <div className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-700 border-t-blue-600 rounded-full animate-spin"/>
 </div>
 ) : (
 <div className="w-full h-full relative">
 <Scanner
 onScan={handleScan}
 onError={(err) => console.error(err)}
 styles={{
 container: { width:'100%', height:'100%', borderRadius:'0.75rem'},
 video: { objectFit:'cover'}
 }}
 components={{
 tracker: true,
 audio: false,
 onOff: false
 }}
 />
 {/* Minimalist framing corners */}
 <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/50 pointer-events-none z-10"/>
 <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/50 pointer-events-none z-10"/>
 <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50 pointer-events-none z-10"/>
 <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/50 pointer-events-none z-10"/>
 </div>
 )}
 </div>
 <div className="text-center">
 <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
 Align manager's QR code within the frame
 </p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
