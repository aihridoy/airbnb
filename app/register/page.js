/* eslint-disable react/no-unescaped-entities */
"use client"
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const RegistrationPage = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        location: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Registration failed");
            }

            await response.json();
            router.push('/login')
            alert("Registration successful!");
        } catch (err) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleAuth = (e) => {
        signIn("google", { callbackUrl: '/' })
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-5">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Register for Hotel Booking
                    </h2>
                    <p className="text-gray-600 text-sm mt-2">
                        Join us and enjoy seamless bookings.
                    </p>
                </div>
                <div className="space-y-4 mb-6">
                    <button
                        onClick={handleAuth}
                        className="w-full flex items-center justify-center border border-gray-300 rounded-full py-3 hover:bg-gray-50 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 48 48"
                            className="mr-3"
                        >
                            <path
                                fill="#FFC107"
                                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                            />
                            <path
                                fill="#FF3D00"
                                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                            />
                            <path
                                fill="#4CAF50"
                                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                            />
                            <path
                                fill="#1976D2"
                                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                            />
                        </svg>
                        Sign up with Google
                    </button>
                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-gray-500 text-sm">or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            id='name'
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            id='email'
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            id='password'
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <input
                            type="text"
                            name="location"
                            id='location'
                            placeholder="Location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white rounded-full py-3 hover:bg-primary-dark transition"
                        >
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
                <div className="text-center text-sm text-gray-600">
                    <p>
                        Already have an account?
                        <Link href="/login" className="text-primary hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;
