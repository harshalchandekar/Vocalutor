import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F8F8F7] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#E03E1A] mb-3">
        404 — Page Not Found
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#0F0F10] tracking-tight mb-3">
        We couldn&apos;t find that page
      </h1>
      <p className="text-sm text-neutral-600 max-w-md mb-8">
        The tutor or page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold text-white bg-[#0F0F10] hover:bg-[#E03E1A] rounded-xl transition-colors"
      >
        Back to Home
      </Link>
    </main>
  );
}
