import { Card } from "@/components/ui/card";

/**
 * Admin Dashboard Page
 * Overview of recipe statistics and quick actions
 */
export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your recipe management dashboard
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📝</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recipes</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🌟</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📄</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👁️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Views</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/admin/recipes/new"
              className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-blue-600 mr-3">➕</span>
                <span className="font-medium text-blue-900">
                  Create New Recipe
                </span>
              </div>
            </a>
            <a
              href="/admin/recipes/drafts"
              className="block p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-yellow-600 mr-3">📝</span>
                <span className="font-medium text-yellow-900">
                  Review Drafts
                </span>
              </div>
            </a>
            <a
              href="/admin/recipes/published"
              className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-green-600 mr-3">🌟</span>
                <span className="font-medium text-green-900">
                  Manage Published
                </span>
              </div>
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>No recent activity to display.</p>
            <p>Start by creating your first recipe!</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
