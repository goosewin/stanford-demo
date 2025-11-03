'use client';

import { type ComponentPropsWithoutRef } from 'react';

import { useVapi, type UseVapiConfig, type UseVapiResult } from '@/app/hooks/useVapi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ButtonCopy {
  idleLabel?: string;
  activeLabel?: string;
  loadingLabel?: string;
  showErrorMessage?: boolean;
}

interface ManagedVapiButtonProps extends ButtonCopy {
  controller?: never;
  publicKey?: string;
  assistantId?: string;
  baseUrl?: string;
  className?: string;
  variant?: ComponentPropsWithoutRef<typeof Button>['variant'];
  size?: ComponentPropsWithoutRef<typeof Button>['size'];
}

interface ControlledVapiButtonProps extends ButtonCopy {
  controller: UseVapiResult;
  className?: string;
  variant?: ComponentPropsWithoutRef<typeof Button>['variant'];
  size?: ComponentPropsWithoutRef<typeof Button>['size'];
}

type VapiButtonProps = ManagedVapiButtonProps | ControlledVapiButtonProps;

interface VapiButtonBaseProps extends ButtonCopy {
  controller: UseVapiResult;
  className?: string;
  variant?: ComponentPropsWithoutRef<typeof Button>['variant'];
  size?: ComponentPropsWithoutRef<typeof Button>['size'];
}

const DEFAULT_IDLE_LABEL = 'Start Call';
const DEFAULT_ACTIVE_LABEL = 'End Call';
const DEFAULT_LOADING_LABEL = 'Connecting...';

function VapiButtonBase({
  controller,
  idleLabel = DEFAULT_IDLE_LABEL,
  activeLabel = DEFAULT_ACTIVE_LABEL,
  loadingLabel = DEFAULT_LOADING_LABEL,
  showErrorMessage = true,
  className,
  variant = 'default',
  size = 'lg',
}: VapiButtonBaseProps) {
  const handleClick = () => {
    if (controller.isSessionActive) {
      void controller.endCall();
    } else {
      void controller.startCall();
    }
  };

  const label = controller.isLoading
    ? loadingLabel
    : controller.isSessionActive
      ? activeLabel
      : idleLabel;

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        type="button"
        size={size}
        variant={variant}
        onClick={handleClick}
        disabled={controller.isLoading}
        className={cn('transition-all', className)}
      >
        {label}
      </Button>
      {showErrorMessage && controller.error && (
        <p className="text-sm text-destructive">{controller.error}</p>
      )}
    </div>
  );
}

function ManagedVapiButton({
  publicKey,
  assistantId,
  baseUrl,
  ...props
}: ManagedVapiButtonProps) {
  const resolvedConfig: UseVapiConfig = {
    publicKey: publicKey ?? process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? '',
    assistantId: assistantId ?? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? '',
    baseUrl: baseUrl ?? process.env.NEXT_PUBLIC_VAPI_BASE_URL,
  };

  const controller = useVapi(resolvedConfig);

  return <VapiButtonBase controller={controller} {...props} />;
}

export function VapiButton(props: VapiButtonProps) {
  if ('controller' in props && props.controller) {
    const { controller, ...rest } = props;
    return <VapiButtonBase controller={controller} {...rest} />;
  }

  return <ManagedVapiButton {...props} />;
}
