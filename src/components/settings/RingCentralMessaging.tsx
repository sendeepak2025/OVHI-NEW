
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Phone, User } from "lucide-react";
import { toast } from "sonner";

const RingCentralMessaging: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [contacts] = useState([
    { 
      id: 1, 
      name: 'Dr. Sarah Wilson', 
      number: '+1 (555) 987-6543', 
      lastMessage: 'Patient consultation scheduled for 2 PM',
      time: '10 min ago',
      unread: 2
    },
    { 
      id: 2, 
      name: 'John Smith', 
      number: '+1 (555) 123-4567', 
      lastMessage: 'Thank you for the follow-up',
      time: '1 hour ago',
      unread: 0
    },
    { 
      id: 3, 
      name: 'Medical Center', 
      number: '+1 (555) 456-7890', 
      lastMessage: 'Lab results are ready for pickup',
      time: '2 hours ago',
      unread: 1
    },
  ]);

  const [messages] = useState([
    { id: 1, text: 'Hello, this is regarding the patient consultation', sender: 'them', time: '2:30 PM' },
    { id: 2, text: 'Yes, I have the patient files ready', sender: 'me', time: '2:32 PM' },
    { id: 3, text: 'Great! Can we schedule for 2 PM tomorrow?', sender: 'them', time: '2:35 PM' },
    { id: 4, text: 'That works perfectly. See you then.', sender: 'me', time: '2:36 PM' },
  ]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    if (!selectedContact) {
      toast.error("Please select a contact");
      return;
    }

    toast.success(`Message sent to ${selectedContact.name}`);
    setNewMessage('');
  };

  const handleCall = (contact: any) => {
    toast.success(`Calling ${contact.name} at ${contact.number}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{contact.time}</p>
                    {contact.unread > 0 && (
                      <Badge className="mt-1 bg-blue-600 text-white text-xs">
                        {contact.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          {selectedContact ? (
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedContact.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedContact.number}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCall(selectedContact)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          ) : (
            <CardTitle>Select a contact to start messaging</CardTitle>
          )}
        </CardHeader>
        
        {selectedContact && (
          <>
            <CardContent className="flex-1">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <Separator />
            
            <CardContent className="pt-4">
              <div className="flex space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[60px]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default RingCentralMessaging;
