import React, { useEffect, useRef } from'react';

const ConfirmationCard = ({ 
 isOpen, 
 onClose, 
 onConfirm, 
 title ="Confirm Action", 
 message ="Are you sure you want to proceed?", 
 confirmText ="Confirm", 
 cancelText ="Cancel",
 variant ='danger', //'danger'|'primary'
 isPending = false
}) => {
 const dialogRef = useRef(null);

 useEffect(() => {
 if (!isOpen) return;

 const handleKeyDown = (e) => {
 if (e.key ==='Escape') onClose();
 };
 document.addEventListener('keydown', handleKeyDown);

 const originalOverflow = document.body.style.overflow;
 document.body.style.overflow ='hidden';

 return () => {
 document.removeEventListener('keydown', handleKeyDown);
 document.body.style.overflow = originalOverflow;
 };
 }, [isOpen, onClose]);

 if (!isOpen) return null;

 const isDanger = variant ==='danger';

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"role="dialog"aria-modal="true"aria-labelledby="confirmation-title">
 {/* Backdrop overlay */}
 <div className="fixed inset-0 transition-opacity bg-zinc-950/75 dark:bg-black/80 backdrop-blur-sm"onClick={onClose}></div>

 {/* Modal Card */}
 <div
 ref={dialogRef}
 className="relative flex flex-col w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out"
 >
 <div className="px-6 py-5 sm:p-6">
 <div className="sm:flex sm:items-start">
 {isDanger ? (
 <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10">
 <svg className="h-6 w-6 text-red-600 dark:text-red-400"fill="none"viewBox="0 0 24 24"strokeWidth="1.5"stroke="currentColor"aria-hidden="true">
 <path strokeLinecap="round"strokeLinejoin="round"d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
 </svg>
 </div>
 ) : (
 <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 sm:mx-0 sm:h-10 sm:w-10">
 <svg className="h-6 w-6 text-blue-600 dark:text-blue-400"fill="none"viewBox="0 0 24 24"strokeWidth="1.5"stroke="currentColor"aria-hidden="true">
 <path strokeLinecap="round"strokeLinejoin="round"d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
 </svg>
 </div>
 )}
 
 <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
 <h3 id="confirmation-title"className="text-lg font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
 {title}
 </h3>
 <div className="mt-2">
 <p className="text-sm text-zinc-500 dark:text-zinc-400">
 {message}
 </p>
 </div>
 </div>
 </div>
 </div>
 
 {/* Footer */}
 <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 disabled={isPending}
 className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 transition-all duration-200 ease-out active:scale-[0.98]"
 >
 {cancelText}
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isPending}
 className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out active:scale-[0.98] ${
 isDanger 
 ?'bg-red-600 hover:bg-red-500 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-500'
 :'bg-zinc-900 hover:bg-zinc-800 focus:ring-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50'
 }`}
 >
 {isPending ?'Processing...': confirmText}
 </button>
 </div>
 </div>
 </div>
 );
};

export default ConfirmationCard;
