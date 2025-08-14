import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Award,
  CreditCard,
  Database,
  BarChart3,
  Calendar,
  Brain,
  Clipboard,
  Check,
  Users,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

export const HeroSectionVarn = () => {
  const features = [
    {
      icon: Database,
      title: "Electronic Health Records",
      description: "Comprehensive patient data management",
    },
    {
      icon: CreditCard,
      title: "Medical Billing & Coding",
      description: "Automated billing and insurance claims",
    },
    {
      icon: BarChart3,
      title: "Practice Analytics",
      description: "Data-driven insights and reporting",
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Streamlined patient booking system",
    },
    {
      icon: Brain,
      title: "AI-Powered Automation",
      description: "Intelligent workflow optimization",
    },
    {
      icon: Clipboard,
      title: "Clinical Documentation",
      description: "Comprehensive medical record keeping",
    },
  ];

  const benefits = [
    "HIPAA-compliant security and privacy",
    "Seamless integration with existing systems",
    "24/7 technical support and maintenance",
    "Customizable workflows for your practice",
    "Real-time data synchronization",
    "Mobile-friendly access from anywhere",
  ];

  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Healthcare Providers",
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: "Uptime Guarantee",
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Support Available",
    },
    {
      icon: Star,
      value: "4.9",
      label: "Customer Rating",
    },
  ];

  const serviceCards = [
    {
      title: "Patient Management",
      description:
        "Complete patient lifecycle management with integrated scheduling and communication tools.",
      icon: Users,
    },
    {
      title: "Revenue Cycle",
      description:
        "Optimized billing processes with automated claim submission and payment tracking.",
      icon: CreditCard,
    },
    {
      title: "Clinical Analytics",
      description:
        "Advanced reporting and analytics to improve patient outcomes and operational efficiency.",
      icon: BarChart3,
    },
    {
      title: "Compliance Support",
      description:
        "Built-in compliance tools to meet HIPAA, CMS, and other regulatory requirements.",
      icon: Shield,
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-100 rounded-full opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-40 left-20 w-40 h-40 bg-blue-50 rounded-full opacity-25 animate-bounce"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-60 right-40 w-28 h-28 bg-green-50 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Trust Badges */}
        {/* <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border-blue-200"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            HIPAA Compliant
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border-green-200"
          >
            <Award className="w-4 h-4 text-green-600" />
            CMS Certified
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border-blue-200"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            ISO 27001
          </Badge>
        </div> */}

        {/* Main Content Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 leading-tight">
                End-to-End{" "}
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Healthcare IT Solutions
                </span>{" "}
                for Modern Providers
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Streamline your healthcare practice with our comprehensive
                platform featuring integrated EHR, billing, scheduling, and
                analytics—all designed to improve patient care and operational
                efficiency.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300 p-4 bg-white/70 backdrop-blur-sm border-0 shadow-sm"
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <feature.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-[13px] text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Schedule Demo
              </Button>
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Benefits:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Doctor Image */}
          <div className="relative">
            <div className="relative z-10">
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                <img
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/c2df3191-59e1-4b37-b56d-58ea1499cd24/generated_images/professional-female-healthcare-provider--28957f88-20250711135509.jpg"
                  alt="Professional Female Healthcare Provider"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 via-transparent to-transparent"></div>
            </div>

           
        

            <div className="absolute -bottom-4 -right-4 z-20">
              <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0 animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        98%
                      </div>
                      <div className="text-sm text-gray-600">
                        Uptime Guarantee
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* <div className="absolute bottom-0 right-52 transform -translate-y-1/2 z-20">
              <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0 animate-bounce">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        4.9
                      </div>
                      <div className="text-sm text-gray-600">
                        Customer Rating
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div> */}
          </div>
        </div>

        {/* Bottom Service Overview */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare IT Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From patient management to revenue optimization, our platform
              provides everything you need to run a modern healthcare practice
              efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCards.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-sm"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg w-fit">
                      <service.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
