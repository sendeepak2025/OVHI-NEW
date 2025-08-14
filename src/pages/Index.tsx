import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ActivitySquare,
  Users,
  Calendar,
  Video,
  ClipboardList,
  LineChart,
  MessageSquare,
  Pill,
  Stethoscope,
  Settings,
  DollarSign,
} from "lucide-react";
import HipaaNotice from "@/components/HipaaNotice";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  linkTo,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  linkTo: string;
  color: string;
}) => (
  <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
    <CardHeader>
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} mb-2`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardFooter className="mt-auto pt-2">
      <Button asChild variant="outline" className="w-full">
        <Link to={linkTo}>Access {title}</Link>
      </Button>
    </CardFooter>
  </Card>
);

const Index = () => {
  return (
    <div className="space-y-8 py-6">
      <HipaaNotice />
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Healthcare Dashboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your comprehensive healthcare management solution
        </p>
      </div>

      <Tabs defaultValue="physician" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="physician">
              <Stethoscope className="h-4 w-4 mr-2" />
              For Physicians
            </TabsTrigger>
            <TabsTrigger value="patient">
              <Users className="h-4 w-4 mr-2" />
              For Patients
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="physician" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={ActivitySquare}
              title="Dashboard"
              description="View practice overview, upcoming appointments and patient insights."
              linkTo="/provider/dashboard"
              color="bg-blue-600"
            />
            <FeatureCard
              icon={Users}
              title="Patients"
              description="Manage patient records, view history and update information."
              linkTo="/provider/patients"
              color="bg-indigo-600"
            />
            {/* <FeatureCard
              icon={Calendar}
              title="Appointments"
              description="Schedule, manage and view upcoming patient appointments."
              linkTo="/appointments"
              color="bg-purple-600"
            /> */}
            <FeatureCard
              icon={Video}
              title="Telehealth"
              description="Conduct virtual consultations with integrated voice transcription."
              linkTo="/provider/telehealth"
              color="bg-green-600"
            />
            <FeatureCard
              icon={LineChart}
              title="Monitoring"
              description="Track patient vitals and receive AI-powered insights."
              linkTo="/provider/patient-monitoring"
              color="bg-amber-600"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Messages"
              description="Secure communication with patients and healthcare team."
              linkTo="/provider/messages"
              color="bg-cyan-600"
            />
            <FeatureCard
              icon={ClipboardList}
              title="Reports"
              description="Generate and view detailed clinical and administrative reports."
              linkTo="/provider/reports"
              color="bg-emerald-600"
            />
            <FeatureCard
              icon={Pill}
              title="Medications"
              description="Manage prescriptions and medication tracking."
              linkTo="/provider/medications"
              color="bg-rose-600"
            />
            <FeatureCard
              icon={DollarSign}
              title="Billing"
              description="Manage insurance claims, CPT/ICD-10 coding, and payments."
              linkTo="/provider/billing"
              color="bg-violet-600"
            />
            <FeatureCard
              icon={Settings}
              title="Settings"
              description="Configure application preferences and integrations."
              linkTo="/provider/settings"
              color="bg-gray-600"
            />
          </div>
        </TabsContent>

        <TabsContent value="patient" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Video}
              title="Telehealth"
              description="Join virtual consultations with your healthcare provider."
              linkTo="/telehealth"
              color="bg-green-600"
            />
            <FeatureCard
              icon={Calendar}
              title="Appointments"
              description="Schedule and manage your upcoming appointments."
              linkTo="/appointments"
              color="bg-purple-600"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Messages"
              description="Communicate securely with your healthcare team."
              linkTo="/messages"
              color="bg-cyan-600"
            />
            <FeatureCard
              icon={Pill}
              title="Medications"
              description="View and track your prescribed medications."
              linkTo="/medications"
              color="bg-rose-600"
            />
            <FeatureCard
              icon={LineChart}
              title="Monitoring"
              description="Track your health metrics and vitals."
              linkTo="/monitoring"
              color="bg-amber-600"
            />
            <FeatureCard
              icon={ClipboardList}
              title="Patient Portal"
              description="Access your complete health records and information."
              linkTo="/portal"
              color="bg-blue-600"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100 text-center">
        <h2 className="text-2xl font-semibold text-blue-900 mb-2">
          Healthcare at Your Fingertips
        </h2>
        <p className="text-blue-800 mb-4 max-w-2xl mx-auto">
          provides a comprehensive solution for healthcare providers and
          patients to manage care, communicate effectively, and improve health
          outcomes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/telehealth">Start Telehealth Session</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
