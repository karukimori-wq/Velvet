import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "warning",
    supported: false,
    sourceOfTruth: "growth-engine",
    message: "Customer list is owned by Growth Engine. Velvet does not expose an independent Customer master.",
  }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({
    status: "error",
    error: {
      code: "CUSTOMER_CREATION_NOT_OWNED",
      message: "Create Customer in Growth Engine, then open Velvet with customerId.",
    },
  }, { status: 409 });
}
