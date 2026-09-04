import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Mail,
  Phone,
  HelpCircle,
  Check,
  Loader2,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateUser } from '@/hooks/mutations/useUserMutations';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { setCredentials } from '@/store/slices/AuthSlice';
import { toast } from 'sonner';

interface SuperadminSupportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactItem {
  key: string;
  value: string;
}

export const SuperadminSupportContactsModal: React.FC<SuperadminSupportContactsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const currentUser = auth.user;
  const token = auth.token;

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const { mutateAsync: updateUser, isPending: isSaving } = useUpdateUser();

  // Populate from current user's additionalInfo
  useEffect(() => {
    if (isOpen && currentUser) {
      if (Array.isArray(currentUser.additionalInfo) && currentUser.additionalInfo.length > 0) {
        setContacts(currentUser.additionalInfo.map((i) => ({ key: i.key, value: i.value })));
      } else {
        // Sensible initial defaults if empty
        setContacts([
          { key: 'Supporting Email', value: currentUser.email || 'support@messpro.app' },
          { key: currentUser.name || 'Support Admin', value: '+92 300 0000000' },
        ]);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleAddRow = (type: 'email' | 'phone') => {
    if (type === 'email') {
      setContacts((prev) => [...prev, { key: 'Supporting Email', value: '' }]);
    } else {
      setContacts((prev) => [...prev, { key: 'Support WhatsApp', value: '+92 ' }]);
    }
  };

  const handleRemoveRow = (index: number) => {
    setContacts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleKeyChange = (index: number, val: string) => {
    setContacts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], key: val };
      return next;
    });
  };

  const handleValueChange = (index: number, val: string) => {
    setContacts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value: val };
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedContacts = contacts
      .map((c) => ({ key: c.key.trim(), value: c.value.trim() }))
      .filter((c) => c.key && c.value);

    if (cleanedContacts.length === 0) {
      toast.error('Please add at least one support contact entry');
      return;
    }

    try {
      await updateUser({
        id: currentUser._id,
        payload: {
          additionalInfo: cleanedContacts,
        },
      });

      // Update Redux state immediately
      if (token) {
        dispatch(
          setCredentials({
            token,
            user: {
              ...currentUser,
              additionalInfo: cleanedContacts,
            },
          })
        );
      }

      toast.success('Official supporting contacts updated successfully');
      onClose();
    } catch {
      // Handled in mutation toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Superadmin Official Supporting Contacts
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Saved in your profile additional info & automatically dispatched in approval emails.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs flex flex-col max-h-[75vh] overflow-hidden">
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-800 dark:text-blue-300 text-[11px] space-y-1">
            <span className="font-bold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Automated Client Onboarding Contacts:
            </span>
            <p>
              When you approve any hostel setup request, all supporting emails and WhatsApp contacts listed below will be cleanly formatted and emailed to the tenant administrator.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {contacts.map((c, idx) => {
              const isEmail = c.value.includes('@') || c.key.toLowerCase().includes('mail');
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-2.5"
                >
                  <div className="p-1.5 rounded-lg bg-background border border-border text-muted-foreground shrink-0">
                    {isEmail ? <Mail className="w-4 h-4 text-blue-500" /> : <Phone className="w-4 h-4 text-emerald-500" />}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                        Label / Representative Name
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. Supporting Email, Abdul Manan, M Usman"
                        value={c.key}
                        onChange={(e) => handleKeyChange(idx, e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                        Contact Value (Email / WhatsApp #)
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. manan12345ch@gmail.com, 923000000000"
                        value={c.value}
                        onChange={(e) => handleValueChange(idx, e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(idx)}
                    disabled={contacts.length <= 1}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                    title="Remove contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Add buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddRow('email')}
              className="text-xs h-8 gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Email
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddRow('phone')}
              className="text-xs h-8 gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add WhatsApp Number
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border shrink-0">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-primary text-primary-foreground font-semibold gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Save Supporting Contacts
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
