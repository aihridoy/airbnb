/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function NotFound({ error, reset }) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-cream text-center">
            <h1 className="font-serif text-6xl text-ink mb-4">404</h1>
            <p className="text-lg text-muted mb-8">Looks like you've ventured into the unknown.</p>
            <Link href="/" className="px-6 py-3 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors">
                Return Home
            </Link>
        </main>
    );
}
