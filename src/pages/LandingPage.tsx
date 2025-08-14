import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  CreditCard,
  Heart,
  Video,
  DollarSign,
  Stethoscope,
  Settings,
  Users,
  Shield,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const ServiceCard = ({
  icon: Icon,
  title,
  description,
  features,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}) => (
  <Card className="h-full hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-primary/20">
    <CardHeader>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6 text-primary-foreground" />
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="text-base">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const StatCard = ({
  number,
  label,
  suffix = "",
}: {
  number: string;
  label: string;
  suffix?: string;
}) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
      {number}
      <span className="text-primary/80">{suffix}</span>
    </div>
    <div className="text-muted-foreground">{label}</div>
  </div>
);

const LandingPage = () => {
  const services = [
    {
      icon: Brain,
      title: "Advanced EHR with AI Integration",
      description:
        "Next-generation electronic health records powered by artificial intelligence for smarter healthcare decisions.",
      features: [
        "AI-powered clinical decision support",
        "Automated medical coding and documentation",
        "Predictive analytics for patient outcomes",
        "Real-time drug interaction alerts",
        "Intelligent care plan recommendations",
      ],
    },
    {
      icon: CreditCard,
      title: "Patient Portal with Payment Integration",
      description:
        "Comprehensive patient engagement platform with seamless payment processing and secure communication.",
      features: [
        "Secure patient data access",
        "Online appointment scheduling",
        "Integrated payment processing",
        "Prescription refill requests",
        "Lab results and imaging access",
      ],
    },
    {
      icon: Heart,
      title: "Care Management Programs",
      description:
        "Complete suite of care management solutions including RPM, CCM, PCM, and Annual Wellness Visits.",
      features: [
        "Remote Patient Monitoring (RPM)",
        "Chronic Care Management (CCM)",
        "Principal Care Management (PCM)",
        "Annual Wellness Visits (AWV)",
        "Care coordination workflows",
      ],
    },
    {
      icon: Video,
      title: "Telehealth & Communication Suite",
      description:
        "Full-featured telehealth platform with HD video, AI transcription, and secure messaging.",
      features: [
        "HD video consultations",
        "AI-powered voice transcription",
        "Secure messaging platform",
        "Multi-provider conferencing",
        "Mobile-friendly interface",
      ],
    },
    {
      icon: DollarSign,
      title: "Physician Billing Services",
      description:
        "Complete physician billing solutions with automated coding, claims processing, and revenue optimization.",
      features: [
        "Automated medical coding",
        "Claims submission and tracking",
        "Payment posting and reconciliation",
        "Provider credentialing support",
        "Revenue cycle optimization",
      ],
    },
    {
      icon: Settings,
      title: "Medical Billing & Coding",
      description:
        "Expert medical coding and billing services ensuring accurate reimbursement and compliance.",
      features: [
        "ICD-10 and CPT coding",
        "Billing compliance monitoring",
        "Coding audit and review",
        "Documentation improvement",
        "Specialty-specific coding",
      ],
    },
    {
      icon: CreditCard,
      title: "Medical Billing & Collections",
      description:
        "Comprehensive billing and collections management to maximize revenue and reduce AR days.",
      features: [
        "Patient statement generation",
        "Payment plan management",
        "Insurance follow-up",
        "Collections optimization",
        "Bad debt recovery",
      ],
    },
    {
      icon: CheckCircle,
      title: "Fee Schedule Evaluations",
      description:
        "Comprehensive fee schedule analysis and optimization to ensure competitive and profitable pricing.",
      features: [
        "Market rate analysis",
        "Payer contract evaluation",
        "Fee schedule optimization",
        "Reimbursement maximization",
        "Competitive pricing strategy",
      ],
    },
    {
      icon: Users,
      title: "Healthcare Contract Management",
      description:
        "End-to-end contract management for healthcare providers and payer relationships.",
      features: [
        "Contract negotiation support",
        "Terms and rates analysis",
        "Performance monitoring",
        "Renewal management",
        "Compliance tracking",
      ],
    },
    {
      icon: Shield,
      title: "A/R Recovery",
      description:
        "Advanced accounts receivable recovery services to optimize cash flow and reduce outstanding balances.",
      features: [
        "Aging report analysis",
        "Denial management",
        "Appeal processing",
        "Payment recovery strategies",
        "AR reduction programs",
      ],
    },
    {
      icon: Stethoscope,
      title: "Practice Management",
      description:
        "Comprehensive practice management solutions for operational efficiency and growth.",
      features: [
        "Workflow optimization",
        "Staff productivity tracking",
        "Performance analytics",
        "Resource management",
        "Growth strategy planning",
      ],
    },
    {
      icon: Clock,
      title: "Patient Eligibility Verification",
      description:
        "Real-time insurance eligibility verification to reduce claim denials and improve cash flow.",
      features: [
        "Real-time eligibility checks",
        "Benefits verification",
        "Prior authorization support",
        "Coverage determination",
        "Automated verification workflows",
      ],
    },
    {
      icon: DollarSign,
      title: "Revenue Cycle Management",
      description:
        "End-to-end revenue cycle management to optimize financial performance and operational efficiency.",
      features: [
        "Complete RPM solutions",
        "Financial performance analytics",
        "Process optimization",
        "Denial prevention strategies",
        "Cash flow improvement",
      ],
    },
    {
      icon: Shield,
      title: "Healthcare Denial Management",
      description:
        "Comprehensive denial management and appeals processing to maximize reimbursement recovery.",
      features: [
        "Denial root cause analysis",
        "Appeals management",
        "Workflow optimization",
        "Prevention strategies",
        "Recovery maximization",
      ],
    },
    {
      icon: Users,
      title: "Physician Credentialing",
      description:
        "Complete physician credentialing services to ensure smooth provider enrollment and compliance.",
      features: [
        "Primary source verification",
        "Application management",
        "Re-credentialing services",
        "Compliance monitoring",
        "Expedited processing",
      ],
    },
    {
      icon: CheckCircle,
      title: "Provider Enrollment & Credentialing",
      description:
        "Comprehensive provider enrollment and credentialing services for seamless payer relationships.",
      features: [
        "Payer enrollment management",
        "CAQH profile maintenance",
        "Enrollment status tracking",
        "Revalidation services",
        "Multi-state licensing support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Varn Digihealth
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-600"
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Complete Healthcare Solutions for{" "}
              <span className="text-blue-600">Modern Practices</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Streamline your practice with our comprehensive suite of
              healthcare solutions. From EHR to billing, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                <Link to="/register" className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Practice
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare solutions designed to streamline
              operations and improve patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-1">
                  {service.features.slice(0, 3).map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-2 text-xs text-gray-500"
                    >
                      <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Providers
            </h2>
            <p className="text-gray-600">
              Join thousands of healthcare professionals nationwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-sm text-gray-600">Healthcare Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-sm text-gray-600">Active Patients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Why Choose Varn Digihealth?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      HIPAA Compliant & Secure
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Enterprise-grade security with end-to-end encryption and
                      comprehensive compliance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Fully Customizable
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Tailored to your practice with customizable EHR
                      integration and branded portal.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Expert Support
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Dedicated healthcare IT specialists available 24/7 for
                      your practice.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center bg-blue-50 border-blue-200">
                <Star className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900 mb-1">
                  4.9/5
                </div>
                <div className="text-xs text-gray-600">Customer Rating</div>
              </Card>
              <Card className="p-4 text-center bg-green-50 border-green-200">
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900 mb-1">
                  &lt; 24hrs
                </div>
                <div className="text-xs text-gray-600">Setup Time</div>
              </Card>
              <Card className="p-4 text-center bg-purple-50 border-purple-200">
                <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900 mb-1">
                  SOC 2
                </div>
                <div className="text-xs text-gray-600">Certified</div>
              </Card>
              <Card className="p-4 text-center bg-orange-50 border-orange-200">
                <CheckCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900 mb-1">
                  99.9%
                </div>
                <div className="text-xs text-gray-600">Reliability</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare providers who trust Varn Digihealth for
            their practice management needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 px-8"
            >
              <Link to="/register" className="flex items-center gap-2">
                Get Started Today
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8"
            >
              Schedule a Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="flex flex-col items-center">
              <Phone className="h-6 w-6 mb-3" />
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-blue-100 text-sm">+1 (555) 123-4567</p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="h-6 w-6 mb-3" />
              <h3 className="font-semibold mb-1">Email Us</h3>
              <p className="text-blue-100 text-sm">info@varndigihealth.com</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-6 w-6 mb-3" />
              <h3 className="font-semibold mb-1">Visit Us</h3>
              <p className="text-blue-100 text-sm">
                Healthcare Technology Center
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Varn Digihealth</span>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Transforming healthcare through innovative digital solutions and
                comprehensive practice management tools.
              </p>
              <p className="text-xs text-gray-500">
                © 2024 Varn Digihealth. All rights reserved. HIPAA Compliant
                Healthcare Solutions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>EHR Integration</li>
                <li>Patient Portal</li>
                <li>Billing Services</li>
                <li>Practice Management</li>
                <li>Telehealth</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/login" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white">
                    Get Started
                  </Link>
                </li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>HIPAA Compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
