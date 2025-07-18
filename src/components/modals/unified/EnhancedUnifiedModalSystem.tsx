/**
 * Système de modales unifié et amélioré
 * Gestion centralisée de toutes les modales avec animations et accessibilité
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalAnimation = 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'none';

export interface EnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  animation?: ModalAnimation;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventClose?: boolean;
  loading?: boolean;
  loadingText?: string;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  zIndex?: number;
  backdrop?: 'blur' | 'dark' | 'light' | 'none';
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4'
};

const animationClasses: Record<ModalAnimation, { enter: string; exit: string }> = {
  fade: {
    enter: 'animate-in fade-in duration-200',
    exit: 'animate-out fade-out duration-200'
  },
  'slide-up': {
    enter: 'animate-in slide-in-from-bottom-4 duration-300',
    exit: 'animate-out slide-out-to-bottom-4 duration-200'
  },
  'slide-down': {
    enter: 'animate-in slide-in-from-top-4 duration-300',
    exit: 'animate-out slide-out-to-top-4 duration-200'
  },
  scale: {
    enter: 'animate-in zoom-in-95 duration-200',
    exit: 'animate-out zoom-out-95 duration-200'
  },
  none: {
    enter: '',
    exit: ''
  }
};

const backdropClasses: Record<string, string> = {
  blur: 'backdrop-blur-sm bg-black/50',
  dark: 'bg-black/70',
  light: 'bg-white/70',
  none: 'bg-transparent'
};

export function EnhancedUnifiedModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  animation = 'fade',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventClose = false,
  loading = false,
  loadingText = 'Chargement...',
  footer,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  zIndex = 50,
  backdrop = 'blur',
  role = 'dialog',
  ariaLabel,
  ariaDescribedBy,
  ...props
}: EnhancedModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Gestion du focus et de l'accessibilité
  useEffect(() => {
    if (isOpen) {
      // Sauvegarder l'élément actif
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus sur la modale
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
      
      // Ajouter l'attribut pour les lecteurs d'écran
      document.body.setAttribute('aria-hidden', 'true');
    } else {
      // Restaurer le focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Restaurer le scroll
      document.body.style.overflow = '';
      
      // Supprimer l'attribut aria-hidden
      document.body.removeAttribute('aria-hidden');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('aria-hidden');
    };
  }, [isOpen]);

  // Gestion des touches
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape' && closeOnEscape && !preventClose) {
        event.preventDefault();
        onClose();
      }

      // Gestion du focus (piège à focus)
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, preventClose, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlayClick && !preventClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!preventClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center p-4',
        backdropClasses[backdrop],
        overlayClassName
      )}
      style={{ zIndex }}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full rounded-lg bg-white shadow-xl',
          sizeClasses[size],
          animationClasses[animation].enter,
          contentClassName,
          className
        )}
        role={role}
        aria-modal="true"
        aria-label={ariaLabel || title}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={cn(
            'flex items-center justify-between p-4 border-b',
            headerClassName
          )}>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && !preventClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
                aria-label="Fermer la modale"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={cn(
          'p-4',
          bodyClassName,
          { 'opacity-50 pointer-events-none': loading }
        )}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              <span className="text-gray-600">{loadingText}</span>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className={cn(
            'border-t p-4 bg-gray-50 rounded-b-lg',
            footerClassName
          )}>
            {footer}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="flex items-center">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              <span className="text-gray-600">{loadingText}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// Hook pour gérer les modales
export function useEnhancedModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  const withLoading = React.useCallback(async (asyncFn: () => Promise<void>) => {
    setLoading(true);
    try {
      await asyncFn();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isOpen,
    loading,
    openModal,
    closeModal,
    toggleModal,
    setLoading,
    withLoading
  };
}

// Composant de confirmation
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default'
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <EnhancedUnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      animation="scale"
    >
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </EnhancedUnifiedModal>
  );
}