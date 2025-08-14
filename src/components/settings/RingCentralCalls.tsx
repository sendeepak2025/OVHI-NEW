
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Phone, PhoneIncoming, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

const RingCentralCalls: React.FC = () => {
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [autoAnswer, setAutoAnswer] = useState(false);
  const [callForwarding, setCallForwarding] = useState(false);
  
  // Simulate incoming call
  const simulateIncomingCall = () => {
    const call = {
      id: 1,
      caller: 'Dr. Sarah Wilson',
      number: '+1 (555) 987-6543',
      type: 'Healthcare Provider'
    };
    setIncomingCall(call);
    toast.info("Incoming call from Dr. Sarah Wilson");
  };

  const answerCall = () => {
    toast.success(`Answered call from ${incomingCall.caller}`);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    toast.info(`Rejected call from ${incomingCall.caller}`);
    setIncomingCall(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Microphone unmuted" : "Microphone muted");
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.info(isSpeakerOn ? "Speaker off" : "Speaker on");
  };

  return (
    <div className="space-y-6">
      {/* Incoming Call Notification */}
      {incomingCall && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <PhoneIncoming className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Incoming Call</h3>
                  <p className="text-green-700">{incomingCall.caller}</p>
                  <p className="text-sm text-green-600">{incomingCall.number}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={answerCall}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Answer
                </Button>
                <Button
                  onClick={rejectCall}
                  variant="destructive"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Call Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                onClick={toggleMute}
                className="h-16"
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                <span className="ml-2">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>
              
              <Button
                variant={isSpeakerOn ? "default" : "outline"}
                onClick={toggleSpeaker}
                className="h-16"
              >
                {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                <span className="ml-2">Speaker</span>
              </Button>
            </div>
            
            <Button
              onClick={simulateIncomingCall}
              variant="outline"
              className="w-full"
            >
              <PhoneIncoming className="h-4 w-4 mr-2" />
              Simulate Incoming Call
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto Answer</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically answer incoming calls
                </p>
              </div>
              <Switch
                checked={autoAnswer}
                onCheckedChange={setAutoAnswer}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Call Forwarding</Label>
                <p className="text-sm text-muted-foreground">
                  Forward calls to another number
                </p>
              </div>
              <Switch
                checked={callForwarding}
                onCheckedChange={setCallForwarding}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Do Not Disturb</Label>
                <p className="text-sm text-muted-foreground">
                  Block incoming calls during consultations
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Badge className="bg-green-100 text-green-800 mb-2">Available</Badge>
              <p className="text-sm text-muted-foreground">Ready to receive calls</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">0 Active Calls</Badge>
              <p className="text-sm text-muted-foreground">No ongoing calls</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">Queue: 0</Badge>
              <p className="text-sm text-muted-foreground">No waiting calls</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RingCentralCalls;
