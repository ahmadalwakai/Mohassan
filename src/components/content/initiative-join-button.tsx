'use client';

/**
 * Initiative Join Button Component
 * Handles joining an initiative
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface InitiativeJoinButtonProps {
  initiativeId: string;
  ownerId: string;
}

export function InitiativeJoinButton({ initiativeId, ownerId }: InitiativeJoinButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Can't join own initiative
  if (session?.user?.id === ownerId) {
    return null;
  }

  const handleJoin = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/initiatives/${initiativeId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'فشل الانضمام');
      }

      setIsJoined(true);
      // Show success for a moment, then reset
      setTimeout(() => {
        setIsJoined(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleJoin}
      isLoading={isLoading}
      disabled={isJoined || isLoading}
      colorScheme={isJoined ? 'green' : 'brand'}
    >
      {isJoined ? '✓ تم الانضمام' : '👥 الانضمام للمبادرة'}
    </Button>
  );
}
