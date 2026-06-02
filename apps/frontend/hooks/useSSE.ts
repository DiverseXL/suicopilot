import { useEffect, useRef, useState } from 'react';

export interface SSEEvent {
  type: string;
  data: any;
  timestamp: number;
}

const MAX_EVENTS = 50;

function pushEvent(type: string, data: any) {
  return (prev: SSEEvent[]): SSEEvent[] =>
    [{ type, data, timestamp: Date.now() }, ...prev].slice(0, MAX_EVENTS);
}

export function useSSE(url: string) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.addEventListener('agent_execution', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setEvents(pushEvent('agent_execution', data));
    });

    es.addEventListener('agent_deployed', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setEvents(pushEvent('agent_deployed', data));
    });

    es.addEventListener('agent_health', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setEvents(pushEvent('agent_health', data));
    });

    return () => {
      es.close();
      setConnected(false);
    };
  }, [url]);

  return { events, connected };
}
