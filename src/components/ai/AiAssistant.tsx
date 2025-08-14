import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Send, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PCMResponse {
  analysis: string;
  recommendations: string[];
  riskLevel: "Low" | "Medium" | "High";
  followUp: string;
}

interface AiAssistantProps {
  context?: string;
  placeholder?: string;
  initialPrompt?: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ context, placeholder, initialPrompt }) => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<PCMResponse | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Error",
        description: "Please enter your symptoms first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const OPEN_AI = import.meta.env.VITE_OPEN_AI_KEY
    try {
      const apiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPEN_AI}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are a medical AI assistant for a PCM (Primary Care Management) module. Analyze patient symptoms and provide structured medical guidance. Always include a disclaimer that this is not a substitute for professional medical advice. 

              Respond in JSON format with:
              {
                "analysis": "detailed analysis of symptoms",
                "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
                "riskLevel": "Low/Medium/High",
                "followUp": "follow-up instructions"
              }`,
              },
              {
                role: "user",
                content: `Please analyze these symptoms: ${symptoms}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        }
      );

      if (!apiResponse.ok) {
        throw new Error("Failed to get AI analysis");
      }

      const data = await apiResponse.json();
      const content = data.choices[0].message.content;

      try {
        const parsedResponse = JSON.parse(content);
        setResponse(parsedResponse);
        toast({
          title: "Analysis Complete",
          description: "AI analysis has been generated successfully.",
        });
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        setResponse({
          analysis: content,
          recommendations: [
            "Consult with your healthcare provider",
            "Monitor symptoms",
            "Follow prescribed treatments",
          ],
          riskLevel: "Medium",
          followUp:
            "Schedule an appointment with your doctor for proper evaluation.",
        });
      }
    } catch (error) {
      console.error("Error getting AI analysis:", error);
      toast({
        title: "Error",
        description: "Failed to get AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "Low":
        return <CheckCircle className="h-4 w-4" />;
      case "Medium":
        return <AlertCircle className="h-4 w-4" />;
      case "High":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Symptom Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe your symptoms and get AI-powered medical insights. This is
            not a substitute for professional medical advice.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="symptoms">Describe your symptoms</Label>
            <Textarea
              id="symptoms"
              placeholder="Please describe your symptoms in detail, including when they started, severity, and any associated factors..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={5}
              className="mt-2"
            />
          </div>
          <Button
            onClick={handleAnalysis}
            disabled={loading || !symptoms.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Get AI Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                AI Analysis Results
                <Badge className={getRiskColor(response.riskLevel)}>
                  {getRiskIcon(response.riskLevel)}
                  <span className="ml-1">{response.riskLevel} Risk</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Analysis</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {response.analysis}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {response.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Follow-up Instructions</h4>
                  <p className="text-sm text-muted-foreground">
                    {response.followUp}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">
                    Medical Disclaimer
                  </h4>
                  <p className="text-sm text-amber-700">
                    This AI analysis is for informational purposes only and
                    should not replace professional medical advice, diagnosis,
                    or treatment. Always consult with qualified healthcare
                    professionals for medical concerns. In case of emergency,
                    contact emergency services immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
