
import React, { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, ScreenShare, MessageCircle } from "lucide-react";
import AudioLevelIndicator from "./AudioLevelIndicator";

interface RingCentralVideoCallProps {
  patient: any;
  onEndCall: () => void;
  networkStatus?: 'online' | 'degraded' | 'offline';
}

const RingCentralVideoCall: React.FC<RingCentralVideoCallProps> = ({
  patient,
  onEndCall,
  networkStatus = 'online'
}) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<number>(100);
  const [callDuration, setCallDuration] = useState(0);
  const [patientAudioLevel, setPatientAudioLevel] = useState(0);
  const [doctorAudioLevel, setDoctorAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Simulate connecting to RingCentral
  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      toast.success(`Connected to call with ${patient.name}`);
    }, 2000);
    
    return () => clearTimeout(connectTimeout);
  }, [patient.name]);
  
  // Start call duration timer when connected
  useEffect(() => {
    if (!isConnected) return;
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isConnected]);
  
  // Simulate network quality changes based on networkStatus
  useEffect(() => {
    if (!isConnected) return;
    
    switch(networkStatus) {
      case 'degraded':
        setConnectionQuality(Math.floor(Math.random() * 30) + 40); // 40-70%
        break;
      case 'offline':
        setConnectionQuality(Math.floor(Math.random() * 30)); // 0-30%
        break;
      default:
        setConnectionQuality(Math.floor(Math.random() * 20) + 80); // 80-100%
    }
  }, [networkStatus, isConnected]);

  // Simulate speaking patterns
  useEffect(() => {
    if (!isConnected || !audioEnabled) return;
    
    const speakingInterval = setInterval(() => {
      // Random chance of speaking change
      if (Math.random() > 0.7) {
        setIsSpeaking(prev => !prev);
      }
    }, 2000);
    
    return () => clearInterval(speakingInterval);
  }, [audioEnabled, isConnected]);
  
  // Update audio levels based on speaking state
  useEffect(() => {
    if (!isConnected) return;
    
    const audioLevelInterval = setInterval(() => {
      if (isSpeaking) {
        // Patient is speaking
        setPatientAudioLevel(Math.floor(Math.random() * 50) + 50); // 50-100
        setDoctorAudioLevel(Math.floor(Math.random() * 20)); // 0-20
      } else if (audioEnabled) {
        // Doctor is speaking
        setDoctorAudioLevel(Math.floor(Math.random() * 50) + 50); // 50-100
        setPatientAudioLevel(Math.floor(Math.random() * 20)); // 0-20
      } else {
        // Nobody is speaking
        setDoctorAudioLevel(0);
        setPatientAudioLevel(0);
      }
    }, 200);
    
    return () => clearInterval(audioLevelInterval);
  }, [isSpeaking, audioEnabled, isConnected]);
  
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    toast.info(audioEnabled ? "Microphone muted" : "Microphone unmuted");
  };
  
  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    toast.info(videoEnabled ? "Camera turned off" : "Camera turned on");
  };
  
  const toggleScreenShare = () => {
    setIsSharingScreen(!isSharingScreen);
    toast.info(isSharingScreen ? "Stopped screen sharing" : "Started screen sharing");
  };
  
  const handleEndCall = () => {
    // In a real implementation, we would disconnect from RingCentral here
    toast.info(`Ending call with ${patient.name}`);
    setIsConnected(false);
    onEndCall();
  };
  
  // Format the call duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get connection quality indicator
  const getConnectionQualityIndicator = () => {
    if (connectionQuality > 70) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Excellent Connection
        </Badge>
      );
    } else if (connectionQuality > 40) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Fair Connection
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Poor Connection
        </Badge>
      );
    }
  };
  
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-60 bg-slate-100 rounded-lg">
        <div className="animate-pulse flex flex-col items-center">
          <Phone className="h-10 w-10 text-primary mb-4" />
          <p className="text-lg font-medium">Connecting to RingCentral...</p>
          <p className="text-sm text-muted-foreground mt-2">Establishing secure connection</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full">
      {/* Call duration display */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary" className="bg-black/70 text-white">
          {formatDuration(callDuration)}
        </Badge>
      </div>
      
      {/* Main video stream (patient) */}
      <div className={`aspect-video bg-slate-100 w-full flex items-center justify-center rounded-lg overflow-hidden ${!videoEnabled ? 'bg-slate-800' : ''}`}>
        {videoEnabled ? (
          <div className="relative w-full h-full">
            {/* In a real implementation, this would be replaced with the video stream from RingCentral */}
            <img 
              src={patient.avatar} 
              alt="Patient video stream" 
              className={`w-full h-full object-cover ${connectionQuality < 70 ? 'filter blur-sm' : ''} ${connectionQuality < 40 ? 'filter blur-md' : ''}`}
              style={{ 
                opacity: Math.max(0.6, connectionQuality / 100),
                transition: 'filter 0.5s, opacity 0.5s'
              }}
            />
            
            {/* Audio level indicator for patient */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[300px] w-[300px] flex items-center justify-center">
                <AudioLevelIndicator 
                  isActive={audioEnabled && patientAudioLevel > 10} 
                  audioLevel={patientAudioLevel}
                  size="lg"
                  color="bg-green-500"
                />
              </div>
            </div>
            
            {/* Speaking indicator */}
            {isSpeaking && audioEnabled && (
              <div className="absolute bottom-4 left-4 flex items-center">
                <Badge variant="voiceActive" className="flex items-center gap-1 px-2 py-1">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-3 bg-white/70 animate-pulse"></div>
                    <div className="w-1 h-5 bg-white/90 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-3 bg-white/70 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                  <span className="text-xs font-medium ml-1">Speaking</span>
                </Badge>
              </div>
            )}
            
            {/* Video elements that would be used with real RingCentral implementation */}
            <video ref={remoteVideoRef} autoPlay playsInline muted hidden></video>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Phone className="h-16 w-16 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Camera Off</p>
          </div>
        )}
      </div>
      
      {/* Picture-in-picture for doctor's view */}
      <div className="absolute bottom-4 right-4 w-1/5 aspect-video bg-slate-800 rounded-lg border-2 border-white shadow-lg overflow-hidden">
        <div className="relative w-full h-full">
          {videoEnabled ? (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              {/* Local video element would be used with real RingCentral implementation */}
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover"></video>
              
              {/* Audio ring control for doctor */}
              <AudioLevelIndicator 
                isActive={audioEnabled && doctorAudioLevel > 10} 
                audioLevel={doctorAudioLevel}
                size="sm"
                color="bg-primary"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
      </div>
      
      {/* Call controls */}
      <div className="flex flex-col py-2 bg-slate-50 border-t rounded-b-lg">
        <div className="px-4 py-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">RingCentral Connection</span>
            <span className="text-xs font-medium">{getConnectionQualityIndicator()}</span>
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-4 py-2">
          <Button 
            variant={audioEnabled ? "outline" : "destructive"} 
            size="icon" 
            onClick={toggleAudio}
          >
            {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant={videoEnabled ? "outline" : "destructive"} 
            size="icon" 
            onClick={toggleVideo}
          >
            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant={isSharingScreen ? "secondary" : "outline"} 
            size="icon" 
            onClick={toggleScreenShare}
          >
            <ScreenShare className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="default" 
            size="icon"
            onClick={() => toast.info("Opening notes")}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="destructive" 
            size="icon"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RingCentralVideoCall;
