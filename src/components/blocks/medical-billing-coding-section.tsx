import React from "react";
import {
  CreditCard,
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
  Users,
  DollarSign,
  AlertCircle,
  Calendar,
  Settings,
  Target,
  Zap,
  Award,
  Phone,
} from "lucide-react";

export const MedicalBillingCodingSection = () => {
  const billingServices = [
    {
      icon: FileText,
      title: "Claims Processing",
      description:
        "Automated claim submission and tracking with intelligent error detection and correction before submission.",
      features: [
        "Real-time claim validation",
        "Electronic submission",
        "Error prevention",
        "Status tracking",
      ],
      stat: "98.5% First-pass rate",
    },
    {
      icon: DollarSign,
      title: "Payment Posting",
      description:
        "Automated payment posting and reconciliation with detailed reporting and variance analysis.",
      features: [
        "Auto-payment posting",
        "EOB processing",
        "Variance reports",
        "Deposit matching",
      ],
      stat: "24-hour posting",
    },
    {
      icon: AlertCircle,
      title: "Denial Management",
      description:
        "Comprehensive denial analysis and appeals process with systematic follow-up and resolution tracking.",
      features: [
        "Root cause analysis",
        "Appeal automation",
        "Trend reporting",
        "Recovery optimization",
      ],
      stat: "15% denial rate reduction",
    },
    {
      icon: BarChart3,
      title: "Revenue Analytics",
      description:
        "Advanced reporting and analytics providing insights into revenue performance and optimization opportunities.",
      features: [
        "Performance dashboards",
        "Trend analysis",
        "Payer insights",
        "Custom reports",
      ],
      stat: "Real-time insights",
    },
  ];

  const codingSpecialties = [
    { name: "ICD-10-CM/PCS", accuracy: "99.8%" },
    { name: "CPT/HCPCS", accuracy: "99.5%" },
    { name: "Modifiers", accuracy: "99.2%" },
    { name: "E/M Coding", accuracy: "99.7%" },
    { name: "Surgical Coding", accuracy: "99.4%" },
    { name: "Radiology", accuracy: "99.6%" },
  ];

  const revenueMetrics = [
    {
      metric: "98.5%",
      label: "Collection Rate",
      description: "Industry-leading collection performance",
      icon: TrendingUp,
      color: "green",
    },
    {
      metric: "2.1 Days",
      label: "Average A/R",
      description: "Fastest claim processing in industry",
      icon: Clock,
      color: "blue",
    },
    {
      metric: "15%",
      label: "Denial Reduction",
      description: "Significant improvement over industry average",
      icon: Shield,
      color: "purple",
    },
    {
      metric: "25-40%",
      label: "Revenue Increase",
      description: "Average client revenue growth within 6 months",
      icon: DollarSign,
      color: "indigo",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Patient Registration & Verification",
      description:
        "Automated insurance verification and eligibility checking at the point of registration",
      icon: Users,
    },
    {
      step: "02",
      title: "Clinical Documentation & Coding",
      description:
        "AI-assisted coding with real-time compliance checking and optimization suggestions",
      icon: FileText,
    },
    {
      step: "03",
      title: "Claims Generation & Submission",
      description:
        "Automated claim creation, validation, and electronic submission to all major payers",
      icon: Settings,
    },
    {
      step: "04",
      title: "Payment Processing & Follow-up",
      description:
        "Automated payment posting, denial management, and systematic follow-up processes",
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <CreditCard className="w-4 h-4 mr-2" />
            Medical Billing & Coding Excellence
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Maximize Revenue with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Expert Billing Services
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our comprehensive medical billing and coding services combine
            certified experts, advanced technology, and proven processes to
            optimize your revenue cycle and ensure maximum reimbursement for
            every service provided.
          </p>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {revenueMetrics.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${item.color}-100 mb-4`}
              >
                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
              </div>
              <div className={`text-3xl font-bold text-${item.color}-600 mb-2`}>
                {item.metric}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {item.label}
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Billing Services Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Billing Services
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              End-to-end revenue cycle management designed to maximize
              collections and minimize administrative burden on your practice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {billingServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start space-x-6">
                  <div className="p-4 rounded-xl bg-blue-100">
                    <service.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-gray-900">
                        {service.title}
                      </h4>
                      <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        {service.stat}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Flow */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Our Proven Revenue Cycle Process
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Streamlined workflow designed for maximum efficiency and optimal
              financial outcomes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-6 h-[33vh] shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {step.step}
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                      <step.icon className="w-6 h-6 text-blue-600" />
                    </div>

                    <h4 className="text-lg font-bold text-gray-900">
                      {step.title}
                    </h4>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 transform -translate-y-1/2 z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coding Expertise */}
        <div className="mb-20">
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Certified Coding Expertise
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our team of certified coders ensures accurate, compliant coding
                across all specialties with industry-leading accuracy rates and
                ongoing education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {codingSpecialties.map((specialty, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">
                      {specialty.name}
                    </span>
                  </div>
                  <span className="text-green-600 font-bold">
                    {specialty.accuracy}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">
                  AHIMA & AAPC Certified Coders
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Optimize Your Revenue Cycle?
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Let our billing experts analyze your current performance and show
            you how much additional revenue you could be collecting with our
            proven system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 inline-flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Revenue Analysis
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Speak with Billing Expert
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
