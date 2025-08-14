
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneOff, Delete, Users, History } from "lucide-react";
import { toast } from "sonner";

const RingCentralDialer: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [recentCalls] = useState([
    { number: '+1 (555) 123-4567', name: 'John Smith', time: '2 min ago', type: 'incoming' },
    { number: '+1 (555) 987-6543', name: 'Sarah Wilson', time: '15 min ago', type: 'outgoing' },
    { number: '+1 (555) 456-7890', name: 'Mike Johnson', time: '1 hour ago', type: 'missed' },
  ]);

  const dialpadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  const handleNumberClick = (number: string) => {
    setPhoneNumber(prev => prev + number);
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    
    setIsCallActive(true);
    setCallDuration(0);
    toast.success(`Calling ${phoneNumber}...`);
    
    // Simulate call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Auto end call after demo
    setTimeout(() => {
      clearInterval(timer);
      setIsCallActive(false);
      setCallDuration(0);
      toast.info("Call ended");
    }, 10000);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    toast.info("Call ended");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Advanced Dialer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="text-lg text-center"
              disabled={isCallActive}
            />
            {isCallActive && (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800">
                  Call Active - {formatDuration(callDuration)}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {dialpadNumbers.map((row, rowIndex) => 
              row.map((number) => (
                <Button
                  key={number}
                  variant="outline"
                  size="lg"
                  onClick={() => handleNumberClick(number)}
                  disabled={isCallActive}
                  className="h-12 text-lg font-semibold"
                >
                  {number}
                </Button>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBackspace}
              disabled={isCallActive}
              className="flex-1"
            >
              <Delete className="h-4 w-4" />
            </Button>
            {!isCallActive ? (
              <Button
                onClick={handleCall}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Call
              </Button>
            ) : (
              <Button
                onClick={handleEndCall}
                size="lg"
                variant="destructive"
                className="flex-1"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCalls.map((call, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    call.type === 'incoming' ? 'bg-green-100' :
                    call.type === 'outgoing' ? 'bg-blue-100' : 'bg-red-100'
                  }`}>
                    <Phone className={`h-4 w-4 ${
                      call.type === 'incoming' ? 'text-green-600' :
                      call.type === 'outgoing' ? 'text-blue-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{call.name}</p>
                    <p className="text-sm text-muted-foreground">{call.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{call.time}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPhoneNumber(call.number)}
                  >
                    <PhoneCall className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RingCentralDialer;
