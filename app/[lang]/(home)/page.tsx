import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold">Welcome to e-INFRA CZ Documentation!</h1>
      <p className="text-fd-muted-foreground">
      The home for documentation of all e-INFRA CZ services that are provided to scientific community in the Czech Republic.
      </p>
    </main>
  );
}
