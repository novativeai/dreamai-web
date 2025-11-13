import Link from "next/link";
import { ROUTES } from "@/utils/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-brand mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-neutral-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          href={ROUTES.GENERATOR}
          className="inline-block button-primary"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
