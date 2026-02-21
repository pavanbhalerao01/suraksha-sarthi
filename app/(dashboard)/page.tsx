export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Disaster Management Dashboard
        </h1>
        <p className="text-gray-600">
          Risk assessment & emergency coordination for Maharashtra
        </p>
        <div className="mt-4 flex gap-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            PRE-DISASTER: Risk Prediction
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            DURING-DISASTER: Live Coordination
          </span>
        </div>
      </div>

      {/* Key Metrics - PRE-DISASTER */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Pre-Disaster Monitoring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Districts Monitored"
            value="36"
            subtitle="Across Maharashtra"
            color="blue"
          />
          <MetricCard
            title="Active Alerts"
            value="3"
            subtitle="High risk regions"
            color="red"
          />
          <MetricCard
            title="Avg Risk Score"
            value="42"
            subtitle="Moderate level"
            color="yellow"
          />
          <MetricCard
            title="Model Accuracy"
            value="87%"
            subtitle="Flood prediction"
            color="green"
          />
        </div>
      </div>

      {/* Key Metrics - DURING-DISASTER */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          Active Disaster Coordination
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Active Incidents"
            value="0"
            subtitle="Awaiting response"
            color="red"
          />
          <MetricCard
            title="Teams Deployed"
            value="0"
            subtitle="NDRF/SDRF/Fire"
            color="yellow"
          />
          <MetricCard
            title="Volunteers Active"
            value="0"
            subtitle="Verified & deployed"
            color="blue"
          />
          <MetricCard
            title="Avg Response Time"
            value="--"
            subtitle="No active incidents"
            color="green"
          />
        </div>
      </div>

      {/* Quick Links - PRE-DISASTER */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Pre-Disaster Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink
            title="View Risk Heatmap"
            description="District-level risk visualization with real-time updates"
            href="/dashboard/heatmap"
            icon="🗺️"
          />
          <QuickLink
            title="7-Day Forecast"
            description="ML-powered predictions for floods, droughts, and heatwaves"
            href="/dashboard/forecast"
            icon="📊"
          />
          <QuickLink
            title="Send Alerts"
            description="Create and manage disaster warnings for specific regions"
            href="/dashboard/alerts"
            icon="🚨"
          />
          <QuickLink
            title="Historical Data"
            description="Analyze patterns from past disasters in Maharashtra"
            href="/dashboard/history"
            icon="📈"
          />
        </div>
      </div>

      {/* Quick Links - DURING-DISASTER */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Emergency Coordination</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink
            title="Live Coordination Map"
            description="Real-time view of incidents, teams, and resources"
            href="/dashboard/coordination"
            icon="🎯"
          />
          <QuickLink
            title="Incident Management"
            description="Report, assign, and track emergency incidents"
            href="/dashboard/incidents"
            icon="🚨"
          />
          <QuickLink
            title="Team Tracking"
            description="Monitor NDRF/SDRF/Fire teams and deployments"
            href="/dashboard/teams"
            icon="👥"
          />
          <QuickLink
            title="Volunteer Portal"
            description="Register, verify, and deploy volunteers safely"
            href="/dashboard/volunteers"
            icon="🤝"
          />
          <QuickLink
            title="Resource Tracking"
            description="Supply chain management for relief materials"
            href="/dashboard/resources"
            icon="📦"
          />
          <QuickLink
            title="Relief Camps"
            description="Manage evacuation centers and shelter operations"
            href="/dashboard/camps"
            icon="⛺"
          />
          <QuickLink
            title="SOS Alerts"
            description="Emergency distress signals from citizens"
            href="/dashboard/sos"
            icon="🆘"
          />
          <QuickLink
            title="Citizen Reporting"
            description="Crowdsourced incident reports and validation"
            href="/dashboard/reports"
            icon="📱"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <ActivityItem
            title="High flood risk detected in Pune"
            time="15 minutes ago"
            type="warning"
          />
          <ActivityItem
            title="Alert sent to 25,000 residents in Kolhapur"
            time="2 hours ago"
            type="info"
          />
          <ActivityItem
            title="Weather data updated from IMD"
            time="3 hours ago"
            type="success"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "red" | "yellow" | "green";
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
    yellow: "text-yellow-600 bg-yellow-50",
    green: "text-green-600 bg-green-50",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-xs text-gray-700 mt-1">{subtitle}</div>
    </div>
  );
}

function QuickLink({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        <div className="text-4xl">{icon}</div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </a>
  );
}

function ActivityItem({
  title,
  time,
  type,
}: {
  title: string;
  time: string;
  type: "warning" | "info" | "success";
}) {
  const colors = {
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type]}`}>
          {type}
        </span>
        <span className="text-sm text-gray-900">{title}</span>
      </div>
      <span className="text-xs text-gray-700">{time}</span>
    </div>
  );
}
