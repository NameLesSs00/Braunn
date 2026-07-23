import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { translateAppDomTree, translateAppText } from '../../../../../shared/lib/appTranslation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-3xl' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const root = modalRef.current;
    translateAppDomTree(root);

    const observer = new MutationObserver(() => translateAppDomTree(root));
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'],
    });

    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className={`w-full ${maxWidth} bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="bg-[#0a4bbd] px-8 py-6 text-white relative flex-shrink-0">
          <h2 className="text-xl font-semibold pr-10">{translateAppText(title)}</h2>
          {subtitle && (
            <p className="mt-1 text-blue-100 text-[14px]">{translateAppText(subtitle)}</p>
          )}
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-white/80 hover:text-white transition-colors"
          >
            {/* @ts-ignore */}
            <FiX className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
