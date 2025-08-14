import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Activity,
  Stethoscope,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";

interface ProgramEligibility {
  rpmeEligible: boolean;
  ccmEligible: boolean;
  pcmEligible: boolean;
  enrolledPrograms: string[];
}

interface PatientDiagnosis {
  diagnosis: string;
  icd10: string;
  status: string;
}

interface ProgramClassificationWidgetProps {
  diagnoses: PatientDiagnosis[];
  currentPrograms?: string[];
  onEnrollProgram?: (program: string) => void;
}

const ProgramClassificationWidget: React.FC<
  ProgramClassificationWidgetProps
> = ({ diagnoses, currentPrograms = [], onEnrollProgram }) => {
  // Define program eligibility criteria
  const checkProgramEligibility = (): ProgramEligibility => {
    const chronicConditions = [
      "diabetes",
      "hypertension",
      "heart disease",
      "copd",
      "asthma",
      "chronic kidney disease",
      "heart failure",
      "coronary artery disease",
    ];

    const rpmConditions = [
      "hypertension",
      "diabetes",
      "heart failure",
      "chronic kidney disease",
    ];

    const patientConditions = diagnoses.map((d) => d.diagnosis.toLowerCase());

    const hasChronicConditions = chronicConditions.some((condition) =>
      patientConditions.some((pc) => pc.includes(condition))
    );

    const hasRpmConditions = rpmConditions.some((condition) =>
      patientConditions.some((pc) => pc.includes(condition))
    );

    // CCM: 2+ chronic conditions expected to last 12+ months
    const ccmEligible = diagnoses.length >= 2 && hasChronicConditions;

    // PCM: Single high-risk chronic condition
    const pcmEligible = diagnoses.length >= 1 && hasChronicConditions;

    // RPM: Specific chronic conditions requiring monitoring
    const rpmEligible = hasRpmConditions;

    return {
      rpmeEligible: rpmEligible,
      ccmEligible,
      pcmEligible,
      enrolledPrograms: currentPrograms,
    };
  };

  const eligibility = checkProgramEligibility();

  const programCards = [
    {
      id: "rpm",
      name: "Remote Patient Monitoring",
      shortName: "RPM",
      description:
        "Continuous monitoring of vital signs using connected devices",
      icon: Activity,
      eligible: eligibility.rpmeEligible,
      enrolled: currentPrograms.includes("RPM"),
      color: "from-blue-500/10 to-blue-600/5",
      borderColor: "border-blue-200/60",
      badgeColor: "bg-blue-500",
      iconColor: "text-blue-600",
      requirements: "16+ days of device readings per month",
      cptCodes: "99453-99458",
      reimbursement: "$60-$90/month",
    },
    {
      id: "ccm",
      name: "Chronic Care Management",
      shortName: "CCM",
      description:
        "Comprehensive care coordination for multiple chronic conditions",
      icon: Heart,
      eligible: eligibility.ccmEligible,
      enrolled: currentPrograms.includes("CCM"),
      color: "from-green-500/10 to-green-600/5",
      borderColor: "border-green-200/60",
      badgeColor: "bg-green-500",
      iconColor: "text-green-600",
      requirements: "20+ minutes per month",
      cptCodes: "99490-99491",
      reimbursement: "$42-$85/month",
    },
    {
      id: "pcm",
      name: "Principal Care Management",
      shortName: "PCM",
      description: "Intensive management of single high-risk chronic condition",
      icon: Stethoscope,
      eligible: eligibility.pcmEligible,
      enrolled: currentPrograms.includes("PCM"),
      color: "from-purple-500/10 to-purple-600/5",
      borderColor: "border-purple-200/60",
      badgeColor: "bg-purple-500",
      iconColor: "text-purple-600",
      requirements: "30+ minutes per month",
      cptCodes: "99424-99427",
      reimbursement: "$65-$130/month",
    },
  ];

  const eligibleCount = programCards.filter((p) => p.eligible).length;
  const enrolledCount = programCards.filter((p) => p.enrolled).length;

  // Smart program selection logic - mutual exclusivity
  const getRecommendedCombination = () => {
    if (eligibility.rpmeEligible && eligibility.ccmEligible) {
      return "RPM+CCM";
    }
    if (eligibility.rpmeEligible && eligibility.pcmEligible && diagnoses.length === 1) {
      return "RPM+PCM";
    }
    if (eligibility.ccmEligible) {
      return "CCM";
    }
    if (eligibility.pcmEligible) {
      return "PCM";
    }
    return null;
  };

  const recommendedProgram = getRecommendedCombination();
  const currentEnrollment = currentPrograms.join("+") || "None";

  // Check if current enrollment matches recommendation
  const isOptimalEnrollment = currentEnrollment === recommendedProgram;

  return (
    <div className="space-y-6">
      {/* Current Status & Recommendation */}
      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Program Enrollment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Enrollment</p>
              <Badge 
                variant={currentEnrollment === "None" ? "secondary" : "default"}
                className="mt-1"
              >
                {currentEnrollment}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Recommendation</p>
              <Badge 
                variant={isOptimalEnrollment ? "default" : "destructive"}
                className="mt-1"
              >
                {recommendedProgram || "No Recommendation"}
              </Badge>
            </div>
          </div>
          {!isOptimalEnrollment && recommendedProgram && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Consider switching to {recommendedProgram} for optimal care and billing
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Program Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programCards.map((program) => (
          <Card 
            key={program.id}
            className={`relative transition-all duration-200 ${
              program.enrolled 
                ? "ring-2 ring-primary shadow-lg" 
                : program.eligible 
                  ? "hover:shadow-md border-2 border-dashed" 
                  : "opacity-60"
            } ${program.borderColor}`}
          >
            <CardHeader className={`bg-gradient-to-br ${program.color} rounded-t-lg`}>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <program.icon className={`h-5 w-5 ${program.iconColor}`} />
                  <span>{program.shortName}</span>
                </div>
                {program.enrolled && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <h4 className="font-medium text-sm mb-2">{program.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">
                {program.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3" />
                  {program.requirements}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="h-3 w-3" />
                  CPT: {program.cptCodes}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <DollarSign className="h-3 w-3" />
                  {program.reimbursement}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Badge 
                  variant={program.eligible ? "default" : "secondary"}
                  className="text-xs justify-center"
                >
                  {program.eligible ? "Eligible" : "Not Eligible"}
                </Badge>
                
                {program.eligible && !program.enrolled && (
                  <Button
                    size="sm"
                    onClick={() => onEnrollProgram?.(program.id)}
                    className="text-xs"
                    disabled={!program.eligible}
                  >
                    Enroll Patient
                  </Button>
                )}
                
                {program.enrolled && (
                  <Badge variant="default" className="text-xs justify-center bg-green-600">
                    Currently Enrolled
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{eligibleCount}</div>
              <div className="text-sm text-muted-foreground">Eligible Programs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{enrolledCount}</div>
              <div className="text-sm text-muted-foreground">Enrolled Programs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {recommendedProgram ? "$" + (recommendedProgram.includes("+") ? "150+" : "85") : "$0"}
              </div>
              <div className="text-sm text-muted-foreground">Est. Monthly Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramClassificationWidget;
