import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          id="toast-notification"
          className="fixed bottom-6 left-4 right-4 mx-auto max-w-sm bg-[#213145] text-[#eaf1ff] px-4 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-slate-700/50"
          role="status"
          aria-live="polite"
        >
          <span className="material-symbols-outlined text-[#89f5e7] text-[20px] shrink-0">
            {toast.icon || (toast.type === 'error' ? 'error' : toast.type === 'success' ? 'check_circle' : 'info')}
          </span>
          <span className="text-[13px] font-medium flex-1 leading-snug">
            {toast.message}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
