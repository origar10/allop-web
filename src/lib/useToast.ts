import { useContext } from 'react';
import { ToastContext } from './toastContext';

import { tr } from './tr';
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error(tr('useToast must be used inside ToastProvider'));
  return context;
}
