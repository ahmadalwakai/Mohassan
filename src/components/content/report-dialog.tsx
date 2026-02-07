'use client';

/**
 * Report Dialog Component
 * Allows users to report inappropriate content
 */

import { useState } from 'react';
import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { Modal, Button, Input } from '@/components/ui';
import { ReportReason } from '@prisma/client';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
}

export function ReportDialog({ isOpen, onClose, contentId, contentTitle }: ReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!reason) {
      setError('يرجى اختيار سبب الإبلاغ');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          reason: reason as ReportReason,
          description: description || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'فشل الإبلاغ');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
        setDescription('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الإبلاغ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setSuccess(false);
      setReason('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إبلاغ عن محتوى"
      size="md"
      footer={
        <HStack justify="end" gap={3}>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!reason || isSubmitting || success}
          >
            {success ? '✓ تم الإبلاغ' : 'إرسال الإبلاغ'}
          </Button>
        </HStack>
      }
    >
      <VStack align="stretch" gap={4}>
        {error && (
          <Box bg="red.900" border="1px solid" borderColor="red.700" p={3} borderRadius="md">
            <Text color="red.200" fontSize="sm">
              {error}
            </Text>
          </Box>
        )}

        {success && (
          <Box bg="green.900" border="1px solid" borderColor="green.700" p={3} borderRadius="md">
            <Text color="green.200" fontSize="sm">
              شكراً على الإبلاغ. سيتم مراجعة المحتوى من قبل فريقنا.
            </Text>
          </Box>
        )}

        <Box>
          <Text fontSize="sm" color="gray.400" mb={2}>
            المحتوى: <strong>{contentTitle}</strong>
          </Text>
        </Box>

        <VStack align="stretch" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="white">
            سبب الإبلاغ *
          </Text>
          <select
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReason(e.target.value as ReportReason)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#1f2937',
              borderColor: '#4b5563',
              color: '#ffffff',
              borderRadius: '0.375rem',
              border: '1px solid #4b5563',
              fontSize: '0.875rem',
            }}
            disabled={isSubmitting}
          >
            <option value="">اختر السبب</option>
            <option value="SPAM">بريد مزعج</option>
            <option value="INAPPROPRIATE">محتوى غير لائق</option>
            <option value="HARASSMENT">مضايقة أو تنمر</option>
            <option value="MISINFORMATION">معلومات مضللة</option>
            <option value="COPYRIGHT">انتهاك حقوق النشر</option>
            <option value="OTHER">أخرى</option>
          </select>
        </VStack>

        <VStack align="stretch" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="white">
            التفاصيل (اختياري)
          </Text>
          <textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="وصف إضافي لمساعدتنا على أفضل فهم للمشكلة..."
            maxLength={1000}
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#1f2937',
              borderColor: '#4b5563',
              color: '#ffffff',
              borderRadius: '0.375rem',
              border: '1px solid #4b5563',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
            disabled={isSubmitting}
          />
          <Text fontSize="xs" color="gray.500" textAlign="right">
            {description.length}/1000
          </Text>
        </VStack>
      </VStack>
    </Modal>
  );
}
