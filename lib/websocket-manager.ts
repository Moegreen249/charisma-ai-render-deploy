import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from './logger';

// Define job update event types (replacing old TaskUpdateEvent)
export interface JobUpdateEvent {
  jobId: string;
  userId: string;
  type: 'status' | 'progress' | 'completed' | 'failed' | 'cancelled';
  data: {
    status?: string;
    progress?: number;
    result?: any;
    error?: string;
    currentStep?: string;
    estimatedTimeRemaining?: number;
  };
  timestamp: Date;
}

// Define job status type (replacing old TaskStatus enum)
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface TaskUpdate {
    taskId: string;
    userId: string;
    update: JobUpdateEvent;
    timestamp: Date;
}


export class WebSocketManager {
    private static instance: WebSocketManager;
    private io: SocketIOServer | null = null;
    private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds
    private socketUsers = new Map<string, string>(); // socketId -> userId

    // Polling mode storage
    private taskUpdates = new Map<string, TaskUpdate[]>();
    private userTaskUpdates = new Map<string, TaskUpdate[]>();
    private systemMessages: Array<{ type: string; message: string; timestamp: Date }> = [];
    private readonly MAX_UPDATES_PER_TASK = 50;

    public static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    /**
     * Initialize WebSocket server
     */
    public initialize(server: HTTPServer): void {
        if (this.io) {
            logger.warn('WebSocket server already initialized');
            return;
        }

        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            path: '/api/socket.io'
        });

        this.setupEventHandlers();
        logger.info('WebSocket server initialized');
    }

    /**
     * Setup WebSocket event handlers
     */
    private setupEventHandlers(): void {
        if (!this.io) return;

        this.io.on('connection', (socket) => {
            logger.info(`WebSocket client connected: ${socket.id}`);

            // Handle user authentication
            socket.on('authenticate', (data: { userId: string; token?: string }) => {
                try {
                    // In a production environment, you would validate the token here
                    // For now, we'll trust the userId from the authenticated session
                    this.authenticateUser(socket, data.userId);
                } catch (error) {
                    logger.error('Authentication error:', error);
                    socket.emit('auth_error', { message: 'Authentication failed' });
                }
            });

            // Handle admin subscription to all jobs
            socket.on('subscribe_admin_jobs', () => {
                const userId = this.socketUsers.get(socket.id);
                if (userId) {
                    // In a real app, you'd verify admin role here
                    logger.info(`Admin user ${userId} subscribed to all job updates`);
                    socket.join('admin_jobs');
                }
            });

            // Handle task subscriptions
            socket.on('subscribe_task', (data: { taskId: string }) => {
                socket.join(`task_${data.taskId}`);
                logger.info(`Socket ${socket.id} subscribed to task ${data.taskId}`);
            });

            socket.on('unsubscribe_task', (data: { taskId: string }) => {
                socket.leave(`task_${data.taskId}`);
                logger.info(`Socket ${socket.id} unsubscribed from task ${data.taskId}`);
            });


            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    private authenticateUser(socket: any, userId: string): void {
        // Store user-socket mapping
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socket.id);
        this.socketUsers.set(socket.id, userId);

        socket.emit('authenticated', { userId });
        logger.info(`User ${userId} authenticated with socket ${socket.id}`);
    }

    private handleDisconnect(socket: any): void {
        const userId = this.socketUsers.get(socket.id);
        if (userId) {
            const userSockets = this.userSockets.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    this.userSockets.delete(userId);
                }
            }
            this.socketUsers.delete(socket.id);
            logger.info(`User ${userId} disconnected from socket ${socket.id}`);
        }
    }

    /**
     * Clean old updates periodically
     */
    private cleanOldUpdates(): void {
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

        // Clean task updates
        for (const [taskId, updates] of this.taskUpdates.entries()) {
            const filteredUpdates = updates.filter(update => update.timestamp > cutoffTime);
            if (filteredUpdates.length === 0) {
                this.taskUpdates.delete(taskId);
            } else {
                this.taskUpdates.set(taskId, filteredUpdates);
            }
        }

        // Clean user task updates
        for (const [userId, updates] of this.userTaskUpdates.entries()) {
            const filteredUpdates = updates.filter(update => update.timestamp > cutoffTime);
            if (filteredUpdates.length === 0) {
                this.userTaskUpdates.delete(userId);
            } else {
                this.userTaskUpdates.set(userId, filteredUpdates);
            }
        }


        // Clean system messages
        this.systemMessages = this.systemMessages.filter(msg => msg.timestamp > cutoffTime);
    }

    /**
     * Send task update to connected clients and store for polling fallback
     */
    public sendTaskUpdate(userId: string, update: JobUpdateEvent): void {
        const taskUpdate: TaskUpdate = {
            taskId: update.jobId,
            userId,
            update,
            timestamp: new Date()
        };

        // Send real-time update via WebSocket if connected
        if (this.io) {
            const updatePayload = {
                taskId: update.jobId,
                type: update.type,
                data: update.data,
                timestamp: update.timestamp
            };

            // Send to user's own sockets
            const userSockets = this.userSockets.get(userId);
            if (userSockets && userSockets.size > 0) {
                userSockets.forEach(socketId => {
                    this.io!.to(socketId).emit('task_update', updatePayload);
                });
                logger.info(`Sent real-time task update to user ${userId}, task ${update.jobId}`);
            }

            // Also send to admin subscribers
            this.io.to('admin_jobs').emit('task_update', updatePayload);
        }

        // Store by task ID for polling fallback
        if (!this.taskUpdates.has(update.jobId)) {
            this.taskUpdates.set(update.jobId, []);
        }
        const taskUpdateList = this.taskUpdates.get(update.jobId)!;
        taskUpdateList.push(taskUpdate);

        // Keep only recent updates
        if (taskUpdateList.length > this.MAX_UPDATES_PER_TASK) {
            taskUpdateList.splice(0, taskUpdateList.length - this.MAX_UPDATES_PER_TASK);
        }

        // Store by user ID for polling fallback
        if (!this.userTaskUpdates.has(userId)) {
            this.userTaskUpdates.set(userId, []);
        }
        const userUpdateList = this.userTaskUpdates.get(userId)!;
        userUpdateList.push(taskUpdate);

        // Keep only recent updates
        if (userUpdateList.length > this.MAX_UPDATES_PER_TASK) {
            userUpdateList.splice(0, userUpdateList.length - this.MAX_UPDATES_PER_TASK);
        }
    }


    /**
     * Store progress update
     */
    public sendProgressUpdate(
        taskId: string,
        userId: string,
        progress: number,
        currentStep?: string,
        estimatedTimeRemaining?: number
    ): void {
        const update: JobUpdateEvent = {
            jobId: taskId,
            userId,
            type: 'progress',
            data: {
                progress,
                currentStep,
                estimatedTimeRemaining
            },
            timestamp: new Date()
        };

        this.sendTaskUpdate(userId, update);
    }

    /**
     * Store status change update
     */
    public sendStatusUpdate(
        taskId: string,
        userId: string,
        status: JobStatus | string,
        result?: any,
        error?: string
    ): void {
        const update: JobUpdateEvent = {
            jobId: taskId,
            userId,
            type: status === 'COMPLETED' ? 'completed' : status === 'FAILED' ? 'failed' : 'status',
            data: {
                status,
                result,
                error
            },
            timestamp: new Date()
        };

        this.sendTaskUpdate(userId, update);
    }

    /**
     * Get task updates for polling (API endpoint will use this)
     */
    public getTaskUpdates(taskId: string, since?: Date): TaskUpdate[] {
        const updates = this.taskUpdates.get(taskId) || [];
        if (since) {
            return updates.filter(update => update.timestamp > since);
        }
        return updates;
    }

    /**
     * Get user task updates for polling
     */
    public getUserTaskUpdates(userId: string, since?: Date): TaskUpdate[] {
        const updates = this.userTaskUpdates.get(userId) || [];
        if (since) {
            return updates.filter(update => update.timestamp > since);
        }
        return updates;
    }


    /**
     * Get system messages for polling
     */
    public getSystemMessages(since?: Date): Array<{ type: string; message: string; timestamp: Date }> {
        if (since) {
            return this.systemMessages.filter(msg => msg.timestamp > since);
        }
        return this.systemMessages;
    }

    /**
     * Simulate connected users count (always return 1 for polling mode)
     */
    public getConnectedUsersCount(): number {
        return this.userTaskUpdates.size;
    }

    /**
     * Simulate total connections count
     */
    public getTotalConnectionsCount(): number {
        return this.userTaskUpdates.size;
    }

    /**
     * Check if user has recent updates (simulates connection)
     */
    public isUserConnected(userId: string): boolean {
        const updates = this.userTaskUpdates.get(userId);
        if (!updates || updates.length === 0) return false;

        const lastUpdate = updates[updates.length - 1];
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return lastUpdate.timestamp > fiveMinutesAgo;
    }

    /**
     * Store system message for polling
     */
    public broadcastSystemMessage(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
        this.systemMessages.push({
            type,
            message,
            timestamp: new Date()
        });

        // Keep only recent messages
        if (this.systemMessages.length > 100) {
            this.systemMessages.splice(0, this.systemMessages.length - 100);
        }

        logger.info(`Stored system message: ${message}`);
    }


    /**
     * Cleanup (no-op for polling mode)
     */
    public close(): void {
        this.taskUpdates.clear();
        this.userTaskUpdates.clear();
        this.systemMessages = [];
        logger.info('Polling-based update manager closed');
    }
}

// Export singleton instance
export const webSocketManager = WebSocketManager.getInstance();