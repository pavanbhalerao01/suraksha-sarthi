import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Survive<span className="text-blue-600">.exe</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Disaster Risk Assessment & Emergency Coordination Platform for Maharashtra
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              PRE-DISASTER: Prediction
            </span>
            <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              DURING-DISASTER: Coordination
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Assess Risks Before Disasters Strike
              </h2>
              <p className="text-gray-600 mb-6">
                Advanced ML/DL models predict disaster risks across Maharashtra with
                ward-level precision. Empower authorities to act proactively, save lives,
                and optimize resource allocation.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/portal"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Select Portal
                </Link>
                <Link
                  href="/post-disaster"
                  className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Post-Disaster Analysis
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">85%+</div>
                  <div className="text-sm text-gray-600">Flood Prediction Accuracy</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">7 Days</div>
                  <div className="text-sm text-gray-600">Advance Forecast</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-orange-600">100+</div>
                  <div className="text-sm text-gray-600">Wards Monitored</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600">Real-time Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            title="Risk Heatmap"
            description="Ward-level disaster risk visualization with real-time updates from IMD data"
            icon="🗺️"
            href="/heatmap"
          />
          <FeatureCard
            title="7-Day Forecast"
            description="ML-powered multi-hazard predictions with confidence intervals"
            icon="📊"
            href="/forecast"
          />
          <FeatureCard
            title="Alert System"
            description="Hyper-local warnings via SMS and push notifications in multiple languages"
            icon="🚨"
            href="/alerts"
          />
          <FeatureCard
            title="Historical Analysis"
            description="Pattern recognition from 50+ years of Maharashtra disaster data"
            icon="📈"
            href="/history"
          />
          <FeatureCard
            title="Vulnerability Assessment"
            description="Infrastructure risk scoring for evacuation planning"
            icon="🏗️"
            href="/vulnerability"
          />
          <FeatureCard
            title="Resource Mapping"
            description="Emergency resource locations overlaid with risk zones"
            icon="🚑"
            href="/resources"
          />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600">
          <p>Built with ❤️ for safer communities in Maharashtra</p>
          <p className="text-sm mt-2">National Level Hackathon 2026</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer h-full">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}
