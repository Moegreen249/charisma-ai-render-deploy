import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Most basic test - no database, no auth
    return NextResponse.json({
      status: "success",
      message: "Basic API route working",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error", 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}