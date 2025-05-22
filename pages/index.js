// pages/index.js
import { useSession, signIn, signOut } from 'next-auth/react';
import { Calendar } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
        <Calendar /> Calendar AI Assistant
      </h1>
      {!session ? (
        <button
          className="bg-white text-black font-bold py-2 px-6 rounded-xl hover:bg-gray-200 transition"
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </button>
      ) : (
        <div className="text-center">
          <p className="text-xl mb-4">Welcome, {session.user?.name}!</p>
          <a
            href="/api/events"
            className="inline-block bg-green-500 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition"
          >
            View Today’s Events
          </a>
          <button
            className="block mt-4 text-red-400 hover:underline"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
