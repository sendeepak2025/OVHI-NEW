import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Volume2, 
  VolumeX,
  Download,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionRecorderProps {
  isRecording: boolean;
  isPaused: boolean;
  onTranscriptionUpdate: (text: string) => void;
  onDurationUpdate: (duration: number) => void;
  recordingOptions?: {
    audio: boolean;
    video: boolean;
    screen: boolean;
  };
}

const SessionRecorder: React.FC<SessionRecorderProps> = ({
  isRecording,
  isPaused,
  onTranscriptionUpdate,
  onDurationUpdate,
  recordingOptions = { audio: true, video: false, screen: false }
}) => {
  const { toast } = useToast();
  
  // Recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [duration, setDuration] = useState(0);
  const [recordingSize, setRecordingSize] = useState(0);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Audio level monitoring
  useEffect(() => {
    if (isRecording && !isPaused && streamRef.current) {
      monitorAudioLevel();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording, isPaused]);

  // Duration tracking
  useEffect(() => {
    if (isRecording && !isPaused) {
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          onDurationUpdate(newDuration);
          return newDuration;
        });
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isRecording, isPaused, onDurationUpdate]);

  // Start recording when component mounts and isRecording is true
  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // Get media stream based on options
      const constraints: MediaStreamConstraints = {
        audio: recordingOptions.audio,
        video: recordingOptions.video
      };

      let stream: MediaStream;

      if (recordingOptions.screen) {
        // Screen recording
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: recordingOptions.audio
        });
      } else {
        // Regular audio/video recording
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      streamRef.current = stream;

      // Set up video preview
      if (videoRef.current && recordingOptions.video) {
        videoRef.current.srcObject = stream;
      }

      // Set up MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
          setRecordingSize(prev => prev + event.data.size);
        }
      };

      recorder.onstop = () => {
        toast({
          title: "Recording Saved",
          description: "Session recording has been saved securely."
        });
      };

      setMediaRecorder(recorder);
      recorder.start(1000); // Collect data every second

      // Start speech recognition for transcription
      startSpeechRecognition();

      toast({
        title: "Recording Started",
        description: "Audio, video, and transcription are now active."
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check permissions."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setMediaRecorder(null);
    setIsTranscribing(false);
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition."
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';
    let interimTranscript = '';

    recognition.onresult = (event: any) => {
      interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      onTranscriptionUpdate(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted') {
        toast({
          title: "Transcription Error",
          description: "Speech recognition encountered an error."
        });
      }
    };

    recognition.onend = () => {
      if (isRecording && !isPaused) {
        // Restart recognition if recording is still active
        setTimeout(() => recognition.start(), 100);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsTranscribing(true);
  };

  const monitorAudioLevel = () => {
    if (!streamRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(streamRef.current);
    
    analyser.fftSize = 256;
    microphone.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        
        if (isRecording && !isPaused) {
          requestAnimationFrame(updateAudioLevel);
        }
      }
    };

    updateAudioLevel();
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) {
      toast({
        title: "No Recording",
        description: "No recording data available to download."
      });
      return;
    }

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-recording-${new Date().toISOString().slice(0, 19)}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            Session Recording
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-2xl font-bold">{formatDuration(duration)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">File Size</p>
              <p className="text-lg">{formatFileSize(recordingSize)}</p>
            </div>
          </div>

          {/* Audio Level Indicator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Audio Level</p>
              <div className="flex items-center gap-1">
                {audioLevel > 10 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-sm">{Math.round(audioLevel)}</span>
              </div>
            </div>
            <Progress value={(audioLevel / 100) * 100} className="h-2" />
          </div>

          {/* Recording Options */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={recordingOptions.audio ? "default" : "secondary"}>
              <Mic className="h-3 w-3 mr-1" />
              Audio
            </Badge>
            <Badge variant={recordingOptions.video ? "default" : "secondary"}>
              <Video className="h-3 w-3 mr-1" />
              Video
            </Badge>
            <Badge variant={recordingOptions.screen ? "default" : "secondary"}>
              <Monitor className="h-3 w-3 mr-1" />
              Screen
            </Badge>
            <Badge variant={isTranscribing ? "default" : "secondary"}>
              <MicOff className="h-3 w-3 mr-1" />
              Transcription
            </Badge>
          </div>

          {/* Download Recording */}
          {recordedChunks.length > 0 && (
            <Button 
              variant="outline" 
              onClick={downloadRecording}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Recording
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Video Preview */}
      {recordingOptions.video && (
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <video 
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-48 bg-black rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Transcription Status */}
      <Card className={recordingOptions.video ? '' : 'lg:col-span-2'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isTranscribing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            Real-time Transcription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Status</p>
              <Badge variant={isTranscribing ? "default" : "secondary"}>
                {isTranscribing ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isTranscribing 
                ? "Listening and converting speech to text..." 
                : "Transcription will start automatically when recording begins."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionRecorder;