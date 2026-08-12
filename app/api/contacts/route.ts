export async function GET() {
  return Response.json({
    status: "warning",
    sourceOfTruth: "growth-engine",
    contacts: [],
    message: "Customer contacts are read from Growth Engine and are not canonical in Velvet.",
  });
}

export async function POST() {
  return Response.json({
    status: "error",
    error: {
      code: "CUSTOMER_CONTACT_WRITE_NOT_OWNED",
      message: "Velvet does not create or edit Customer contact master data. Update the Customer in Growth Engine.",
    },
  }, { status: 405 });
}
