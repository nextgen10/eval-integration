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

    // Initial fetch of latest result
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
            console.log("Connecting to SSE at:", streamUrl);
            const source = new EventSource(streamUrl);
            // Assign to closure variable
            eventSource = source;

            eventSource.onopen = () => {
                setIsConnected(true);
                console.log("Connected to SSE");
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (!data.timestamp) {
                        data.timestamp = new Date().toLocaleTimeString();
                    }

                    // Auto-clear events when a new evaluation starts
                    if (data.message && data.message.includes('Starting batch evaluation')) {
                        console.log("New evaluation detected, clearing old events");
                        setEvents([data]);
                    } else {
                        setEvents((prev) => {
                            console.log("New event received:", data);
                            return [...prev, data];
                        });
                    }
                } catch (e) {
                    console.error("Error parsing event data", e);
                }
            };

            eventSource.onerror = (err) => {
                console.log("SSE Connection lost, retrying in 3s...");
                setIsConnected(false);
                if (eventSource) {
                    eventSource.close();
                }
                // Retry connection after 3 seconds
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
