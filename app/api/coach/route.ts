import { streamCoachResponse } from "@/app/actions/coach";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stream = await streamCoachResponse(body);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    return new Response(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        status: 500,
      },
    );
  }
}
