import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  CreditCard, 
  CheckCircle, 
  DollarSign, 
  Shield, 
  Clock, 
  TrendingUp, 
  Users, 
  Stethoscope, 
  FileCheck, 
  Calculator, 
  Eye, 
  ArrowRight, 
  Phone, 
  Mail,
  ChevronRight,
  Star,
  Building,
  Zap,
  Target,
  Award,
  BarChart3,
  RefreshCw,
  Lock,
  Headphones
} from "lucide-react";
import { MegaMenuNavbar } from "@/components/blocks/navbar-mega-menu";
import { Footer } from "@/components/blocks/footer-varn";

export default function BillingAndCoding() {
  return (
    <div className="min-h-screen bg-white">
      <MegaMenuNavbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(30,64,175,0.1),transparent_50%)] opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(22,163,74,0.1),transparent_50%)] opacity-70"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
              <Stethoscope className="w-4 h-4 mr-2" />
              Medical Billing & Coding Solutions
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Revenue Cycle
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your healthcare practice with our comprehensive medical billing and coding services. 
              Maximize revenue, reduce errors, and ensure compliance while you focus on patient care.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                Schedule Demo
                <Phone className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.8%</div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">45%</div>
                <div className="text-gray-600">Faster Payments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$2.5M+</div>
                <div className="text-gray-600">Revenue Recovered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Comprehensive Billing & Coding Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced platform combines cutting-edge technology with expert healthcare knowledge 
              to deliver unmatched billing and coding solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calculator className="w-8 h-8 text-blue-600" />,
                title: "Automated Billing",
                description: "Streamline your billing process with intelligent automation that reduces manual errors and accelerates claims processing."
              },
              {
                icon: <CreditCard className="w-8 h-8 text-green-600" />,
                title: "Insurance Claims Processing",
                description: "Efficient handling of insurance claims with real-time tracking and automated follow-ups for faster reimbursements."
              },
              {
                icon: <FileCheck className="w-8 h-8 text-blue-600" />,
                title: "Coding Accuracy",
                description: "Ensure precise medical coding with our certified coding specialists and advanced validation systems."
              },
              {
                icon: <Shield className="w-8 h-8 text-green-600" />,
                title: "Compliance Management",
                description: "Stay compliant with HIPAA, ICD-10, and other healthcare regulations through our comprehensive compliance framework."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
                title: "Revenue Analytics",
                description: "Gain insights into your revenue cycle with detailed analytics and performance metrics for data-driven decisions."
              },
              {
                icon: <RefreshCw className="w-8 h-8 text-green-600" />,
                title: "Claim Follow-up",
                description: "Automated claim follow-up and denial management to maximize your revenue recovery and minimize delays."
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Why Choose Our Medical Billing Services?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <DollarSign className="w-6 h-6 text-green-600" />,
                    title: "Improved Cash Flow",
                    description: "Accelerate your revenue cycle with faster claim processing and reduced denial rates."
                  },
                  {
                    icon: <Target className="w-6 h-6 text-blue-600" />,
                    title: "Reduced Errors",
                    description: "Minimize costly billing errors with our advanced validation and expert coding review."
                  },
                  {
                    icon: <Clock className="w-6 h-6 text-green-600" />,
                    title: "Faster Payments",
                    description: "Get paid faster with streamlined processes and proactive claim management."
                  },
                  {
                    icon: <Award className="w-6 h-6 text-blue-600" />,
                    title: "Expert Coding",
                    description: "Certified coding specialists ensure accurate ICD-10 and CPT coding for optimal reimbursement."
                  },
                  {
                    icon: <Lock className="w-6 h-6 text-green-600" />,
                    title: "HIPAA Compliance",
                    description: "Maintain strict compliance with healthcare regulations and protect patient data."
                  },
                  {
                    icon: <Headphones className="w-6 h-6 text-blue-600" />,
                    title: "24/7 Support",
                    description: "Round-the-clock support from our dedicated healthcare billing experts."
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Revenue Cycle Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">98.5%</div>
                      <div className="text-sm text-gray-600">Clean Claim Rate</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">12 Days</div>
                      <div className="text-sm text-gray-600">Average Collection</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">99.2%</div>
                      <div className="text-sm text-gray-600">Coding Accuracy</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">35%</div>
                      <div className="text-sm text-gray-600">Cost Reduction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Streamlined Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From patient registration to payment posting, we handle every step of your revenue cycle 
              with precision and expertise.
            </p>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Patient Registration",
                  description: "Verify patient information and insurance eligibility to ensure accurate billing from the start.",
                  icon: <Users className="w-8 h-8 text-blue-600" />
                },
                {
                  step: "02",
                  title: "Medical Coding",
                  description: "Expert coding specialists assign accurate ICD-10 and CPT codes for optimal reimbursement.",
                  icon: <FileText className="w-8 h-8 text-green-600" />
                },
                {
                  step: "03",
                  title: "Claims Submission",
                  description: "Electronic submission of clean claims with real-time tracking and status monitoring.",
                  icon: <CreditCard className="w-8 h-8 text-blue-600" />
                },
                {
                  step: "04",
                  title: "Payment Processing",
                  description: "Efficient payment posting and reconciliation with detailed reporting and analytics.",
                  icon: <DollarSign className="w-8 h-8 text-green-600" />
                }
              ].map((process, index) => (
                <div key={index} className="relative">
                  <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        {process.icon}
                      </div>
                      <div className="text-4xl font-bold text-gray-300 mb-2">
                        {process.step}
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {process.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="text-gray-600">
                        {process.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                  
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing/Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Pricing Overview */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Flexible Pricing Solutions
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Choose the billing solution that fits your practice size and needs. 
                Our transparent pricing ensures you know exactly what you're paying for.
              </p>
              
              <div className="space-y-6">
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-2xl text-blue-700">Revenue-Based Pricing</CardTitle>
                    <CardDescription className="text-blue-600">
                      Pay only a percentage of collected revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-700 mb-2">
                      2.5% - 4%
                    </div>
                    <p className="text-blue-600 mb-4">
                      Of net collections, no hidden fees
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm">Complete billing services</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm">Denial management</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm">Detailed reporting</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-2xl text-green-700">Fixed Monthly Rate</CardTitle>
                    <CardDescription className="text-green-600">
                      Predictable monthly billing for larger practices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-700 mb-2">
                      Custom Quote
                    </div>
                    <p className="text-green-600 mb-4">
                      Based on practice size and complexity
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm">Dedicated account manager</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm">Priority support</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm">Custom integrations</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">
                    Get Your Free Revenue Cycle Assessment
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Discover how much revenue you could recover with our expert billing services.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name
                      </Label>
                      <Input 
                        id="firstName" 
                        placeholder="John"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name
                      </Label>
                      <Input 
                        id="lastName" 
                        placeholder="Smith"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@practice.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="practice" className="text-sm font-medium text-gray-700">
                      Practice Name
                    </Label>
                    <Input 
                      id="practice" 
                      placeholder="Your Practice Name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Tell us about your billing challenges
                    </Label>
                    <Textarea 
                      id="message" 
                      placeholder="Describe your current billing situation and goals..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold">
                    Get Free Assessment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Or call us directly at{" "}
                      <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-700 font-semibold">
                        (123) 456-7890
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
<Footer/>
    </div>
  );
}