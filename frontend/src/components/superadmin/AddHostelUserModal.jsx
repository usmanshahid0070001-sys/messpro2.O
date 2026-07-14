import { useState, useEffect, useRef, useId } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useAddHostelUser } from '../../hooks/mutations/useSuperadminMutations';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_FORM = {
  name: '',
  email: '',
  role: 'manager',
};

export default function AddHostelUserModal({ isOpen, onClose, hostel }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const nameInputRef = useRef(null);
  const formId = useId();

  const addMutation = useAddHostelUser();

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM);
      setTouched({});
      setSuccessMessage('');
      addMutation.reset();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => nameInputRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const nameError = touched.name && !formData.name.trim() ? 'Name is required' : null;
  const emailError = touched.email && (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) ? 'Valid email is required' : null;

  const isFormValid = formData.name.trim() && formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (!isFormValid || !hostel) return;

    addMutation.mutate(
      { id: hostel._id, userData: formData },
      {
        onSuccess: (response) => {
          setSuccessMessage(`User created successfully. A temporary password has been emailed to ${response.data.email}.`);
          setFormData(INITIAL_FORM);
          setTouched({});
        }
      }
    );
  };

  const mutationError = addMutation.error;
  const isLoading = addMutation.isPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            key="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col border border-[#e5e5e5] dark:border-[#222222] overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
              <div className="min-w-0">
                <h2 id="user-modal-title" className="text-lg font-bold text-[#111111] dark:text-white truncate">
                  Add User
                </h2>
                <p className="text-[13px] font-medium text-[#737373] dark:text-[#888888] mt-0.5 truncate">
                  {hostel?.name || 'Loading hostel...'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-2 rounded-lg text-[#a3a3a3] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="overflow-y-auto flex-1 min-h-0 [scrollbar-width:thin]">
              {successMessage ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-2">Success!</h3>
                  <p className="text-sm font-medium text-[#737373] dark:text-[#a0a0a0] mb-6">
                    {successMessage}
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-black/80 dark:hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form id={formId} onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 space-y-5">
                  <div className="space-y-1.5 flex flex-col">
                    <label htmlFor="user-role" className="block text-sm font-semibold text-[#111111] dark:text-white">
                      Role
                    </label>
                    <select
                      id="user-role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#222222] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label htmlFor="user-name" className="block text-sm font-semibold text-[#111111] dark:text-white">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      id="user-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={!!nameError}
                      className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#c4c4c4] dark:placeholder:text-[#444444] focus:outline-none focus:ring-1 transition-all ${
                        nameError
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                          : 'border-[#e5e5e5] dark:border-[#222222] focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white'
                      }`}
                      placeholder="e.g. John Doe"
                    />
                    <p className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${nameError ? 'opacity-100' : 'opacity-0 select-none'} h-[16px]`}>
                      {nameError && <AlertCircle className="w-3 h-3" />} {nameError}
                    </p>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label htmlFor="user-email" className="block text-sm font-semibold text-[#111111] dark:text-white">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="user-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={!!emailError}
                      className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#c4c4c4] dark:placeholder:text-[#444444] focus:outline-none focus:ring-1 transition-all ${
                        emailError
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                          : 'border-[#e5e5e5] dark:border-[#222222] focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white'
                      }`}
                      placeholder="john@example.com"
                    />
                    <p className={`text-[11px] font-medium text-red-500 flex items-center gap-1 transition-opacity duration-200 ${emailError ? 'opacity-100' : 'opacity-0 select-none'} h-[16px]`}>
                      {emailError && <AlertCircle className="w-3 h-3" />} {emailError}
                    </p>
                  </div>

                  {mutationError && (
                    <div className="p-3 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{mutationError.response?.data?.message || mutationError.message || 'Something went wrong. Please try again.'}</span>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer Actions */}
            {!successMessage && (
              <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-[#f0f0f0] dark:border-[#1a1a1a] bg-[#fafafa]/80 dark:bg-[#111111]/60 backdrop-blur-sm flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#404040] dark:text-[#dddddd] hover:bg-[#e5e5e5] dark:hover:bg-[#222222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
                >
                  Cancel
                </button>
                <button
                  form={formId}
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[132px] px-5 py-2 rounded-xl text-sm font-semibold bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-black/80 dark:hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0a0a0a]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add User'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
