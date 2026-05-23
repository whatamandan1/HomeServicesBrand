import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're all set",
  description: "Your GardensSorted subscription is being activated. View your account to see upcoming visits.",
};

export default function SignupSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
