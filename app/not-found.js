/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";


export default function NotFound({ error, reset }) {


    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-6xl font-bold text-red-600 mb-4">404 - Oops!</h1>
            <p className="text-xl text-gray-600 mb-6">Looks like you've ventured into the unknown.</p>
            <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                Return Home
            </Link>
        </main>
    );
}
