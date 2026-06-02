import { NextResponse } from "next/server";
import { addressLookupEnabled, resolveAddressLookupProvider } from "@/lib/address-lookup-config";

export async function GET() {
  return NextResponse.json({
    enabled: addressLookupEnabled(),
    provider: resolveAddressLookupProvider(),
  });
}
