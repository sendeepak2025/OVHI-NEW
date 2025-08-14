import React from "react";
import {
  Zap,
  Shield,
  TrendingUp,
  Users,
  Clock,
  Award,
  HeartHandshake,
  CheckCircle,
  Target,
  Lightbulb,
  Phone,
  Star,
  DollarSign,
  Gauge,
  Settings,
  Globe,
} from "lucide-react";

export const WhyChooseSectionVarn = () => {
  const reasons = [
    {
      icon: Zap,
      title: "AI-Powered Automation",
      description:
        "Reduce manual tasks by 75% with intelligent automation that handles routine administrative work, allowing your staff to focus on patient care.",
      metrics: [
        "75% reduction in manual tasks",
        "50% faster claim processing",
        "90% fewer coding errors",
      ],
      color: "blue",
    },
    {
      icon: TrendingUp,
      title: "Proven Revenue Growth",
      description:
        "Our clients see an average 25-40% increase in revenue within the first 6 months through optimized billing practices and reduced claim denials.",
      metrics: [
        "25-40% revenue increase",
        "98.5% collection rate",
        "2.1 days average A/R",
      ],
      color: "green",
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description:
        "Bank-level encryption, SOC 2 certification, and comprehensive HIPAA compliance ensure your patient data is always protected.",
      metrics: [
        "SOC 2 Type II certified",
        "99.9% security uptime",
        "Zero data breaches",
      ],
      color: "purple",
    },
    {
      icon: Users,
      title: "Dedicated Support Team",
      description:
        "24/7 access to certified healthcare IT specialists, billing experts, and account managers who understand your unique practice needs.",
      metrics: [
        "24/7 expert support",
        "< 2 hour response time",
        "99% satisfaction rate",
      ],
      color: "indigo",
    },
  ];

  const differentiators = [
    {
      icon: Target,
      title: "Custom Workflows",
      description:
        "Tailored specifically to your practice type and specialty requirements",
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description:
        "Cutting-edge features and regular platform updates based on user feedback",
    },
    {
      icon: Phone,
      title: "White-Glove Onboarding",
      description:
        "Comprehensive training and migration support for seamless transitions",
    },
    {
      icon: Globe,
      title: "Nationwide Coverage",
      description:
        "Expertise across all 50 states with local payer and regulatory knowledge",
    },
  ];

  const testimonialStats = [
    { stat: "98%", label: "Client Retention Rate" },
    { stat: "500+", label: "Healthcare Providers" },
    { stat: "24/7", label: "Expert Support" },
    { stat: "99.9%", label: "Platform Uptime" },
  ];

  return (
    <section
      id="why-choose"
      className="py-20 bg-white relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 to-transparent" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
            <Award className="w-4 h-4 mr-2" />
            Why Choose Varn DigiHealth
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            The Clear Choice for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Healthcare Innovation
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            While others promise generic solutions, we deliver personalized
            healthcare IT services that actually understand and solve the unique
            challenges of modern medical practices.
          </p>
        </div>

        {/* Main Reasons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-4 rounded-xl bg-${reason.color}-100 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <reason.icon
                      className={`w-8 h-8 text-${reason.color}-600`}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {reason.title}
                  </h3>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {reason.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Key Metrics
                  </h4>
                  {reason.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Differentiators Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              What Sets Us Apart
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Beyond just software, we provide a comprehensive healthcare
              transformation experience that drives real results for your
              practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((item, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-white mb-20">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">
              Trusted by Healthcare Leaders Nationwide
            </h3>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Join the growing community of healthcare providers who have
              transformed their operations and achieved exceptional results with
              our platform.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonialStats.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2">
                  {item.stat}
                </div>
                <div className="text-lg opacity-90">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-6 h-6 text-yellow-400 fill-yellow-400"
              />
            ))}
            <span className="text-gray-600 ml-2">4.9/5 from 500+ reviews</span>
          </div>

          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience the Difference?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule a personalized demo and see how Varn DigiHealth can
            transform your healthcare practice in just 30 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Schedule Free Demo
            </button>
            {/* <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
              Download ROI Calculator
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
};
