import Link from "next/link";

export default function RecipeNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <h1 className="mb-4 text-6xl font-bold text-gray-300">404</h1>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
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
            className="inline-block w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Browse All Recipes
          </Link>
          <Link
            href="/"
            className="inline-block w-full rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
