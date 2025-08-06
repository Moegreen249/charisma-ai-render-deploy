const { Server: SocketIOServer } = require('socket.io');

class WebSocketManager {
    constructor() {
        this.io = null;
        this.userSockets = new Map(); // userId -> Set of socketIds
        this.socketUsers = new Map(); // socketId -> userId
        
        // Polling mode storage
        this.taskUpdates = new Map();
        this.userTaskUpdates = new Map();
        this.systemMessages = [];
        this.MAX_UPDATES_PER_TASK = 50;
    }

    static getInstance() {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    /**
     * Initialize WebSocket server
     */
    initialize(server) {
        if (this.io) {
            console.warn('WebSocket server already initialized');
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
        console.log('WebSocket server initialized');
    }

    /**
     * Setup WebSocket event handlers
     */
    setupEventHandlers() {
        if (!this.io) return;

        this.io.on('connection', (socket) => {
            console.log(`WebSocket client connected: ${socket.id}`);

            // Handle user authentication
            socket.on('authenticate', (data) => {
                try {
                    this.authenticateUser(socket, data.userId);
                } catch (error) {
                    console.error('Authentication error:', error);
                    socket.emit('auth_error', { message: 'Authentication failed' });
                }
            });

            // Handle admin subscription to all jobs
            socket.on('subscribe_admin_jobs', () => {
                const userId = this.socketUsers.get(socket.id);
                if (userId) {
                    console.log(`Admin user ${userId} subscribed to all job updates`);
                    socket.join('admin_jobs');
                }
            });

            // Handle task subscriptions
            socket.on('subscribe_task', (data) => {
                socket.join(`task_${data.taskId}`);
                console.log(`Socket ${socket.id} subscribed to task ${data.taskId}`);
            });

            socket.on('unsubscribe_task', (data) => {
                socket.leave(`task_${data.taskId}`);
                console.log(`Socket ${socket.id} unsubscribed from task ${data.taskId}`);
            });

            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    authenticateUser(socket, userId) {
        // Store user-socket mapping
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(socket.id);
        this.socketUsers.set(socket.id, userId);

        socket.emit('authenticated', { userId });
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
    }

    handleDisconnect(socket) {
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
            console.log(`User ${userId} disconnected from socket ${socket.id}`);
        }
    }

    /**
     * Send task update to connected clients and store for polling fallback
     */
    sendTaskUpdate(userId, update) {
        const taskUpdate = {
            taskId: update.taskId,
            userId,
            update,
            timestamp: new Date()
        };

        // Send real-time update via WebSocket if connected
        if (this.io) {
            const updatePayload = {
                taskId: update.taskId,
                type: update.type,
                data: update.data,
                timestamp: update.timestamp
            };

            // Send to user's own sockets
            const userSockets = this.userSockets.get(userId);
            if (userSockets && userSockets.size > 0) {
                userSockets.forEach(socketId => {
                    this.io.to(socketId).emit('task_update', updatePayload);
                });
                console.log(`Sent real-time task update to user ${userId}, task ${update.taskId}`);
            }

            // Also send to admin subscribers
            this.io.to('admin_jobs').emit('task_update', updatePayload);
        }

        // Store by task ID for polling fallback
        if (!this.taskUpdates.has(update.taskId)) {
            this.taskUpdates.set(update.taskId, []);
        }
        const taskUpdateList = this.taskUpdates.get(update.taskId);
        taskUpdateList.push(taskUpdate);

        // Keep only recent updates
        if (taskUpdateList.length > this.MAX_UPDATES_PER_TASK) {
            taskUpdateList.splice(0, taskUpdateList.length - this.MAX_UPDATES_PER_TASK);
        }

        // Store by user ID for polling fallback
        if (!this.userTaskUpdates.has(userId)) {
            this.userTaskUpdates.set(userId, []);
        }
        const userUpdateList = this.userTaskUpdates.get(userId);
        userUpdateList.push(taskUpdate);

        // Keep only recent updates
        if (userUpdateList.length > this.MAX_UPDATES_PER_TASK) {
            userUpdateList.splice(0, userUpdateList.length - this.MAX_UPDATES_PER_TASK);
        }
    }

    /**
     * Store progress update
     */
    sendProgressUpdate(taskId, userId, progress, currentStep, estimatedTimeRemaining) {
        const update = {
            taskId,
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
    sendStatusUpdate(taskId, userId, status, result, error) {
        const update = {
            taskId,
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
    getTaskUpdates(taskId, since) {
        const updates = this.taskUpdates.get(taskId) || [];
        if (since) {
            return updates.filter(update => update.timestamp > since);
        }
        return updates;
    }

    /**
     * Get user task updates for polling
     */
    getUserTaskUpdates(userId, since) {
        const updates = this.userTaskUpdates.get(userId) || [];
        if (since) {
            return updates.filter(update => update.timestamp > since);
        }
        return updates;
    }

    /**
     * Get system messages for polling
     */
    getSystemMessages(since) {
        if (since) {
            return this.systemMessages.filter(msg => msg.timestamp > since);
        }
        return this.systemMessages;
    }

    /**
     * Simulate connected users count (always return 1 for polling mode)
     */
    getConnectedUsersCount() {
        return this.userTaskUpdates.size;
    }

    /**
     * Simulate total connections count
     */
    getTotalConnectionsCount() {
        return this.userTaskUpdates.size;
    }

    /**
     * Check if user has recent updates (simulates connection)
     */
    isUserConnected(userId) {
        const updates = this.userTaskUpdates.get(userId);
        if (!updates || updates.length === 0) return false;

        const lastUpdate = updates[updates.length - 1];
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return lastUpdate.timestamp > fiveMinutesAgo;
    }

    /**
     * Store system message for polling
     */
    broadcastSystemMessage(message, type = 'info') {
        this.systemMessages.push({
            type,
            message,
            timestamp: new Date()
        });

        // Keep only recent messages
        if (this.systemMessages.length > 100) {
            this.systemMessages.splice(0, this.systemMessages.length - 100);
        }

        console.log(`Stored system message: ${message}`);
    }

    /**
     * Cleanup (no-op for polling mode)
     */
    close() {
        this.taskUpdates.clear();
        this.userTaskUpdates.clear();
        this.systemMessages = [];
        console.log('Polling-based update manager closed');
    }
}

// Export singleton instance
const webSocketManager = WebSocketManager.getInstance();

module.exports = {
    WebSocketManager,
    webSocketManager
};