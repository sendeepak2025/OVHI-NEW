import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Stethoscope,
  Shield,
  Users,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerProvider } from "../../services/operations/auth";

export const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const { firstName, lastName, email, phoneNumber } = formData;

  // Check for required fields
  if (!firstName || !lastName || !email || !phoneNumber) {
    toast({
      title: "Error",
      description: "Please fill in all fields.",
      variant: "destructive",
    });
    return;
  }

  // Prepare formData to match backend format
  const backendData = {
    firstName,
    lastName,
    email,
    phone: phoneNumber, // ✅ Rename to match backend expected key
  };

  const response = await registerProvider(backendData);
  console.log(response);

  if (response) {
    toast({
      title: "Success",
      description: "Form submitted successfully. Redirecting to login...",
    });

    // Example: Delayed navigation
    // setTimeout(() => navigate("/login"), 2000);
  }

  console.log("Form submitted with data:", backendData);
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Join MediCare Portal
              </h1>
              <p className="text-gray-600">
                Start your healthcare journey today
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Secure Registration
                </h3>
                <p className="text-sm text-gray-600">
                  Quick and secure account creation process
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Data Protection</h3>
                <p className="text-sm text-gray-600">
                  Your information is encrypted and protected
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Healthcare Access
                </h3>
                <p className="text-sm text-gray-600">
                  Connect with providers and manage your health
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4 lg:hidden">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign up for your healthcare portal account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="h-11 mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="h-11 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11 mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="123-456-7890"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="h-11 mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mt-4">
              <Shield className="h-3 w-3" />
              <span>Your data is secure and HIPAA compliant</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};