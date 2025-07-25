import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { RedisService } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Set up SSE headers
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const encoder = new TextEncoder();
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "connected", message: "Connected to notifications" })}\n\n`,
          ),
        );

        // Subscribe to Redis channels for this user
        const channels = [
          `user:${userId}:notifications`,
          `job_updates`,
          `analysis_complete`,
          `system_announcements`,
        ];

        const subscriptions = channels.map((channel) => {
          return RedisService.subscribeToNotifications(channel, (data) => {
            try {
              // Filter notifications for this user if needed
              if (data.userId && data.userId !== userId) {
                return;
              }

              // Check if controller is still active before sending
              if (controller.desiredSize !== null) {
                // Send notification to client
                const message = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
              }
            } catch (error) {
              console.error("Error sending notification:", error);
            }
          });
        });

        // Keep connection alive with periodic heartbeat
        const heartbeat = setInterval(() => {
          try {
            // Check if controller is still active before sending heartbeat
            if (controller.desiredSize !== null) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`,
                ),
              );
            } else {
              clearInterval(heartbeat);
            }
          } catch (error) {
            console.error("Heartbeat error:", error);
            clearInterval(heartbeat);
          }
        }, 30000); // Every 30 seconds

        // Cleanup function
        const cleanup = () => {
          clearInterval(heartbeat);
          // Note: Redis subscription cleanup would be handled by the RedisService
          // In a production setup, you'd want to track and cleanup subscriptions
        };

        // Handle client disconnect
        request.signal?.addEventListener("abort", cleanup);

        // Store cleanup function for later use
        (controller as any).cleanup = cleanup;
      },

      cancel() {
        // Cleanup when stream is cancelled
        if ((this as any).cleanup) {
          (this as any).cleanup();
        }
      },
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error("SSE setup error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
