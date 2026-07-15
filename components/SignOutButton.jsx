"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const SignOutButton = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            type="button"
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
            Sign Out
        </button>
    );
};

export default SignOutButton;
