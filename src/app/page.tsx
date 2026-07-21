export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-3xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          2D Generator
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">Home</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Start from the main workspace for the live 2D generation demo.
        </p>
      </div>
    </main>
  );
}
