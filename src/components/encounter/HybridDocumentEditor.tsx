import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Edit, Brain, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HybridDocumentEditorProps {
  aiGeneratedDocs: any;
  encounterData: any;
  onDocumentUpdate: (data: any) => void;
  onEncounterComplete?: (data: any) => void;
}

const HybridDocumentEditor: React.FC<HybridDocumentEditorProps> = ({
  aiGeneratedDocs,
  encounterData,
  onDocumentUpdate,
  onEncounterComplete
}) => {
  const { toast } = useToast();
  const [editingDoc, setEditingDoc] = useState('');
  const [documentContent, setDocumentContent] = useState(aiGeneratedDocs?.progressNote || '');

  const handleSave = () => {
    onDocumentUpdate({ ...encounterData, finalDocument: documentContent });
    toast({
      title: "Document Saved",
      description: "Your changes have been saved successfully."
    });
  };

  const handleComplete = () => {
    const finalData = { ...encounterData, finalDocument: documentContent, status: 'completed' };
    onEncounterComplete?.(finalData);
    toast({
      title: "Encounter Complete",
      description: "Encounter has been finalized and saved."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Hybrid AI + Manual Document Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Badge variant="default">
              <Brain className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
            <Badge variant="secondary">Manual Edits Available</Badge>
          </div>
          
          <Textarea
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            className="min-h-96 font-mono text-sm"
            placeholder="AI-generated content will appear here for editing..."
          />
          
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Encounter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HybridDocumentEditor;