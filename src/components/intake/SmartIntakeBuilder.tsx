import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface SmartIntakeBuilderProps {
  specialty: string;
  appointmentType: string;
  onIntakeComplete: (data: any) => void;
}

const SmartIntakeBuilder: React.FC<SmartIntakeBuilderProps> = ({
  specialty,
  appointmentType,
  onIntakeComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [intakeData, setIntakeData] = useState<any>({});
  const [progress, setProgress] = useState(0);

  const specialtyQuestions = {
    'primary-care': [
      { id: 'chief_complaint', type: 'textarea', label: 'What brings you in today?', required: true },
      { id: 'pain_scale', type: 'radio', label: 'Rate your pain (0-10)', options: Array.from({length: 11}, (_, i) => i.toString()) },
      { id: 'symptom_duration', type: 'select', label: 'How long have you had these symptoms?', options: ['Less than 24 hours', '1-7 days', '1-4 weeks', 'More than 1 month'] }
    ],
    'cardiology': [
      { id: 'chest_pain', type: 'radio', label: 'Are you experiencing chest pain?', options: ['Yes', 'No'] },
      { id: 'shortness_breath', type: 'radio', label: 'Any shortness of breath?', options: ['Yes', 'No'] },
      { id: 'exercise_tolerance', type: 'textarea', label: 'Describe your exercise tolerance' }
    ],
    'mental-health': [
      { id: 'mood_rating', type: 'radio', label: 'Rate your mood today (1-5)', options: ['1 (Very Poor)', '2 (Poor)', '3 (Fair)', '4 (Good)', '5 (Excellent)'] },
      { id: 'sleep_quality', type: 'radio', label: 'How has your sleep been?', options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'] },
      { id: 'anxiety_level', type: 'radio', label: 'Anxiety level (0-10)', options: Array.from({length: 11}, (_, i) => i.toString()) }
    ]
  };

  const questions = specialtyQuestions[specialty as keyof typeof specialtyQuestions] || specialtyQuestions['primary-care'];

  useEffect(() => {
    setProgress((currentStep / questions.length) * 100);
  }, [currentStep, questions.length]);

  const handleAnswer = (questionId: string, value: string) => {
    setIntakeData(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onIntakeComplete({ ...intakeData, specialty, appointmentType });
    }
  };

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Smart Patient Intake - {specialty}</span>
          <Badge variant="secondary">{currentStep + 1} of {questions.length}</Badge>
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="min-h-48">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.label}</h3>
          
          {currentQuestion.type === 'textarea' && (
            <Textarea
              value={intakeData[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder="Please describe in detail..."
              className="min-h-24"
            />
          )}
          
          {currentQuestion.type === 'radio' && (
            <RadioGroup
              value={intakeData[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              {currentQuestion.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        
        <Button 
          onClick={handleNext}
          className="w-full"
          disabled={currentQuestion && 'required' in currentQuestion && currentQuestion.required && !intakeData[currentQuestion.id]}
        >
          {isLastStep ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Intake
            </>
          ) : (
            <>
              Next Question
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SmartIntakeBuilder;