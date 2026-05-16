/**
 * <SubscriptionCancelButton> — F3.6 구독 취소.
 */
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';

import { cancelSubscription } from '@/lib/subscription/actions';
import { logEvent } from '@/lib/firebase/analytics';
import { Button } from '@/components/ui/button';

export function SubscriptionCancelButton(): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    if (!confirm('구독을 취소하시겠습니까? 현재 기간 종료까지는 혜택이 유지됩니다.')) return;
    startTransition(async () => {
      const r = await cancelSubscription();
      if (r.ok) {
        void logEvent('premium_cancel', {});
        toast.success('구독이 취소되었습니다');
        router.refresh();
      } else {
        toast.error('취소 실패: ' + r.error);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCancel}
      disabled={isPending}
      className="gap-1 text-vermilion"
    >
      <XCircle className="h-3 w-3" />
      구독 취소
    </Button>
  );
}
