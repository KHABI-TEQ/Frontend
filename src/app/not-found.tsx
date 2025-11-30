import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4EFE7] via-white to-[#F0F9F1] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          Could not find the requested resource
        </p>
        <Link
          href="/"
          className="inline-block bg-[#8DDB90] hover:bg-[#76c77a] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
