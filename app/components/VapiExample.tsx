'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useVapi } from '@/app/hooks/useVapi';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? '';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? '';
const BASE_URL = process.env.NEXT_PUBLIC_VAPI_BASE_URL;

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
});

export function VapiExample() {
  const controller = useVapi({
    publicKey: PUBLIC_KEY,
    assistantId: ASSISTANT_ID,
    baseUrl: BASE_URL,
  });

  const hasCredentials = PUBLIC_KEY.length > 0 && ASSISTANT_ID.length > 0;

  const recentProgress = useMemo(
    () => controller.progress.slice(-6),
    [controller.progress],
  );

  const volumePercent = useMemo(
    () => Math.round(Math.max(0, Math.min(1, controller.volumeLevel)) * 100),
    [controller.volumeLevel],
  );

  const transcriptViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const viewport = transcriptViewportRef.current;
    if (!viewport) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [controller.transcript, controller.partialTranscript]);

  return (
    <Card className="border border-border/60 bg-background/60 shadow-lg backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Voice AI Call Console
        </CardTitle>
        <CardDescription>
          Start a Vapi call, monitor connection progress, and watch transcripts stream in
          as you speak.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant={controller.isSessionActive ? 'default' : 'secondary'}>
            {controller.isSessionActive ? 'Session Live' : 'Idle'}
          </Badge>
          <div className="flex min-w-[220px] flex-1 flex-col gap-2 sm:max-w-xs">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              <span>Assistant Volume</span>
              <span className="font-mono text-muted-foreground/80">{volumePercent}%</span>
            </div>
            <Slider
              value={[volumePercent]}
              max={100}
              step={1}
              aria-label="Assistant volume"
              aria-valuetext={`${volumePercent} percent`}
              disabled
            />
          </div>
          {!hasCredentials && (
            <Badge variant="destructive">Missing Vapi credentials</Badge>
          )}
        </div>

        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Transcript
            </p>
            <span className="text-xs text-muted-foreground/80">
              {controller.transcript.length} final segments
            </span>
          </header>
          <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/10">
            <ScrollArea className="h-56" viewportRef={transcriptViewportRef}>
              <div className="space-y-3 p-4 font-mono text-sm leading-relaxed">
                {controller.transcript.length === 0 && !controller.partialTranscript ? (
                  <p className="text-muted-foreground">
                    Start a call to see the assistant and user transcripts in real time.
                  </p>
                ) : (
                  <>
                    {controller.transcript.map((segment) => (
                      <div key={segment.id} className="space-y-1">
                        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                          <span>{segment.speaker}</span>
                          <span className="text-muted-foreground/70">
                            {timestampFormatter.format(new Date(segment.timestamp))}
                          </span>
                        </div>
                        <p className="text-foreground/90">{segment.text}</p>
                      </div>
                    ))}
                    {controller.partialTranscript && (
                      <div className="space-y-1 opacity-70">
                        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                          <span>{controller.partialTranscript.speaker}</span>
                          <span className="text-muted-foreground/70">
                            {timestampFormatter.format(
                              new Date(controller.partialTranscript.timestamp),
                            )}
                          </span>
                          <span className="text-xs">typing…</span>
                        </div>
                        <p>{controller.partialTranscript.text}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </section>

        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Connection Stages
            </p>
            <span className="text-xs text-muted-foreground/80">
              {recentProgress.length} updates
            </span>
          </header>
          <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
            {recentProgress.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground">
                Call inactive. Start a session to inspect progress events.
              </p>
            ) : (
              <ol className="space-y-2 font-mono text-xs">
                {recentProgress.map((event) => (
                  <li
                    key={`${event.stage}-${event.timestamp}`}
                    className="flex flex-wrap items-center gap-3"
                  >
                    <span className="min-w-[120px] uppercase tracking-wide text-muted-foreground">
                      {event.stage}
                    </span>
                    <span
                      className={
                        event.status === 'failed'
                          ? 'text-destructive'
                          : event.status === 'completed'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      }
                    >
                      {event.status}
                    </span>
                    {typeof event.duration === 'number' && (
                      <span className="text-muted-foreground/70">
                        {event.duration.toFixed(0)} ms
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-border/60 pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={() => void controller.startCall()}
            disabled={
              controller.isLoading || controller.isSessionActive || !hasCredentials
            }
          >
            {controller.isLoading ? 'Connecting…' : 'Start Call'}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => void controller.endCall()}
            disabled={controller.isLoading || !controller.isSessionActive}
          >
            End Call
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {!hasCredentials ? (
            <p>
              Add <span className="font-mono">NEXT_PUBLIC_VAPI_PUBLIC_KEY</span> and
              <span className="font-mono"> NEXT_PUBLIC_VAPI_ASSISTANT_ID</span> to your
              <span className="font-mono"> .env.local</span> file using values from the
              Vapi dashboard, then refresh this page.
            </p>
          ) : controller.error ? (
            <p className="text-destructive">{controller.error}</p>
          ) : (
            <p>Use the controls above to start and end a call.</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
