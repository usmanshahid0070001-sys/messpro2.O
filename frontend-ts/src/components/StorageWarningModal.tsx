import { useEffect, useState } from 'react';
import { isLocalStorageAvailable } from '@/lib/storageCheck';
import { AlertTriangle } from 'lucide-react';

export function StorageWarningModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card text-card-foreground border shadow-lg rounded-xl max-w-md w-full p-6 mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4 text-destructive">
          <AlertTriangle className="w-8 h-8" />
          <h2 className="text-xl font-bold">Local Storage Blocked</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          MessPro requires local storage to keep you logged in and save your preferences. It seems your browser is blocking it.
        </p>
        <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground mb-6">
          <p className="mb-2">If you are using <strong>Microsoft Edge</strong> or <strong>InPrivate/Incognito Browsing</strong>:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Allow cookies and site data for this site.</li>
            <li>Change Tracking Prevention from "Strict" to "Balanced".</li>
            <li>Or add this site to your Tracking Prevention exceptions.</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
        >
          I've enabled it, reload page
        </button>
      </div>
    </div>
  );
}
