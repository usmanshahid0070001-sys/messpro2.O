import { useState, useEffect } from 'react';

/**
 * A custom hook to persist form drafts to localStorage to prevent data loss on refresh.
 * 
 * @param {string} key - The unique key for the draft in localStorage.
 * @param {Object} initialValues - The initial state of the form.
 * @returns {[Object, Function, Function]} - Returns [formData, setFormData, clearDraft].
 */
export function useFormDraft(key, initialValues) {
  // Initialize state from localStorage if available, otherwise use initialValues
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading form draft from localStorage', e);
    }
    return initialValues;
  });

  // Save to localStorage whenever formData changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(formData));
    } catch (e) {
      console.warn('Error saving form draft to localStorage', e);
    }
  }, [key, formData]);

  // Function to clear the draft (useful after successful submission)
  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Error clearing form draft from localStorage', e);
    }
    setFormData(initialValues);
  };

  return [formData, setFormData, clearDraft];
}
