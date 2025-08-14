import React from "react";
import {
  Shield,
  Zap,
  Users,
  Award,
  TrendingUp,
  Heart,
  Clock,
  CheckCircle,
  Target,
  Globe,
  Building,
  Sparkles,
} from "lucide-react";

export const AboutSectionVarn = () => {
  const stats = [
    {
      number: "500+",
      label: "Healthcare Providers",
      description: "Trusting our platform nationwide",
      icon: Users,
      color: "text-blue-600",
    },
    {
      number: "98.5%",
      label: "Collection Rate",
      description: "Industry-leading revenue optimization",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      number: "2.1 Days",
      label: "Average A/R",
      description: "Fastest claim processing in the industry",
      icon: Clock,
      color: "text-purple-600",
    },
    {
      number: "99.9%",
      label: "System Uptime",
      description: "Reliable 24/7 healthcare operations",
      icon: Shield,
      color: "text-indigo-600",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Automation",
      description:
        "Streamline your workflow with intelligent automation that reduces manual tasks and improves accuracy across all healthcare operations.",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant Security",
      description:
        "Enterprise-grade security with end-to-end encryption, ensuring patient data protection and regulatory compliance at every step.",
    },
    {
      icon: Target,
      title: "Custom Workflows",
      description:
        "Tailored solutions that adapt to your unique practice needs, from small clinics to large healthcare networks and specialized providers.",
    },
    {
      icon: Globe,
      title: "Nationwide Coverage",
      description:
        "Comprehensive support for healthcare providers across all 50 states with expertise in local regulations and payer requirements.",
    },
  ];

  const achievements = [
    { icon: Award, text: "SOC 2 Type II Certified" },
    { icon: CheckCircle, text: "HIPAA Compliant" },
    { icon: Building, text: "500+ Healthcare Providers" },
    { icon: Sparkles, text: "Industry Innovation Award 2024" },
  ];

  return (
    <section id="about" className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 to-transparent" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Heart className="w-4 h-4 mr-2" />
            About Varn DigiHealth
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Transforming Healthcare Through{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Innovation
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We're not just another healthcare IT company. We're your strategic
            partner in revolutionizing healthcare operations, improving patient
            outcomes, and maximizing revenue potential through cutting-edge
            technology and personalized support.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 mb-4`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Built by Healthcare Professionals, for Healthcare Professionals
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded by a team of healthcare administrators, physicians, and
                technology experts, Varn DigiHealth understands the unique
                challenges facing modern healthcare providers. Our platform
                combines deep industry knowledge with cutting-edge technology to
                deliver solutions that actually work in real-world healthcare
                environments.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From solo practitioners to large healthcare networks, we've
                designed our platform to scale with your growth while
                maintaining the personal touch and specialized support that
                healthcare providers deserve.
              </p>
            </div>

            {/* Achievements */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-gray-900">
                Recognized Excellence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <achievement.icon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {achievement.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Features */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">
              Why Healthcare Providers Choose Us
            </h3>
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Healthcare Operations?
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join hundreds of healthcare providers who have already
            revolutionized their practice management with Varn DigiHealth's
            comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
              Schedule Free Consultation
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              Download Case Studies
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
