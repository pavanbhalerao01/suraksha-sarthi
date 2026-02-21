export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-bold text-gray-900">
                Survive<span className="text-purple-600">.exe</span>
              </a>
              <div className="hidden md:flex space-x-3">
                <NavLink href="/dashboard">Overview</NavLink>
                <NavLink href="/dashboard/heatmap">Heatmap</NavLink>
                <NavLink href="/dashboard/forecast">Forecast</NavLink>
                <NavLink href="/dashboard/coordination">Coordination</NavLink>
                <NavLink href="/dashboard/incidents">Incidents</NavLink>
                <NavLink href="/dashboard/volunteers">Volunteers</NavLink>
                <NavLink href="/dashboard/hospitals">Hospitals</NavLink>
                <NavLink href="/dashboard/relief-camps">Relief</NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Maharashtra Dashboard</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-gray-600 hover:text-purple-600 font-medium transition text-sm"
    >
      {children}
    </a>
  );
}
