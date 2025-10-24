import Link from "next/link";

export default function RecipeNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Recipe Not Found
          </h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the recipe you're looking for. It might have
            been removed or the link might be incorrect.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Browse All Recipes
          </Link>
          <Link
            href="/"
            className="inline-block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            Looking for something specific?{" "}
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Check out all our recipes
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
