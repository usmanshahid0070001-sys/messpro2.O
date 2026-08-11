import { useState, useRef } from'react';
import { UploadCloud, FileText, CheckCircle2, XCircle, FileSpreadsheet, RefreshCw, Download } from'lucide-react';
import { motion, AnimatePresence } from'framer-motion';
import Papa from'papaparse';

export default function BiometricAttendance() {
 const [dragActive, setDragActive] = useState(false);
 const [file, setFile] = useState(null);
 const [isProcessing, setIsProcessing] = useState(false);
 const [uploadStatus, setUploadStatus] = useState(null); //'success'or'error'or null
 const [parsedData, setParsedData] = useState(null);
 const inputRef = useRef(null);

 const handleDrag = (e) => {
 e.preventDefault();
 e.stopPropagation();
 if (e.type ==="dragenter"|| e.type ==="dragover") {
 setDragActive(true);
 } else if (e.type ==="dragleave") {
 setDragActive(false);
 }
 };

 const handleDrop = (e) => {
 e.preventDefault();
 e.stopPropagation();
 setDragActive(false);
 if (e.dataTransfer.files && e.dataTransfer.files[0]) {
 handleFile(e.dataTransfer.files[0]);
 }
 };

 const handleChange = (e) => {
 e.preventDefault();
 if (e.target.files && e.target.files[0]) {
 handleFile(e.target.files[0]);
 }
 };

 const handleFile = (uploadedFile) => {
 // Check if file is csv or excel
 const validTypes = [
'text/csv', 
'application/vnd.ms-excel', 
'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
 ];
 
 if (validTypes.includes(uploadedFile.type) || uploadedFile.name.match(/\.(csv|xls|xlsx)$/i)) {
 setFile(uploadedFile);
 setUploadStatus(null);
 } else {
 alert("Please upload a valid CSV or Excel file.");
 }
 };

 const removeFile = () => {
 setFile(null);
 setUploadStatus(null);
 setParsedData(null);
 if (inputRef.current) inputRef.current.value ="";
 };

 const processFile = () => {
 setIsProcessing(true);
 
 if (file.name.match(/\.csv$/i)) {
 Papa.parse(file, {
 header: true,
 skipEmptyLines: true,
 complete: (results) => {
 setParsedData(results.data);
 setIsProcessing(false);
 setUploadStatus('success');
 },
 error: (error) => {
 console.error(error);
 setIsProcessing(false);
 alert("Error parsing CSV");
 }
 });
 } else {
 // Simulate processing for excel for now
 setTimeout(() => {
 setIsProcessing(false);
 setUploadStatus('success');
 setParsedData([{"Student ID":"123","Status":"Present"}]);
 }, 1500);
 }
 };

 return (
 <div className="space-y-6">
 <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-8 flex items-start gap-4">
 <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm">
 <FileSpreadsheet className="w-6 h-6 text-zinc-500 dark:text-zinc-400"/>
 </div>
 <div>
 <h3 className="text-zinc-900 dark:text-zinc-50 font-bold text-lg">Biometric Machine Sync</h3>
 <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 max-w-2xl font-medium">
 Upload the attendance log exported from your hostel's biometric machine. 
 We support standard CSV and Excel formats. The system will automatically map students based on their Registration ID or Fingerprint ID.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Upload Zone */}
 <div className="bg-zinc-50 dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group h-[400px] flex flex-col justify-center">
 <AnimatePresence mode="wait">
 {!file ? (
 <motion.div 
 key="upload"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className={`absolute inset-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
 dragActive 
 ?"border-blue-500 bg-blue-50 dark:bg-blue-950/20"
 :"border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 hover:border-blue-300 dark:hover:border-blue-700/50"
 }`}
 onDragEnter={handleDrag}
 onDragLeave={handleDrag}
 onDragOver={handleDrag}
 onDrop={handleDrop}
 onClick={() => inputRef.current?.click()}
 >
 <input
 ref={inputRef}
 type="file"
 className="hidden"
 accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
 onChange={handleChange}
 />
 
 <div className={`p-4 rounded-full mb-4 transition-all duration-300 border ${
 dragActive 
 ?'scale-110 bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800'
 :'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700'
 }`}>
 <UploadCloud className={`w-8 h-8 ${dragActive ?'text-blue-600 dark:text-blue-400':'text-zinc-500 dark:text-zinc-400'}`} />
 </div>
 
 <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">
 {dragActive ?"Drop file here":"Click or drag file to upload"}
 </h4>
 <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto">
 Upload CSV or Excel files containing the attendance log. Max file size: 10MB.
 </p>
 
 <button className="px-6 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm transition-colors pointer-events-none">
 Select File
 </button>
 </motion.div>
 ) : (
 <motion.div 
 key="file-preview"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="absolute inset-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
 >
 {uploadStatus ==='success'? (
 <div className="flex flex-col items-center">
 <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-full flex items-center justify-center mb-6">
 <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500"/>
 </div>
 <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Upload Successful</h3>
 <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8 text-sm max-w-xs">
 The attendance log has been successfully processed. Found <strong className="text-zinc-900 dark:text-zinc-200">{parsedData?.length || 0}</strong> records.
 </p>
 <button 
 onClick={removeFile}
 className="px-6 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold shadow-sm"
 >
 Upload Another File
 </button>
 </div>
 ) : (
 <div className="w-full max-w-sm">
 <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 flex items-center gap-4 border border-zinc-200 dark:border-zinc-700 shadow-sm mb-8">
 <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
 <FileText className="w-6 h-6 text-zinc-500 dark:text-zinc-400"/>
 </div>
 <div className="flex-1 text-left min-w-0">
 <h4 className="text-zinc-900 dark:text-zinc-50 font-bold truncate text-sm">{file.name}</h4>
 <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
 </div>
 {!isProcessing && (
 <button onClick={removeFile} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors">
 <XCircle className="w-5 h-5"/>
 </button>
 )}
 </div>
 
 <button
 onClick={processFile}
 disabled={isProcessing}
 className={`w-full py-3 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
 isProcessing 
 ?'bg-blue-400 dark:bg-blue-800 cursor-not-allowed'
 :'bg-blue-600 hover:bg-blue-700'
 }`}
 >
 {isProcessing ? (
 <>
 <RefreshCw className="w-4 h-4 animate-spin"/>
 Processing Data...
 </>
 ) : (
 <>
 <UploadCloud className="w-4 h-4"/>
 Process Attendance Log
 </>
 )}
 </button>
 </div>
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Instructions / Template */}
 <div className="bg-zinc-100 dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 h-[400px] flex flex-col shadow-sm">
 <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6">Instructions</h3>
 
 <div className="space-y-4 flex-1">
 <div className="flex gap-4 items-start">
 <div className="w-6 h-6 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-50 font-bold text-xs shrink-0 shadow-sm">1</div>
 <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm pt-0.5">Export the attendance log from your biometric machine. Ensure it contains student IDs and timestamps.</p>
 </div>
 <div className="flex gap-4 items-start">
 <div className="w-6 h-6 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-50 font-bold text-xs shrink-0 shadow-sm">2</div>
 <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm pt-0.5">Save the exported file as a .CSV or .XLSX format on your computer.</p>
 </div>
 <div className="flex gap-4 items-start">
 <div className="w-6 h-6 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-50 font-bold text-xs shrink-0 shadow-sm">3</div>
 <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm pt-0.5">Upload the file here. Our system will automatically read the columns and map them to your active students.</p>
 </div>
 </div>
 
 <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
 <p className="text-zinc-400 dark:text-zinc-500 font-medium text-sm mb-4">Need help formatting? Download our template.</p>
 <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold shadow-sm text-sm">
 <Download className="w-4 h-4"/>
 Download Example Template
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
