import { ReactNode, useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-xl overflow-hidden`}>
        {/* Header */}
        <div className="bg-[#0a4bbd] px-8 py-6">
          <h2 className="text-xl font-bold text-white pr-8">{title}</h2>
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-white/80 hover:text-white transition-colors"
          >
            {/* @ts-ignore */}
            <FiX className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
        
        {/* Content */}
        {children}
      </div>
    </div>
  );
}
