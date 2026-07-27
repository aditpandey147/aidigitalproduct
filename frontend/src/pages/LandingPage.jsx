import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/30 pointer-events-none"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="w-full max-w-[1200px] mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center bg-gray-900 rounded-full px-3 py-1.5 mb-5">
                <span className="relative flex h-1.5 w-1.5 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-white">🚀 AI-Powered Website Fixer</span>
              </div>

              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold mb-4 leading-tight tracking-tight text-gray-900">
                Fix Website Issues in Seconds with{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  AI Magic ✨
                </span>
              </h1>

              <p className="text-base text-gray-600 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Our advanced AI scans your website for SEO, security, and compliance issues —
                then generates <strong>instant fixes</strong> tailored to your site. No coding required.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                  <i className="fas fa-check text-green-500 text-[10px]"></i>
                  AI-Powered Analysis
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                  <i className="fas fa-check text-green-500 text-[10px]"></i>
                  One-Click Fixes
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                  <i className="fas fa-check text-green-500 text-[10px]"></i>
                  No Coding Needed
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-base font-medium hover:bg-gray-800 transition-all shadow-sm">
                  🔍 Scan My Website Free
                  <i className="fas fa-arrow-right text-sm"></i>
                </Link>
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-lg text-base font-medium border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm">
                  ⚡ See AI in Action
                </Link>
              </div>

              <div className="flex items-center gap-4 justify-center lg:justify-start text-sm text-gray-400">
                <span><i className="fas fa-robot text-blue-500"></i> Powered by ZoAI</span>
                <span><i className="fas fa-bolt text-yellow-500"></i> Real-time fixes</span>
              </div>

              <p className="text-sm text-gray-400 mt-4">No credit card required • Free plan available</p>
            </div>

            <div className="flex-1 w-full max-w-lg">
              <div className="relative rounded-lg shadow-lg overflow-hidden border border-gray-200 bg-white">
                <div className="bg-gray-50 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-500 inline-block">
                      app.complyzo.com/scan
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Enter website URL..." className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-base bg-gray-50" value="https://mywebsite.com" readOnly />
                      <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition">Scan</button>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center">
                      <p className="text-sm text-green-700 font-medium">✅ AI Scan complete — 12 issues found</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">AI Issues Detected</h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded-md">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-exclamation-triangle text-red-500 text-[10px]"></i>
                          <span className="text-sm text-gray-700">Missing meta description</span>
                        </div>
                        <button className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded font-medium">AI Fix</button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-100 rounded-md">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-shield-alt text-yellow-600 text-[10px]"></i>
                          <span className="text-sm text-gray-700">SSL certificate expiring</span>
                        </div>
                        <button className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded font-medium">AI Fix</button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-md">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-cookie-bite text-blue-500 text-[10px]"></i>
                          <span className="text-sm text-gray-700">Cookie consent missing</span>
                        </div>
                        <button className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded font-medium">AI Fix</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
                      <div className="text-base font-semibold text-green-600">9</div>
                      <div className="text-[10px] text-gray-500">AI Fixed</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
                      <div className="text-base font-semibold text-blue-600">3m</div>
                      <div className="text-[10px] text-gray-500">Time Saved</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
                      <div className="text-base font-semibold text-purple-600">+40%</div>
                      <div className="text-[10px] text-gray-500">Performance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-28 px-6 border-t border-gray-100">
        <div className="w-full max-w-[1000px] mx-auto">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">How It Works</span>
            <h2 className="text-2xl font-semibold text-gray-900 mt-3 mb-2">Paste URL → AI Scans → Click Fix → Done ✨</h2>
            <p className="text-base text-gray-500">Our AI does the heavy lifting. You get results in seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-semibold text-blue-600">1</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Paste Your URL</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Enter your website — no setup, no coding required.</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-semibold text-green-600">2</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">AI Analyzes Everything</h3>
              <p className="text-sm text-gray-500 leading-relaxed">ZoAI scans for SEO, security, and compliance issues.</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-semibold text-purple-600">3</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Fix with One Click</h3>
              <p className="text-sm text-gray-500 leading-relaxed">AI generates custom fixes for your website instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ZOAI HYPE SECTION ============ */}
      <section className="py-16 lg:py-28 px-6 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-5xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-5xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
            <span className="text-sm font-medium text-white/80">Introducing ZoAI Engine</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">
            Powered by{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ZoAI Intelligence
            </span>
          </h2>

          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-12">
            Our proprietary AI engine doesn't just scan — it <strong>understands</strong> your website's structure,
            <strong>learns</strong> from millions of websites, and <strong>generates</strong> fixes that actually work.
          </p>

          {/* AI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">10M+</div>
              <div className="text-sm text-white/50 mt-1">Websites Analyzed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">500K+</div>
              <div className="text-sm text-white/50 mt-1">Issues Fixed Monthly</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">99.7%</div>
              <div className="text-sm text-white/50 mt-1">Detection Accuracy</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">3s</div>
              <div className="text-sm text-white/50 mt-1">Average Scan Time</div>
            </div>
          </div>

          {/* AI Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                <i className="fas fa-brain text-blue-400"></i>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Deep Learning Analysis</h3>
              <p className="text-sm text-white/50 leading-relaxed">ZoAI uses advanced neural networks trained on millions of websites to detect even the smallest issues.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                <i className="fas fa-bolt text-purple-400"></i>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Real-Time Code Generation</h3>
              <p className="text-sm text-white/50 leading-relaxed">Generates production-ready code fixes in milliseconds, not hours. Copy, paste, done.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mb-3">
                <i className="fas fa-shield-alt text-pink-400"></i>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Self-Learning System</h3>
              <p className="text-sm text-white/50 leading-relaxed">ZoAI gets smarter with every scan. Our models continuously improve based on real-world fixes.</p>
            </div>
          </div>

          <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition">
            Try ZoAI Free
            <i className="fas fa-arrow-right text-sm"></i>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 lg:py-28 px-6 bg-gray-50 border-t border-gray-100">
        <div className="w-full max-w-[1290px] mx-auto">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">Features</span>
            <h2 className="text-2xl font-semibold text-gray-900 mt-3 mb-2">AI-Powered Website Intelligence</h2>
            <p className="text-base text-gray-500">Smart tools that find and fix issues automatically</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🧠", title: "ZoAI Scanner", desc: "Advanced AI that understands your website and finds hidden issues." },
              { icon: "⚡", title: "Instant AI Fixes", desc: "Get copy-paste solutions generated specifically for your site." },
              { icon: "🤖", title: "Auto Fix Engine", desc: "Let AI automatically resolve issues without manual work." },
              { icon: "🔒", title: "Compliance AI", desc: "AI checks GDPR, SSL, and cookie policies automatically." },
              { icon: "📈", title: "SEO Intelligence", desc: "AI analyzes and suggests ranking improvements." },
              { icon: "🚀", title: "Performance AI", desc: "Smart optimization insights to speed up your site." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="text-xl mb-2">{feature.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Complyzo */}
      <section className="py-16 lg:py-28 px-6 border-t border-gray-100">
        <div className="w-full max-w-[1290px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Why Choose ZoAI?</h2>
            <p className="text-base text-gray-500">Built for modern teams who need fast, intelligent results</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🧠", title: "ZoAI Powered", desc: "Latest AI technology" },
              { icon: "⚡", title: "10x Faster", desc: "Fix issues in seconds" },
              { icon: "🎯", title: "99% Accurate", desc: "Precision AI detection" },
              { icon: "👥", title: "Zero Learning Curve", desc: "Anyone can use it" }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-16 lg:py-28 bg-gray-50 border-t border-gray-100">
        <div className="w-full max-w-[1290px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Who Is It For?</h2>
            <p className="text-base text-gray-500">Trusted by teams of all sizes</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🚀", title: "Indie Hackers", desc: "Building SaaS" },
              { icon: "📈", title: "Startups", desc: "Improving conversions" },
              { icon: "💻", title: "Developers", desc: "Fixing issues faster" },
              { icon: "🧑‍💼", title: "Agencies", desc: "Managing client sites" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-sm transition">
                <div className="text-xl mb-1">{item.icon}</div>
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-[11px] text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After */}
      <section className="py-16 lg:py-28 px-6 border-t border-gray-100">
        <div className="w-full max-w-[900px] mx-auto">
          <div className="bg-gray-900 rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">AI-Powered Results</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-base font-semibold text-red-400 mb-3">❌ Before AI</h3>
                <p className="text-sm text-gray-400 leading-relaxed">"Why is my site slow? Why is SEO bad? How do I fix all these issues?"</p>
              </div>
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-base font-semibold text-green-400 mb-3">✅ After Complyzo AI</h3>
                <div className="space-y-1.5 text-sm text-gray-300">
                  <p>• AI found 12 issues instantly</p>
                  <p>• Auto-fixed 9 in 3 minutes</p>
                  <p>• Improved performance by 40%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 lg:py-28 px-6 border-t border-gray-100">
        <div className="w-full max-w-[800px] mx-auto text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">🔐 Trust & Security</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              "Your data is not stored permanently",
              "Secure scanning process",
              "Built with privacy in mind"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <i className="fas fa-shield-alt text-green-500 text-base"></i>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-16 lg:pb-28 px-6">
        <div className="w-full max-w-[800px] mx-auto text-center">
          <div className="bg-gray-900 rounded-xl p-10 text-white">
            <h2 className="text-2xl font-semibold mb-3">Experience AI-Powered Fixes Today</h2>
            <p className="text-base text-gray-400 mb-6">Scan your website and let AI do the magic ✨</p>
            <Link to="/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-md text-base font-medium hover:bg-blue-700 transition">
              🔍 Start Free AI Scan
              <i className="fas fa-arrow-right text-sm"></i>
            </Link>
            <p className="mt-3 text-sm text-gray-500">No credit card required • Free plan available</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
