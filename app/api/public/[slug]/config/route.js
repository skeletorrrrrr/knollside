import { NextResponse } from "next/server";
import { getPublicConfig } from "@/lib/publicConfig";

export async function GET(_request, { params }) {
  const result = await getPublicConfig(params.slug);

  if (result.error === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result.error === "unavailable") {
    return NextResponse.json({ error: "This estimator is temporarily unavailable." }, { status: 402 });
  }
  return NextResponse.json(result);
}
