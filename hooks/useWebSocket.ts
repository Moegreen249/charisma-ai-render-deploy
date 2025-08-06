import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: Date;
}

export interface UseWebSocketOptions {
    autoConnect?: boolean;
    reconnectAttempts?: number;
    reconnectDelay?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
    const { autoConnect = true, reconnectAttempts = 5, reconnectDelay = 1000 } = options;
    const { data: session } = useSession();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    const socketRef = useRef<ReturnType<typeof io> | null>(null);
    const reconnectCountRef = useRef(0);
    const messageHandlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

    const connect = useCallback(() => {
        if (socketRef.current?.connected || !session?.user?.id) {
            return;
        }

        try {
            const socket = io({
                path: '/api/socket.io',
                transports: ['websocket', 'polling'],
                timeout: 10000,
                forceNew: true
            });

            socket.on('connect', () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setConnectionError(null);
                reconnectCountRef.current = 0;

                // Authenticate with the server
                socket.emit('authenticate', {
                    userId: session.user.id,
                    token: session.user.email // In production, use a proper token
                });
            });

            socket.on('authenticated', (data) => {
                console.log('WebSocket authenticated:', data);
            });

            socket.on('auth_error', (error) => {
                console.error('WebSocket authentication error:', error);
                setConnectionError(error.message);
            });

            socket.on('disconnect', (reason) => {
                console.log('WebSocket disconnected:', reason);
                setIsConnected(false);

                // Attempt to reconnect if not manually disconnected
                if (reason !== 'io client disconnect' && reconnectCountRef.current < reconnectAttempts) {
                    setTimeout(() => {
                        reconnectCountRef.current++;
                        connect();
                    }, reconnectDelay * Math.pow(2, reconnectCountRef.current));
                }
            });

            socket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
                setConnectionError(error.message);
                setIsConnected(false);
            });

            // Handle incoming messages
            // Note: onAny is not available in socket.io-client, so we'll handle specific events
            // when they are registered via the on() method

            socketRef.current = socket;
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        }
    }, [session?.user?.id, reconnectAttempts, reconnectDelay]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }, []);

    const emit = useCallback((event: string, data?: any) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('Cannot emit event: WebSocket not connected');
        }
    }, []);

    const subscribe = useCallback((event: string, handler: (data: any) => void) => {
        if (!messageHandlersRef.current.has(event)) {
            messageHandlersRef.current.set(event, new Set());

            // Register the event listener with the socket
            if (socketRef.current) {
                socketRef.current.on(event, (data: any) => {
                    const message: WebSocketMessage = {
                        type: event,
                        data,
                        timestamp: new Date()
                    };

                    setLastMessage(message);

                    // Call all registered handlers for this event
                    const handlers = messageHandlersRef.current.get(event);
                    if (handlers) {
                        handlers.forEach(h => {
                            try {
                                h(data);
                            } catch (error) {
                                console.error(`Error in WebSocket handler for ${event}:`, error);
                            }
                        });
                    }
                });
            }
        }

        messageHandlersRef.current.get(event)!.add(handler);

        // Return unsubscribe function
        return () => {
            const handlers = messageHandlersRef.current.get(event);
            if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    messageHandlersRef.current.delete(event);
                    // Remove the socket event listener when no more handlers
                    if (socketRef.current) {
                        socketRef.current.off(event);
                    }
                }
            }
        };
    }, []);

    const subscribeToTask = useCallback((taskId: string) => {
        emit('subscribe_task', { taskId });
    }, [emit]);

    const unsubscribeFromTask = useCallback((taskId: string) => {
        emit('unsubscribe_task', { taskId });
    }, [emit]);

    const subscribeToStory = useCallback((storyId: string) => {
        emit('subscribe_story', { storyId });
    }, [emit]);

    // Auto-connect when session is available
    useEffect(() => {
        if (autoConnect && session?.user?.id && !socketRef.current) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [session?.user?.id, autoConnect, connect, disconnect]);

    return {
        isConnected,
        connectionError,
        lastMessage,
        connect,
        disconnect,
        emit,
        subscribe,
        subscribeToTask,
        unsubscribeFromTask,
        subscribeToStory
    };
}

export function useTaskWebSocket(taskId: string) {
    const webSocket = useWebSocket();
    const [taskUpdates, setTaskUpdates] = useState<any[]>([]);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<string | null>(null);

    useEffect(() => {
        if (!webSocket.isConnected || !taskId) return;

        // Subscribe to task updates
        webSocket.subscribeToTask(taskId);

        const unsubscribe = webSocket.subscribe('task_update', (data) => {
            if (data.data.taskId === taskId) {
                setTaskUpdates(prev => [...prev, data]);

                if (data.data.status) {
                    setCurrentStatus(data.data.status);
                }

                if (typeof data.data.progress === 'number') {
                    setProgress(data.data.progress);
                }

                if (data.data.currentStep) {
                    setCurrentStep(data.data.currentStep);
                }
            }
        });

        return () => {
            unsubscribe();
            webSocket.unsubscribeFromTask(taskId);
        };
    }, [webSocket, taskId]);

    return {
        ...webSocket,
        taskUpdates,
        currentStatus,
        progress,
        currentStep
    };
}

export function useStoryWebSocket(storyId: string) {
    const webSocket = useWebSocket();
    const [storyUpdates, setStoryUpdates] = useState<any[]>([]);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!webSocket.isConnected || !storyId) return;

        // Subscribe to story updates
        webSocket.subscribeToStory(storyId);

        const unsubscribe = webSocket.subscribe('story_update', (data) => {
            if (data.data.storyId === storyId) {
                setStoryUpdates(prev => [...prev, data]);

                if (data.data.status) {
                    setCurrentStatus(data.data.status);
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [webSocket, storyId]);

    return {
        ...webSocket,
        storyUpdates,
        currentStatus
    };
}

export function useAdminJobsWebSocket() {
    const webSocket = useWebSocket();
    const [jobUpdates, setJobUpdates] = useState<Map<string, any>>(new Map());
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const subscribeToAllJobs = useCallback(() => {
        webSocket.emit('subscribe_admin_jobs');
    }, [webSocket]);

    useEffect(() => {
        if (!webSocket.isConnected) return;

        // Subscribe to all job updates for admin
        subscribeToAllJobs();

        const unsubscribe = webSocket.subscribe('task_update', (data) => {
            setJobUpdates(prev => {
                const newMap = new Map(prev);
                newMap.set(data.taskId, {
                    ...data,
                    timestamp: new Date()
                });
                return newMap;
            });
            setLastUpdate(new Date());
        });

        return () => {
            unsubscribe();
        };
    }, [webSocket, subscribeToAllJobs]);

    return {
        ...webSocket,
        jobUpdates,
        lastUpdate,
        subscribeToAllJobs
    };
}