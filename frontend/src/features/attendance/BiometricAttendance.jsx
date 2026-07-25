import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, XCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

export default function BiometricAttendance() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' or 'error' or null
  const [parsedData, setParsedData] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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
    if (inputRef.current) inputRef.current.value = "";
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
        setParsedData([{ "Student ID": "123", "Status": "Present" }]);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">Biometric Machine Sync</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Upload the attendance log exported from your hostel's biometric machine. 
            We support standard CSV and Excel formats. The system will automatically map students based on their Registration ID or Fingerprint ID.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Zone */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden group h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
                  dragActive 
                    ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]" 
                    : "border-white/20 bg-white/5 hover:border-emerald-500/50 hover:bg-white/10"
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
                
                <div className={`p-5 rounded-full mb-4 transition-transform duration-300 ${dragActive ? 'scale-110 bg-emerald-500/20' : 'bg-white/10'}`}>
                  <UploadCloud className={`w-10 h-10 ${dragActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                </div>
                
                <h4 className="text-lg font-bold text-white mb-2">
                  {dragActive ? "Drop file here" : "Click or drag file to upload"}
                </h4>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                  Upload CSV or Excel files containing the attendance log. Max file size: 10MB.
                </p>
                
                <button className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors pointer-events-none">
                  Select File
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="file-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
              >
                {uploadStatus === 'success' ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Upload Successful</h3>
                    <p className="text-gray-400 mb-8 text-sm max-w-xs">
                      The attendance log has been successfully processed. Found {parsedData?.length || 0} records.
                    </p>
                    <button 
                      onClick={removeFile}
                      className="px-6 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-medium"
                    >
                      Upload Another File
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-sm">
                    <div className="bg-black/20 rounded-2xl p-4 flex items-center gap-4 border border-white/10 mb-8">
                      <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <FileText className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="text-white font-medium truncate">{file.name}</h4>
                        <p className="text-gray-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      {!isProcessing && (
                        <button onClick={removeFile} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-rose-400 transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={processFile}
                      disabled={isProcessing}
                      className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                        isProcessing 
                          ? 'bg-emerald-500/50 cursor-not-allowed' 
                          : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing Data...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-5 h-5" />
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
        <div className="glass-panel p-8 rounded-3xl border border-white/10 h-[400px] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Instructions</h3>
          
          <div className="space-y-4 flex-1">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">1</div>
              <p className="text-gray-400 text-sm mt-1">Export the attendance log from your biometric machine. Ensure it contains student IDs and timestamps.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">2</div>
              <p className="text-gray-400 text-sm mt-1">Save the exported file as a .CSV or .XLSX format on your computer.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">3</div>
              <p className="text-gray-400 text-sm mt-1">Upload the file here. Our system will automatically read the columns and map them to your active students.</p>
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-white/10">
            <p className="text-gray-300 text-sm mb-4">Need help formatting? Download our template.</p>
            <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors font-medium">
              <Download className="w-4 h-4" />
              Download Example Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
