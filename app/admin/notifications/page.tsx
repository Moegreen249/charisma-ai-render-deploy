'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Send, Trash2, Eye, EyeOff, RefreshCw, Users, User } from 'lucide-react';
import { Filter } from 'lucide-react';
import { BarChart3 } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
// Simple toast replacement - replace with your preferred toast library
const toast = {
  success: (message: string) => alert(`Success: ${message}`),
  error: (message: string) => alert(`Error: ${message}`)
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  persistent: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: any;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: { type: string; count: number }[];
}

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, byType: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    userId: '',
    unreadOnly: false,
    page: 1,
    limit: 50
  });

  // New notification form
  const [showNewNotificationForm, setShowNewNotificationForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: 'general',
    title: '',
    message: '',
    sendToAll: false,
    userId: '',
    persistent: true,
    channels: ['all'] as string[]
  });

  const notificationTypes = [
    'analysis_complete',
    'analysis_failed', 
    'task_progress',
    'task_completed',
    'task_failed',
    'system_maintenance',
    'general'
  ];

  const channelOptions = [
    { value: 'all', label: 'All Channels' },
    { value: 'database', label: 'Database Only' },
    { value: 'websocket', label: 'WebSocket Only' },
    { value: 'redis', label: 'Redis Only' }
  ];

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filters]);

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      params.set('page', filters.page.toString());
      params.set('limit', filters.limit.toString());
      if (filters.type) params.set('type', filters.type);
      if (filters.userId) params.set('userId', filters.userId);
      if (filters.unreadOnly) params.set('unreadOnly', 'true');

      const response = await fetch(`/api/admin/notifications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/notifications?stats=true');
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendNewNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) {
        toast.error('Title and message are required');
        return;
      }

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification)
      });

      if (!response.ok) throw new Error('Failed to send notification');
      
      const data = await response.json();
      toast.success(data.message);
      
      // Reset form
      setNewNotification({
        type: 'general',
        title: '',
        message: '',
        sendToAll: false,
        userId: '',
        persistent: true,
        channels: ['all']
      });
      setShowNewNotificationForm(false);
      
      // Refresh data
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedNotifications.length === 0) {
      toast.error('No notifications selected');
      return;
    }

    try {
      const response = await fetch('/api/admin/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notificationIds: selectedNotifications
        })
      });

      if (!response.ok) throw new Error(`Failed to ${action}`);
      
      const data = await response.json();
      toast.success(data.message);
      
      setSelectedNotifications([]);
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
      toast.error(`Failed to ${action}`);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      analysis_complete: 'bg-green-100 text-green-800',
      analysis_failed: 'bg-red-100 text-red-800',
      task_progress: 'bg-blue-100 text-blue-800',
      task_completed: 'bg-green-100 text-green-800',
      task_failed: 'bg-red-100 text-red-800',
      system_maintenance: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Unified Notifications
          </h1>
          <p className="text-muted-foreground">
            Manage all system notifications across database, WebSocket, and Redis channels
          </p>
        </div>
        <Button onClick={() => setShowNewNotificationForm(!showNewNotificationForm)}>
          <Send className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Types</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* New Notification Form */}
      {showNewNotificationForm && (
        <Card>
          <CardHeader>
            <CardTitle>Send New Notification</CardTitle>
            <CardDescription>Send unified notifications across all channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select value={newNotification.type} onValueChange={(value) => 
                  setNewNotification(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Channels</label>
                <Select value={newNotification.channels[0]} onValueChange={(value) => 
                  setNewNotification(prev => ({ ...prev, channels: [value] }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelOptions.map(channel => (
                      <SelectItem key={channel.value} value={channel.value}>{channel.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                className="w-full p-2 border rounded-md resize-none"
                rows={3}
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendToAll"
                  checked={newNotification.sendToAll}
                  onCheckedChange={(checked) => 
                    setNewNotification(prev => ({ ...prev, sendToAll: checked as boolean }))
                  }
                />
                <label htmlFor="sendToAll" className="text-sm">Send to all users</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="persistent"
                  checked={newNotification.persistent}
                  onCheckedChange={(checked) => 
                    setNewNotification(prev => ({ ...prev, persistent: checked as boolean }))
                  }
                />
                <label htmlFor="persistent" className="text-sm">Persistent</label>
              </div>
            </div>

            {!newNotification.sendToAll && (
              <div>
                <label className="block text-sm font-medium mb-2">User ID</label>
                <Input
                  value={newNotification.userId}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Enter user ID"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={sendNewNotification}>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
              <Button variant="outline" onClick={() => setShowNewNotificationForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.type} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, type: value, page: 1 }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {notificationTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by User ID"
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value, page: 1 }))}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="unreadOnly"
                checked={filters.unreadOnly}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, unreadOnly: checked as boolean, page: 1 }))
                }
              />
              <label htmlFor="unreadOnly" className="text-sm">Unread only</label>
            </div>

            <Button onClick={() => fetchNotifications()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {selectedNotifications.length} selected
              </span>
              <Button size="sm" onClick={() => handleBulkAction('markAsRead')}>
                <Eye className="w-4 h-4 mr-1" />
                Mark Read
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('markAsUnread')}>
                <EyeOff className="w-4 h-4 mr-1" />
                Mark Unread
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('resend')}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Resend
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedNotifications(prev => [...prev, notification.id]);
                        } else {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="destructive">Unread</Badge>
                        )}
                        {notification.persistent && (
                          <Badge variant="outline">Persistent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {notification.user.name} ({notification.user.email})
                        </span>
                        <span>Created: {formatDate(notification.createdAt)}</span>
                        {notification.readAt && (
                          <span>Read: {formatDate(notification.readAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No notifications found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}