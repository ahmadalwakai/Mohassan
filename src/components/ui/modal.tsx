'use client';

/**
 * Modal / Dialog Component
 */

import { Box, Text, VStack, HStack, Portal } from '@chakra-ui/react';
import { ReactNode, useEffect, useCallback } from 'react';
import { Button } from './button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: ReactNode;
}

const sizes = {
  sm: { maxW: '400px' },
  md: { maxW: '500px' },
  lg: { maxW: '700px' },
  xl: { maxW: '900px' },
  full: { maxW: '100vw', w: '100vw', h: '100vh', m: 0, borderRadius: 0 },
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
}: ModalProps) => {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Overlay */}
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.700"
        zIndex={1000}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        onClick={closeOnOverlayClick ? onClose : undefined}
      >
        {/* Modal Content */}
        <Box
          bg="gray.800"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.700"
          w="full"
          {...sizes[size]}
          maxH={size !== 'full' ? '90vh' : undefined}
          display="flex"
          flexDirection="column"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <HStack
              px={6}
              py={4}
              borderBottom="1px solid"
              borderColor="gray.700"
              justify="space-between"
            >
              {title && (
                <Text fontSize="lg" fontWeight="semibold" color="white">
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label="إغلاق"
                  p={1}
                >
                  ✕
                </Button>
              )}
            </HStack>
          )}

          {/* Body */}
          <Box flex={1} overflow="auto" p={6}>
            {children}
          </Box>

          {/* Footer */}
          {footer && (
            <HStack
              px={6}
              py={4}
              borderTop="1px solid"
              borderColor="gray.700"
              justify="flex-start"
              gap={3}
            >
              {footer}
            </HStack>
          )}
        </Box>
      </Box>
    </Portal>
  );
};

// Confirmation Modal
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
        </>
      }
    >
      <Text color="gray.300">{message}</Text>
    </Modal>
  );
};
