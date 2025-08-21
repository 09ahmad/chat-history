"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Login() {
  const { data: session } = useSession();

  return (
    session ? (
      <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center">
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()} className="mt-4 px-4 py-2 bg-red-500 rounded">
          Sign out
        </button>
      </div>
    ) : (
      <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center">
        <p>Not signed in</p>
        <button onClick={() => signIn("google")} className="mt-4 px-4 py-2 bg-green-500 rounded">
          Sign in with Google
        </button>
      </div>
    )
  );
}
