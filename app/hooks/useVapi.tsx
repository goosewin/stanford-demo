'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';

type TranscriptSpeaker = 'assistant' | 'user' | 'system' | 'unknown';

type TranscriptType = 'partial' | 'final';

type VapiContentBlock = {
  type: string;
  text?: string;
  [key: string]: unknown;
};

type VapiMessageContent = string | VapiContentBlock[] | undefined;

export interface UseVapiConfig {
  publicKey: string;
  assistantId: string;
  baseUrl?: string;
}

interface VapiState {
  isSessionActive: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TranscriptSegment {
  id: string;
  speaker: TranscriptSpeaker;
  text: string;
  timestamp: string;
}

export interface PartialTranscript {
  speaker: TranscriptSpeaker;
  text: string;
  timestamp: string;
}

export interface CallStartProgressEvent {
  stage: string;
  status: 'started' | 'completed' | 'failed';
  duration?: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface VapiStreamMessage extends Record<string, unknown> {
  type?: string;
  role?: string;
  transcriptType?: TranscriptType;
  transcript?: string;
  text?: string;
  content?: VapiMessageContent;
  timestamp?: number | string;
  status?: string;
  endedReason?: string;
  message?: {
    role?: string;
    content?: VapiMessageContent;
    transcript?: string;
    transcriptType?: TranscriptType;
    text?: string;
    [key: string]: unknown;
  };
  alternatives?: Array<{
    transcript?: string;
    text?: string;
    [key: string]: unknown;
  }>;
}

export interface UseVapiResult extends VapiState {
  startCall: () => Promise<void>;
  endCall: () => Promise<void>;
  transcript: TranscriptSegment[];
  partialTranscript: PartialTranscript | null;
  messages: VapiStreamMessage[];
  volumeLevel: number;
  progress: CallStartProgressEvent[];
}

interface TranscriptUpdate {
  speaker: TranscriptSpeaker;
  text: string;
  isFinal: boolean;
  timestamp: string;
}

const createTimestamp = () => new Date().toISOString();

const sanitizeText = (text: string | undefined) => text?.trim() ?? '';

const extractFromContent = (content: VapiMessageContent): string | undefined => {
  if (!content) {
    return undefined;
  }

  if (typeof content === 'string') {
    return sanitizeText(content);
  }

  return sanitizeText(
    content
      .filter((block) => typeof block.text === 'string' && block.text.trim().length > 0)
      .map((block) => block.text ?? '')
      .join(' \n'),
  );
};

const extractTranscript = (message: VapiStreamMessage): TranscriptUpdate | null => {
  const speaker: TranscriptSpeaker =
    (message.role as TranscriptSpeaker) ??
    (message.message?.role as TranscriptSpeaker) ??
    'unknown';

  const transcriptCandidates: Array<string | undefined> = [
    typeof message.transcript === 'string' ? message.transcript : undefined,
    typeof message.text === 'string' ? message.text : undefined,
    typeof message.message?.transcript === 'string'
      ? message.message.transcript
      : undefined,
    typeof message.message?.text === 'string' ? message.message.text : undefined,
    extractFromContent(message.content),
    extractFromContent(message.message?.content),
    message.alternatives?.find(
      (entry) => typeof entry?.transcript === 'string' && entry.transcript.length > 0,
    )?.transcript,
  ];

  const text = transcriptCandidates
    .map(sanitizeText)
    .find((candidate) => candidate.length > 0);

  if (!text) {
    return null;
  }

  const transcriptType = (message.transcriptType ?? message.message?.transcriptType) as
    | TranscriptType
    | undefined;
  const typeLabel = typeof message.type === 'string' ? message.type : '';
  const statusLabel = typeof message.status === 'string' ? message.status : '';

  const isFinal =
    transcriptType === 'final' ||
    typeLabel.includes('final') ||
    statusLabel === 'completed' ||
    statusLabel === 'final';

  const timestampValue = (() => {
    if (typeof message.timestamp === 'number') {
      return new Date(message.timestamp).toISOString();
    }
    if (typeof message.timestamp === 'string') {
      return message.timestamp;
    }
    if (
      typeof (message as { message?: { timestamp?: string | number } }).message
        ?.timestamp === 'number'
    ) {
      return new Date(
        (message as { message?: { timestamp?: number } }).message?.timestamp ??
          Date.now(),
      ).toISOString();
    }
    if (
      typeof (message as { message?: { timestamp?: string } }).message?.timestamp ===
      'string'
    ) {
      return (
        (message as { message?: { timestamp?: string } }).message?.timestamp ??
        createTimestamp()
      );
    }
    return createTimestamp();
  })();

  return {
    speaker,
    text,
    isFinal,
    timestamp: timestampValue,
  };
};

const MISSING_CONFIG_ERROR = 'Missing Vapi public key or assistant identifier.';

export const useVapi = (config: UseVapiConfig): UseVapiResult => {
  const vapiRef = useRef<Vapi | null>(null);
  const [state, setState] = useState<VapiState>({
    isSessionActive: false,
    isLoading: false,
    error: null,
  });
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [partialTranscript, setPartialTranscript] = useState<PartialTranscript | null>(
    null,
  );
  const [messages, setMessages] = useState<VapiStreamMessage[]>([]);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [progress, setProgress] = useState<CallStartProgressEvent[]>([]);
  const transcriptCounterRef = useRef(0);

  useEffect(() => {
    if (!config.publicKey || !config.assistantId) {
      return undefined;
    }

    const vapiInstance = new Vapi(config.publicKey, config.baseUrl);
    vapiRef.current = vapiInstance;

    const handleCallStart = () => {
      setState((previous) => ({
        ...previous,
        isSessionActive: true,
        isLoading: false,
        error: null,
      }));
      setProgress([]);
    };

    const handleCallEnd = () => {
      setState((previous) => ({
        ...previous,
        isSessionActive: false,
        isLoading: false,
      }));
      setPartialTranscript(null);
      setVolumeLevel(0);
    };

    const handleError = (incomingError: unknown) => {
      const message =
        incomingError instanceof Error
          ? incomingError.message
          : 'An unexpected Vapi error occurred.';
      setState((previous) => ({
        ...previous,
        error: message,
        isLoading: false,
      }));
    };

    const handleMessage = (incoming: unknown) => {
      if (typeof incoming !== 'object' || incoming === null) {
        return;
      }

      const payload = incoming as VapiStreamMessage;

      setMessages((previous) => {
        const next = [...previous, payload];
        return next.slice(-200);
      });

      const update = extractTranscript(payload);
      if (!update) {
        return;
      }

      if (update.isFinal) {
        transcriptCounterRef.current += 1;
        const segmentId = `segment-${transcriptCounterRef.current}`;
        setTranscript((previous) => [
          ...previous,
          {
            id: segmentId,
            speaker: update.speaker,
            text: update.text,
            timestamp: update.timestamp,
          },
        ]);
        setPartialTranscript(null);
      } else {
        setPartialTranscript({
          speaker: update.speaker,
          text: update.text,
          timestamp: update.timestamp,
        });
      }
    };

    const handleVolumeLevel = (level: number) => {
      setVolumeLevel(Math.max(0, Math.min(1, level)));
    };

    const handleProgress = (event: CallStartProgressEvent) => {
      setProgress((previous) => [...previous, event].slice(-32));
    };

    vapiInstance.on('call-start', handleCallStart);
    vapiInstance.on('call-end', handleCallEnd);
    vapiInstance.on('error', handleError);
    vapiInstance.on('message', handleMessage);
    vapiInstance.on('volume-level', handleVolumeLevel);
    vapiInstance.on('call-start-progress', handleProgress);

    return () => {
      vapiInstance.off('call-start', handleCallStart);
      vapiInstance.off('call-end', handleCallEnd);
      vapiInstance.off('error', handleError);
      vapiInstance.off('message', handleMessage);
      vapiInstance.off('volume-level', handleVolumeLevel);
      vapiInstance.off('call-start-progress', handleProgress);
      void vapiInstance.stop().catch(() => undefined);
      vapiRef.current = null;
    };
  }, [config.assistantId, config.baseUrl, config.publicKey]);

  const resetForNewCall = useCallback(() => {
    setTranscript([]);
    setPartialTranscript(null);
    setMessages([]);
    setProgress([]);
    transcriptCounterRef.current = 0;
  }, []);

  const startCall = useCallback(async () => {
    const client = vapiRef.current;

    if (!client) {
      setState((previous) => ({
        ...previous,
        error: 'Vapi client is not ready yet.',
      }));
      return;
    }

    if (!config.assistantId) {
      setState((previous) => ({
        ...previous,
        error: 'Missing assistant identifier.',
      }));
      return;
    }

    resetForNewCall();
    setState((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
    }));

    try {
      const result = await client.start(config.assistantId);
      if (result === null) {
        setState((previous) => ({
          ...previous,
          isLoading: false,
          error: 'A call is already active.',
        }));
      }
    } catch (incomingError) {
      const message =
        incomingError instanceof Error
          ? incomingError.message
          : 'Unable to start the call.';
      setState((previous) => ({
        ...previous,
        error: message,
        isLoading: false,
      }));
    }
  }, [config.assistantId, resetForNewCall]);

  const endCall = useCallback(async () => {
    const client = vapiRef.current;

    if (!client) {
      return;
    }

    setState((previous) => ({
      ...previous,
      isLoading: true,
    }));

    try {
      await client.stop();
      setState((previous) => ({
        ...previous,
        isLoading: false,
      }));
    } catch (incomingError) {
      const message =
        incomingError instanceof Error
          ? incomingError.message
          : 'Unable to end the call.';
      setState((previous) => ({
        ...previous,
        error: message,
        isLoading: false,
      }));
    }
  }, []);

  const result = useMemo<UseVapiResult>(
    () => ({
      startCall,
      endCall,
      isSessionActive: state.isSessionActive,
      isLoading: state.isLoading,
      error:
        !config.publicKey || !config.assistantId ? MISSING_CONFIG_ERROR : state.error,
      transcript,
      partialTranscript,
      messages,
      volumeLevel,
      progress,
    }),
    [
      endCall,
      messages,
      partialTranscript,
      progress,
      startCall,
      state.error,
      state.isLoading,
      state.isSessionActive,
      transcript,
      config.assistantId,
      config.publicKey,
      volumeLevel,
    ],
  );

  return result;
};
