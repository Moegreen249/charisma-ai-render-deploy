"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Settings, Calendar, Mail, Download, Eye, EyeOff, Save, RefreshCw, Rocket,  } from "lucide-react";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { cn } from "@/lib/utils";

interface CountdownData {
  id?: string;
  targetDate: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  completedTitle: string;
  completedSubtitle: string;
}

interface WaitingListEntry {
  id: string;
  email: string;
  name: string;
  company?: string;
  useCase?: string;
  source?: string;
  position: number;
  isNotified: boolean;
  inviteCode?: string;
  createdAt: string;
}

interface WaitingListStats {
  totalSignups: number;
  recentSignups: number;
  notifiedCount: number;
}

export default function AdminLaunchPage() {
  const { status } = useSession();
  const [countdownData, setCountdownData] = useState<CountdownData>({
    targetDate: "",
    title: "CharismaAI is Coming Soon",
    subtitle: "Get ready for AI-powered communication insights",
    isActive: true,
    showDays: true,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    completedTitle: "CharismaAI is Now Live!",
    completedSubtitle: "Start analyzing your conversations today",
  });

  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [waitingListStats, setWaitingListStats] = useState<WaitingListStats>({
    totalSignups: 0,
    recentSignups: 0,
    notifiedCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Check admin access
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/auth/signin";
    }
  }, [status]);

  // Fetch countdown data
  useEffect(() => {
    const fetchCountdownData = async () => {
      try {
        const response = await fetch("/api/launch-countdown");
        if (response.ok) {
          const data = await response.json();
          setCountdownData(data);
        }
      } catch (error) {
        console.error("Failed to fetch countdown data:", error);
      }
    };

    fetchCountdownData();
  }, []);

  // Fetch waiting list data
  useEffect(() => {
    const fetchWaitingListData = async () => {
      try {
        const [listResponse, statsResponse] = await Promise.all([
          fetch("/api/admin/waiting-list"),
          fetch("/api/waiting-list"),
        ]);

        if (listResponse.ok) {
          const listData = await listResponse.json();
          setWaitingList(listData.entries || []);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setWaitingListStats((prev) => ({
            ...prev,
            totalSignups: statsData.totalSignups || 0,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch waiting list data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitingListData();
  }, []);

  const handleSaveCountdown = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const method = countdownData.id ? "PUT" : "POST";
      const response = await fetch("/api/launch-countdown", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(countdownData),
      });

      if (response.ok) {
        const result = await response.json();
        setCountdownData(result.countdown);
        setMessage({
          type: "success",
          text: "Countdown settings saved successfully!",
        });
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to save countdown settings",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save countdown settings" });
    } finally {
      setSaving(false);
    }
  };

  const exportWaitingList = () => {
    const csvContent = [
      [
        "Position",
        "Email",
        "Name",
        "Company",
        "Use Case",
        "Source",
        "Signup Date",
        "Invite Code",
      ],
      ...waitingList.map((entry) => [
        entry.position,
        entry.email,
        entry.name,
        entry.company || "",
        entry.useCase || "",
        entry.source || "",
        new Date(entry.createdAt).toLocaleDateString(),
        entry.inviteCode || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `charisma-ai-waiting-list-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white/70">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Rocket className="mr-3 h-6 w-6" />
                Launch Management
              </h1>
              <p className="text-white/70 mt-1">
                Manage countdown timer and waiting list
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-green-500/20 text-green-300 border-green-500/30"
            >
              <Rocket className="w-3 h-3 mr-1" />
              Admin Panel
            </Badge>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="mb-6">
          <div
            className={cn(
              "flex items-center gap-2 p-4 rounded-lg backdrop-blur-md border",
              message.type === "success"
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "bg-red-500/20 text-red-300 border-red-500/30",
            )}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <Tabs defaultValue="countdown" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border border-white/20">
            <TabsTrigger value="countdown" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Countdown Timer
            </TabsTrigger>
            <TabsTrigger
              value="waiting-list"
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Waiting List
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Countdown Timer Tab */}
          <TabsContent value="countdown" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Countdown Configuration */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="w-5 h-5" />
                    Countdown Configuration
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Configure the launch countdown timer display
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Target Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Target Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={countdownData.targetDate.slice(0, 16)}
                      onChange={(e) =>
                        setCountdownData((prev) => ({
                          ...prev,
                          targetDate: new Date(e.target.value).toISOString(),
                        }))
                      }
                      className="w-full bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Main Title
                    </label>
                    <Input
                      value={countdownData.title}
                      onChange={(e) =>
                        setCountdownData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="CharismaAI is Coming Soon"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Subtitle
                    </label>
                    <Textarea
                      value={countdownData.subtitle || ""}
                      onChange={(e) =>
                        setCountdownData((prev) => ({
                          ...prev,
                          subtitle: e.target.value,
                        }))
                      }
                      placeholder="Get ready for AI-powered communication insights"
                      rows={2}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <Separator />

                  {/* Completion Messages */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Completion Title
                    </label>
                    <Input
                      value={countdownData.completedTitle || ""}
                      onChange={(e) =>
                        setCountdownData((prev) => ({
                          ...prev,
                          completedTitle: e.target.value,
                        }))
                      }
                      placeholder="CharismaAI is Now Live!"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Completion Subtitle
                    </label>
                    <Textarea
                      value={countdownData.completedSubtitle || ""}
                      onChange={(e) =>
                        setCountdownData((prev) => ({
                          ...prev,
                          completedSubtitle: e.target.value,
                        }))
                      }
                      placeholder="Start analyzing your conversations today"
                      rows={2}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Display Options */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Eye className="w-5 h-5" />
                    Display Options
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Choose which elements to display in the countdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <div className="font-medium text-white">
                        Countdown Active
                      </div>
                      <div className="text-sm text-white/60">
                        Show countdown on landing page
                      </div>
                    </div>
                    <Button
                      variant={countdownData.isActive ? "secondary" : "outline"}
                      size="sm"
                      onClick={() =>
                        setCountdownData((prev) => ({
                          ...prev,
                          isActive: !prev.isActive,
                        }))
                      }
                    >
                      {countdownData.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Time Unit Toggles */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">
                      Show Time Units
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: "showDays", label: "Days" },
                        { key: "showHours", label: "Hours" },
                        { key: "showMinutes", label: "Minutes" },
                        { key: "showSeconds", label: "Seconds" },
                      ].map(({ key, label }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-white/70">{label}</span>
                          <input
                            type="checkbox"
                            checked={
                              countdownData[
                                key as keyof CountdownData
                              ] as boolean
                            }
                            onChange={(e) =>
                              setCountdownData((prev) => ({
                                ...prev,
                                [key]: e.target.checked,
                              }))
                            }
                            className="rounded border-white/30 bg-white/10 text-purple-400 focus:ring-purple-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveCountdown}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? "Saving..." : "Save Configuration"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Waiting List Tab */}
          <TabsContent value="waiting-list" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">
                        Total Signups
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {waitingListStats.totalSignups}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Mail className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">
                        Notified Users
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {waitingListStats.notifiedCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">
                        Recent (7 days)
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {waitingListStats.recentSignups}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Waiting List Table */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Waiting List Entries</CardTitle>
                    <CardDescription className="text-white/60">
                      Manage users waiting for access
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={exportWaitingList} 
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 touch-manipulation hover:scale-105 transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-2 text-white">#</th>
                        <th className="text-left p-2 text-white">Name</th>
                        <th className="text-left p-2 text-white">Email</th>
                        <th className="text-left p-2 text-white">Company</th>
                        <th className="text-left p-2 text-white">Use Case</th>
                        <th className="text-left p-2 text-white">Source</th>
                        <th className="text-left p-2 text-white">Signup Date</th>
                        <th className="text-left p-2 text-white">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitingList.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-white/10 hover:bg-white/5"
                        >
                          <td className="p-2 font-medium text-white">#{entry.position}</td>
                          <td className="p-2 text-white/80">{entry.name}</td>
                          <td className="p-2 text-white/80">{entry.email}</td>
                          <td className="p-2 text-white/70">{entry.company || "-"}</td>
                          <td className="p-2 text-white/70">{entry.useCase || "-"}</td>
                          <td className="p-2 text-white/70">{entry.source || "-"}</td>
                          <td className="p-2 text-white/70">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                entry.isNotified ? "secondary" : "outline"
                              }
                            >
                              {entry.isNotified ? "Notified" : "Waiting"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {waitingList.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                      No waiting list entries yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="w-5 h-5" />
                  Launch Analytics
                </CardTitle>
                <CardDescription className="text-white/60">
                  Track launch performance and user engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-white/60">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-white/30" />
                  <p className="text-white">Analytics dashboard coming soon</p>
                  <p className="text-sm text-white/70">
                    Track signup rates, conversion metrics, and user engagement
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
