import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../utils/config';

export interface AgentEvent {
    agent_name: string;
    message: string;
    details?: any;
    timestamp: string;
    status: 'working' | 'completed' | 'failed' | 'info';
}

export function useAgentEvents() {
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [latestEvent, setLatestEvent] = useState<AgentEvent | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/latest-result`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.events && Array.isArray(data.events)) {
                        setEvents(data.events);
                        if (data.events.length > 0) {
                            setLatestEvent(data.events[data.events.length - 1]);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch latest result:", error);
            }
        };
        fetchLatest();
    }, []);

    useEffect(() => {
        let eventSource: EventSource | null = null;
        let retryTimeout: NodeJS.Timeout;

        const connectSSE = () => {
            if (eventSource) {
                eventSource.close();
            }

            const streamUrl = `${API_BASE_URL}/events`;
            const source = new EventSource(streamUrl);
            eventSource = source;

            eventSource.onopen = () => {
                setIsConnected(true);
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (!data.timestamp) {
                        data.timestamp = new Date().toLocaleTimeString();
                    }

                    if (data.message && data.message.includes('Starting batch evaluation')) {
                        setEvents([data]);
                    } else {
                        setEvents((prev) => [...prev, data]);
                    }
                } catch (e) {
                    console.error("Error parsing event data", e);
                }
            };

            eventSource.onerror = () => {
                setIsConnected(false);
                if (eventSource) {
                    eventSource.close();
                }
                retryTimeout = setTimeout(connectSSE, 3000);
            };
        };

        connectSSE();

        return () => {
            if (eventSource) {
                eventSource.close();
            }
            clearTimeout(retryTimeout);
        };
    }, []);

    const clearEvents = () => {
        setEvents([]);
    };

    return { events, isConnected, clearEvents };
}
