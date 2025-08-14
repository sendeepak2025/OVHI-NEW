import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceCommand {
  command: string;
  action: string;
  description: string;
  example: string;
}

interface VoiceCommandProcessorProps {
  onVoiceCommand: (command: string, data: any) => void;
  isEnabled?: boolean;
}

const VOICE_COMMANDS: VoiceCommand[] = [
  {
    command: 'add diagnosis',
    action: 'diagnosis',
    description: 'Add a diagnosis',
    example: 'Add diagnosis hypertension'
  },
  {
    command: 'blood pressure',
    action: 'vitals',
    description: 'Record blood pressure',
    example: 'Blood pressure 120 over 80'
  },
  {
    command: 'temperature',
    action: 'vitals',
    description: 'Record temperature',
    example: 'Temperature 98.6'
  },
  {
    command: 'heart rate',
    action: 'vitals',
    description: 'Record heart rate',
    example: 'Heart rate 72'
  },
  {
    command: 'normal exam',
    action: 'soap',
    description: 'Insert normal exam findings',
    example: 'Normal physical exam'
  },
  {
    command: 'patient reports',
    action: 'soap',
    description: 'Add subjective note',
    example: 'Patient reports chest pain'
  },
  {
    command: 'start encounter',
    action: 'encounter',
    description: 'Begin new encounter',
    example: 'Start encounter'
  },
  {
    command: 'follow up',
    action: 'plan',
    description: 'Add follow-up instruction',
    example: 'Follow up in 3 months'
  }
];

const MEDICAL_SHORTCUTS = {
  'bp': 'blood pressure',
  'hr': 'heart rate',
  'temp': 'temperature',
  'o2 sat': 'oxygen saturation',
  'rr': 'respiratory rate',
  'htn': 'hypertension',
  'dm': 'diabetes mellitus',
  'cad': 'coronary artery disease',
  'chf': 'congestive heart failure',
  'copd': 'chronic obstructive pulmonary disease',
  'pe': 'physical examination',
  'wn': 'within normal',
  'wnl': 'within normal limits',
  'nad': 'no acute distress',
  'rrr': 'regular rate and rhythm'
};

export const VoiceCommandProcessor: React.FC<VoiceCommandProcessorProps> = ({
  onVoiceCommand,
  isEnabled = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
      
      // @ts-ignore
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition error. Please try again.');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const processVoiceCommand = (text: string) => {
    // Expand medical abbreviations
    let processedText = text;
    Object.entries(MEDICAL_SHORTCUTS).forEach(([abbrev, full]) => {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      processedText = processedText.replace(regex, full);
    });

    // Find matching commands
    const matchedCommand = VOICE_COMMANDS.find(cmd =>
      processedText.includes(cmd.command.toLowerCase())
    );

    if (matchedCommand) {
      const commandData = extractCommandData(processedText, matchedCommand);
      onVoiceCommand(matchedCommand.action, commandData);
      toast.success(`Voice command executed: ${matchedCommand.description}`);
    } else {
      // If no specific command, treat as dictation
      onVoiceCommand('dictation', { text: processedText });
      toast.info('Voice dictation captured');
    }
  };

  const extractCommandData = (text: string, command: VoiceCommand) => {
    switch (command.action) {
      case 'vitals':
        return extractVitalSigns(text);
      case 'diagnosis':
        return extractDiagnosis(text);
      case 'soap':
        return { section: determineSoapSection(text), content: text };
      case 'plan':
        return { type: 'followup', content: text };
      default:
        return { content: text };
    }
  };

  const extractVitalSigns = (text: string) => {
    const vitals: any = {};
    
    // Blood pressure patterns
    const bpMatch = text.match(/(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/);
    if (bpMatch) {
      vitals.bloodPressure = `${bpMatch[1]}/${bpMatch[2]}`;
    }
    
    // Heart rate
    const hrMatch = text.match(/heart rate\s*(\d{2,3})/);
    if (hrMatch) {
      vitals.heartRate = parseInt(hrMatch[1]);
    }
    
    // Temperature
    const tempMatch = text.match(/temperature\s*(\d{2,3}(?:\.\d)?)/);
    if (tempMatch) {
      vitals.temperature = parseFloat(tempMatch[1]);
    }
    
    return vitals;
  };

  const extractDiagnosis = (text: string) => {
    // Extract diagnosis from voice command
    const diagnosisText = text.replace(/add diagnosis\s*/i, '').trim();
    return { description: diagnosisText };
  };

  const determineSoapSection = (text: string) => {
    if (text.includes('patient reports') || text.includes('complains of')) {
      return 'subjective';
    } else if (text.includes('exam') || text.includes('vital signs')) {
      return 'objective';
    } else if (text.includes('diagnosis') || text.includes('assessment')) {
      return 'assessment';
    } else if (text.includes('plan') || text.includes('follow up')) {
      return 'plan';
    }
    return 'subjective'; // default
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setConfidence(0);
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Voice recognition started. Speak your command.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">Voice commands not supported in this browser</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          Voice Command Center
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!isEnabled}
            variant={isListening ? 'destructive' : 'default'}
            size="lg"
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Start Voice Input
              </>
            )}
          </Button>
          
          {isListening && (
            <Badge variant="outline" className="bg-red-50 text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
              Listening...
            </Badge>
          )}
        </div>

        {transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
            <p className="text-sm font-medium">{transcript}</p>
            {confidence > 0 && (
              <Badge variant="outline" className="mt-2">
                Confidence: {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Quick Commands:
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-xs">
            {VOICE_COMMANDS.slice(0, 6).map((cmd, index) => (
              <div key={index} className="p-2 bg-muted/50 rounded">
                <div className="font-medium">{cmd.description}</div>
                <div className="text-muted-foreground italic">"{cmd.example}"</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Medical Abbreviations:</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 text-xs">
            {Object.entries(MEDICAL_SHORTCUTS).slice(0, 6).map(([abbrev, full]) => (
              <div key={abbrev} className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">{abbrev}</Badge>
                <span className="text-muted-foreground">{full}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};