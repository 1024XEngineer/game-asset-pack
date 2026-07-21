export default function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Settings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Manage workspace preferences, account usage, credits, and billing settings here.
        </p>
      </div>
    </main>
  );
}
