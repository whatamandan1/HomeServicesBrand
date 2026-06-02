import { getAddressConfigured } from "@/lib/getaddress";
import { idealPostcodesConfigured } from "@/lib/ideal-postcodes";

export type AddressLookupProvider = "ideal-postcodes" | "getaddress";

export function addressLookupEnabled(): boolean {
  return idealPostcodesConfigured() || getAddressConfigured();
}

export function resolveAddressLookupProvider(): AddressLookupProvider | null {
  if (idealPostcodesConfigured()) return "ideal-postcodes";
  if (getAddressConfigured()) return "getaddress";
  return null;
}
