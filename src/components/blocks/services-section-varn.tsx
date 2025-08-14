import React from "react";
import {
  Database,
  CreditCard,
  ShieldCheck,
  Activity,
  Heart,
  Video,
  FileText,
  Users,
  Monitor,
  Brain,
  Smartphone,
  Cloud,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export const ServicesSectionVarn = () => {
  const coreServices = [
    {
      icon: Database,
      title: "Proprietary EHR System",
      description:
        "Complete electronic health records solution designed specifically for modern healthcare workflows with intuitive patient management and clinical documentation.",
      features: [
        "Custom Templates",
        "AI-Powered SOAP Notes",
        "Clinical Decision Support",
        "Patient Portal Integration",
      ],
      color: "blue",
    },
    {
      icon: CreditCard,
      title: "End-to-End Medical Billing",
      description:
        "Comprehensive revenue cycle management from patient registration to final payment collection with industry-leading reimbursement rates.",
      features: [
        "Claims Processing",
        "Payment Posting",
        "Denial Management",
        "Financial Reporting",
      ],
      color: "green",
    },
    {
      icon: ShieldCheck,
      title: "Medical Credentialing",
      description:
        "Streamlined credentialing services for Medicare, Medicaid, and commercial payers with expedited processing and ongoing maintenance.",
      features: [
        "Provider Enrollment",
        "Payer Negotiations",
        "Compliance Monitoring",
        "Re-credentialing Support",
      ],
      color: "purple",
    },
    {
      icon: Activity,
      title: "Remote Patient Monitoring",
      description:
        "Advanced RPM solutions for chronic care management, improving patient outcomes while generating additional revenue streams.",
      features: [
        "Real-time Monitoring",
        "Care Plan Management",
        "Patient Engagement",
        "Medicare Reimbursement",
      ],
      color: "indigo",
    },
  ];

  const specialtyServices = [
    {
      icon: Heart,
      title: "Chronic Care Management (CCM)",
      service:
        "Comprehensive care coordination for patients with multiple chronic conditions",
      benefits: [
        "20-40 minutes monthly",
        "Medicare reimbursement",
        "Improved patient outcomes",
      ],
    },
    {
      icon: Brain,
      title: "Principal Care Management (PCM)",
      service:
        "Specialized management for high-risk patients with complex medical needs",
      benefits: [
        "Enhanced care coordination",
        "Reduced hospitalizations",
        "Higher reimbursement rates",
      ],
    },
    {
      icon: Video,
      title: "Telehealth Platform",
      service:
        "HIPAA-compliant video consultations with integrated EHR documentation",
      benefits: [
        "Expanded patient access",
        "Reduced overhead costs",
        "Seamless integration",
      ],
    },
    {
      icon: Monitor,
      title: "Practice Analytics",
      service:
        "Advanced reporting and analytics for data-driven decision making",
      benefits: [
        "Performance insights",
        "Revenue optimization",
        "Operational efficiency",
      ],
    },
  ];

  const integrations = [
    { name: "Epic", logo: "E" },
    { name: "Cerner", logo: "C" },
    { name: "Allscripts", logo: "A" },
    { name: "athenahealth", logo: "a" },
    { name: "NextGen", logo: "N" },
    { name: "eClinicalWorks", logo: "eC" },
  ];

  return (
    <section
      id="services"
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Settings className="w-4 h-4 mr-2" />
            Our Services
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Comprehensive Healthcare IT{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Solutions
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            From EHR and billing to credentialing and remote patient monitoring,
            we provide everything you need to run a successful healthcare
            practice in today's digital landscape.
          </p>
        </div>

        {/* Core Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {coreServices.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start space-x-6">
                <div
                  className={`p-4 rounded-xl bg-${service.color}-100 group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon
                    className={`w-8 h-8 text-${service.color}-600`}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className={`inline-flex items-center text-${service.color}-600 font-semibold hover:text-${service.color}-700 transition-colors group`}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Specialty Services */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Specialized Healthcare Services
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Extended care management and specialized services designed to
              enhance patient outcomes and create additional revenue
              opportunities for your practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialtyServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.service}
                  </p>
                  <div className="space-y-2">
                    {service.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center space-x-2"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

       
      </div>
    </section>
  );
};
