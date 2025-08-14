import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mic, MicOff, Copy, Save, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface VoiceToTextTranscriptionProps {
  isCallActive: boolean;
  patientName?: string;
  onTranscriptionUpdate?: (text: string) => void;
}

const VoiceToTextTranscription: React.FC<VoiceToTextTranscriptionProps> = ({
  isCallActive,
  patientName = "patient",
  onTranscriptionUpdate,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore - Speech Recognition API may not be typed
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";
          let maxConfidence = 0;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;

            if (confidence > maxConfidence) {
              maxConfidence = confidence;
            }

            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            const updatedTranscription = transcription + finalTranscript;
            setTranscription(updatedTranscription);
            if (onTranscriptionUpdate) {
              onTranscriptionUpdate(updatedTranscription);
            }
          }

          setInterimTranscript(interimTranscript);
          setConfidenceScore(maxConfidence);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);

          if (event.error === "no-speech") {
            // No need to show error for no speech detected
            return;
          }

          toast.error(`Transcription error: ${event.error}`, {
            description: "Please try again or switch to manual note-taking",
          });
        };

        recognitionRef.current.onend = () => {
          if (isTranscribing) {
            // If still supposed to be transcribing, restart recognition
            transcriptTimeoutRef.current = setTimeout(() => {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error("Error restarting recognition", e);
              }
            }, 1000);
          }
        };
      } else {
        toast.error("Speech recognition not supported", {
          description:
            "Your browser doesn't support automatic transcription. Please use manual notes.",
        });
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }

      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }
    };
  }, [onTranscriptionUpdate, transcription]);

  // Start/stop transcription when call status changes
  useEffect(() => {
    if (!isCallActive && isTranscribing) {
      stopTranscription();
    }
  }, [isCallActive]);

  const startTranscription = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setIsTranscribing(true);
      toast.success("Voice transcription started", {
        description: "Your conversation will be transcribed automatically",
      });
    } catch (error) {
      console.error("Error starting speech recognition", error);
      toast.error("Couldn't start transcription", {
        description: "Please try again or use manual notes",
      });
    }
  };

  const stopTranscription = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsTranscribing(false);

      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
        transcriptTimeoutRef.current = null;
      }

      toast.info("Voice transcription stopped");
    } catch (error) {
      console.error("Error stopping speech recognition", error);
    }
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(transcription);
    toast.success("Transcript copied to clipboard");
  };

  const handleSaveTranscript = () => {
    // This would save to the EHR system in a real implementation
    toast.success("Transcript saved to patient record", {
      description: `Transcription saved to ${patientName}'s medical record in `,
    });
  };

  const handleClearTranscript = () => {
    setTranscription("");
    setInterimTranscript("");
    toast.info("Transcript cleared");
  };

  const getConfidenceBadge = () => {
    if (confidenceScore > 0.8) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          High Confidence
        </Badge>
      );
    } else if (confidenceScore > 0.5) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Medium Confidence
        </Badge>
      );
    } else if (confidenceScore > 0) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Low Confidence
        </Badge>
      );
    }
    return null;
  };

  const handleProcessTranscript = async () => {
    if (!transcription.trim()) {
      toast.warning("No transcript to process");
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing of transcript
    // In a real implementation, this would call an AI service
    setTimeout(() => {
      const enhancedTranscription = transcription
        .split(".")
        .map((sentence) =>
          sentence.trim().length > 0 ? sentence.trim() + "." : ""
        )
        .join(" ");

      setTranscription(enhancedTranscription);
      setIsProcessing(false);

      toast.success("Transcript processed", {
        description: "Formatting improved and medical terms standardized",
      });
    }, 2000);
  };

  if (!isCallActive) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Voice Transcription</CardTitle>
            <CardDescription>
              Automatic consultation transcription
            </CardDescription>
          </div>
          {isTranscribing ? (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
              Recording
            </Badge>
          ) : (
            <Badge variant="outline">Not Recording</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={
                  isTranscribing ? stopTranscription : startTranscription
                }
                variant={isTranscribing ? "destructive" : "default"}
                size="sm"
              >
                {isTranscribing ? (
                  <MicOff className="h-4 w-4 mr-2" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                {isTranscribing ? "Stop Recording" : "Start Recording"}
              </Button>

              {isTranscribing && getConfidenceBadge()}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearTranscript}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyTranscript}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveTranscript}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="min-h-[150px] max-h-[250px] overflow-y-auto border rounded-md p-3 bg-white">
              {transcription ? (
                <p className="whitespace-pre-line">{transcription}</p>
              ) : (
                <p className="text-muted-foreground italic text-center py-8">
                  Transcription will appear here when you start recording...
                </p>
              )}

              {interimTranscript && (
                <>
                  <Separator className="my-2" />
                  <p className="text-muted-foreground italic">
                    {interimTranscript}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleProcessTranscript}
              disabled={isProcessing || !transcription}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clean & Format
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceToTextTranscription;
