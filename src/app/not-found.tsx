import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#EEF4EF] via-white to-[#F6FBF7] px-6 sm:px-8">
      
      {/* 404 Anchor */}
      <div className="relative flex items-center justify-center w-full max-w-lg mb-6">
        <span className="text-[80px] sm:text-[120px] font-extrabold text-[#8DDB90] leading-none">
          404
        </span>
        <span className="absolute top-[50%] transform -translate-y-1/2 left-1/2 -translate-x-1/2 text-[14px] sm:text-sm font-medium text-gray-500 tracking-widest">
          PAGE NOT FOUND
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-center text-sm sm:text-base max-w-md leading-relaxed mb-8">
        Oops! The page you're looking for doesn't exist, or the link may have expired. 
        Try returning home or contact support for help.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xs sm:max-w-none">
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-lg text-white font-semibold text-sm sm:text-base bg-[#8DDB90] hover:bg-[#76C77A] transition-colors duration-200"
        >
          Back to Home
        </Link>

        <Link
          href="/contact"
          className="w-full sm:w-auto px-6 py-3 rounded-lg text-gray-700 font-semibold text-sm sm:text-base border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
        >
          Contact Support
        </Link>
      </div>

      {/* Footer Hint */}
      <p className="mt-10 text-xs sm:text-sm text-gray-400 text-center">
        Error code: 404
      </p>
    </div>
  );
}
