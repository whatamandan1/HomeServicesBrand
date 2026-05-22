export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gardens-primary px-8 py-12 text-white">
        <h1 className="text-4xl font-bold">Garden care, sorted.</h1>
        <p className="mt-4 max-w-xl text-gardens-accent">
          Recurring gardening subscriptions for Yorkshire homes. Subscribe online, we handle scheduling and your gardener.
        </p>
        <a
          href="/signup"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-medium text-gardens-dark"
        >
          Get started
        </a>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Subscribe", "Pick a plan and pay online in minutes."],
          ["We schedule", "Recurring visits in your availability window."],
          ["Local gardeners", "Approved providers claim work in your area."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gardens-primary">{title}</h2>
            <p className="mt-2 text-sm text-stone-600">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
