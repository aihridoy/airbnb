"use client";

import { doSignOut } from "@/app/action";

const SignOutButton = () => {
    const handleSignOut = async () => {
        await doSignOut();
        window.location.reload();
    }
    return (
        <button
            onClick={handleSignOut}
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
            Sign Out
        </button>
    );
};

export default SignOutButton;
