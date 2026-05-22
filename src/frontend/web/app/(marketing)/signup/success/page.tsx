import Link from "next/link";

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-[50vh] items-center py-20">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="rounded-2xl border border-stone-200 bg-white p-10 shadow-soft">
          <p className="text-4xl">✓</p>
          <h1 className="mt-4 font-display text-2xl font-bold text-gardens-dark">Payment received</h1>
          <p className="mt-3 text-stone-600">
            Your subscription is being activated. You&apos;ll see your visits in the portal shortly.
          </p>
          <Link
            href="/portal"
            className="mt-8 inline-block rounded-full bg-gardens-primary px-8 py-3 text-sm font-semibold text-white hover:bg-gardens-dark"
          >
            Go to your portal
          </Link>
        </div>
      </div>
    </div>
  );
}
