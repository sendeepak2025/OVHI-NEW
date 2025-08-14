import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Send, Phone, Video, Mail, Bell, 
  Clock, AlertTriangle, CheckCircle, User, Calendar,
  Smartphone, Settings, Archive, Star, Pill
} from 'lucide-react';
import { toast } from 'sonner';
import { Patient } from '@/types/dataTypes';

interface Message {
  id: string;
  type: 'secure-message' | 'sms' | 'email' | 'voice-message';
  subject?: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'replied';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  encrypted: boolean;
  attachments?: string[];
}

interface Reminder {
  id: string;
  type: 'appointment' | 'medication' | 'follow-up' | 'lab-results' | 'care-gap';
  title: string;
  description: string;
  scheduledDate: Date;
  sentDate?: Date;
  status: 'scheduled' | 'sent' | 'acknowledged';
  channel: 'sms' | 'email' | 'phone' | 'portal';
  patientResponse?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  authorized: boolean;
  accessLevel: 'full' | 'limited' | 'emergency-only';
}

interface PatientCommunicationCenterProps {
  patient: Patient;
  onClose?: () => void;
}

export const PatientCommunicationCenter: React.FC<PatientCommunicationCenterProps> = ({
  patient,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newMessage, setNewMessage] = useState({
    type: 'secure-message' as const,
    subject: '',
    content: '',
    priority: 'normal' as const
  });
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    loadCommunicationHistory();
    loadReminders();
    loadFamilyMembers();
  }, [patient]);

  const loadCommunicationHistory = async () => {
    // Mock message data
    const mockMessages: Message[] = [
      {
        id: '1',
        type: 'secure-message',
        subject: 'Lab Results Available',
        content: 'Your recent lab results are now available for review. Please log into your patient portal to view them.',
        sender: 'Dr. Smith',
        recipient: patient.firstName + ' ' + patient.lastName,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'read',
        priority: 'normal',
        encrypted: true
      },
      {
        id: '2',
        type: 'sms',
        content: 'Reminder: You have an appointment tomorrow at 2:00 PM with Dr. Smith.',
        sender: 'Practice Automation',
        recipient: patient.phone || '',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'delivered',
        priority: 'normal',
        encrypted: false
      }
    ];
    setMessages(mockMessages);
  };

  const loadReminders = async () => {
    // Mock reminder data
    const mockReminders: Reminder[] = [
      {
        id: '1',
        type: 'appointment',
        title: 'Upcoming Appointment Reminder',
        description: 'Reminder for your appointment with Dr. Smith tomorrow at 2:00 PM',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled',
        channel: 'sms'
      },
      {
        id: '2',
        type: 'medication',
        title: 'Medication Refill Due',
        description: 'Your Lisinopril prescription is due for refill in 3 days',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        channel: 'email'
      }
    ];
    setReminders(mockReminders);
  };

  const loadFamilyMembers = async () => {
    // Mock family member data
    const mockFamily: FamilyMember[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        relationship: 'Spouse',
        phone: '555-987-6543',
        email: 'sarah.j@email.com',
        authorized: true,
        accessLevel: 'full'
      }
    ];
    setFamilyMembers(mockFamily);
  };

  const handleSendMessage = async () => {
    if (!newMessage.content.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      type: newMessage.type,
      subject: newMessage.subject,
      content: newMessage.content,
      sender: 'Dr. Provider',
      recipient: patient.firstName + ' ' + patient.lastName,
      timestamp: new Date(),
      status: 'sent',
      priority: newMessage.priority,
      encrypted: newMessage.type === 'secure-message'
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage({
      type: 'secure-message',
      subject: '',
      content: '',
      priority: 'normal'
    });
    setIsComposing(false);

    toast.success('Message sent successfully');
  };

  const handleScheduleReminder = async (reminder: Partial<Reminder>) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      type: reminder.type || 'appointment',
      title: reminder.title || '',
      description: reminder.description || '',
      scheduledDate: reminder.scheduledDate || new Date(),
      status: 'scheduled',
      channel: reminder.channel || 'sms'
    };

    setReminders(prev => [newReminder, ...prev]);
    toast.success('Reminder scheduled successfully');
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'secure-message': return <MessageSquare className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'voice-message': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'delivered': return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case 'sent': return <Clock className="h-3 w-3 text-gray-500" />;
      default: return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Center</h2>
          <p className="text-muted-foreground">
            Patient: {patient.firstName} {patient.lastName}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="family">Family Access</TabsTrigger>
          <TabsTrigger value="alerts">Care Alerts</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Message History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getMessageIcon(message.type)}
                        <div>
                          <h4 className="font-medium">{message.subject || 'Direct Message'}</h4>
                          <p className="text-sm text-muted-foreground">
                            From: {message.sender} • To: {message.recipient}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                        {getStatusIcon(message.status)}
                        {message.encrypted && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Encrypted
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{message.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{message.timestamp.toLocaleString()}</span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm">
                          Forward
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Automated Reminders
                </CardTitle>
                <Button onClick={() => {
                  // Open reminder scheduling dialog
                  toast.info('Reminder scheduling interface would open here');
                }}>
                  <Bell className="h-4 w-4 mr-2" />
                  Schedule Reminder
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{reminder.title}</h4>
                        <p className="text-sm text-muted-foreground">{reminder.description}</p>
                      </div>
                      <Badge variant="outline" className={reminder.status === 'sent' ? 'text-green-600' : 'text-blue-600'}>
                        {reminder.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Type:</span> {reminder.type}
                      </div>
                      <div>
                        <span className="font-medium">Channel:</span> {reminder.channel}
                      </div>
                      <div>
                        <span className="font-medium">Scheduled:</span> {reminder.scheduledDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Access Tab */}
        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Authorized Family Members
                </CardTitle>
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Add Family Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.relationship}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={member.authorized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {member.authorized ? 'Authorized' : 'Not Authorized'}
                        </Badge>
                        <Badge variant="outline">
                          {member.accessLevel}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Phone:</span> {member.phone}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span> {member.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Care Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Active Care Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-l-red-500 bg-red-50 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <h4 className="font-medium text-red-800">Critical Value Alert</h4>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Blood pressure reading of 180/100 requires immediate follow-up
                  </p>
                </div>
                
                <div className="border-l-4 border-l-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <h4 className="font-medium text-yellow-800">Care Gap</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Annual diabetic eye exam is overdue by 3 months
                  </p>
                </div>
                
                <div className="border-l-4 border-l-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <Pill className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="font-medium text-blue-800">Medication Alert</h4>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Prescription refill needed for Lisinopril within 5 days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="messageType">Message Type</Label>
                  <Select
                    value={newMessage.type}
                    onValueChange={(value) => setNewMessage(prev => ({
                      ...prev,
                      type: value as any
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secure-message">Secure Message</SelectItem>
                      <SelectItem value="sms">SMS Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newMessage.priority}
                    onValueChange={(value) => setNewMessage(prev => ({
                      ...prev,
                      priority: value as any
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {newMessage.type === 'secure-message' && (
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({
                      ...prev,
                      subject: e.target.value
                    }))}
                    placeholder="Enter message subject"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({
                    ...prev,
                    content: e.target.value
                  }))}
                  rows={6}
                  placeholder="Enter your message here..."
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setNewMessage({
                    type: 'secure-message',
                    subject: '',
                    content: '',
                    priority: 'normal'
                  });
                }}>
                  Clear
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientCommunicationCenter;