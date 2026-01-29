export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-bg-100 border border-border rounded-lg p-6">
          <h2 className="text-sm font-medium text-fg-500 mb-2">Total Workouts</h2>
          <p className="text-3xl font-bold text-fg">0</p>
        </div>
        <div className="bg-bg-100 border border-border rounded-lg p-6">
          <h2 className="text-sm font-medium text-fg-500 mb-2">This Week</h2>
          <p className="text-3xl font-bold text-fg">0</p>
        </div>
        <div className="bg-bg-100 border border-border rounded-lg p-6">
          <h2 className="text-sm font-medium text-fg-500 mb-2">Current Streak</h2>
          <p className="text-3xl font-bold text-fg">0 days</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-fg mb-4">Recent Workouts</h2>
        <div className="bg-bg-100 border border-border rounded-lg p-8 text-center">
          <p className="text-fg-500">No workouts yet. Start tracking your progress!</p>
        </div>
      </div>
    </div>
  );
}
