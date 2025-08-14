"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { io } from "socket.io-client"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Send, User, Clock, ArrowLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { getProvidersAPI } from "@/services/operations/patient"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

// Hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}

// Mock data for regular conversations/messages with timestamps for sorting
const conversationsData = [
  {
    id: 1,
    avatar: "https://randomuser.me/api/portraits/women/62.jpg",
    name: "Emma Thompson",
    lastMessage: "Thank you, Doctor. I'll make sure to follow your advice.",
    time: "10 min ago",
    timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
    unread: 0,
    online: true,
    type: "patient",
  },
  {
    id: 2,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "James Wilson",
    lastMessage: "I've been experiencing chest pain again. Could we schedule a follow-up soon?",
    time: "1 hour ago",
    timestamp: Date.now() - 60 * 60 * 1000, // 1 hour ago
    unread: 2,
    online: false,
    type: "patient",
  },
  {
    id: 3,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Dr. Rebecca Martinez",
    lastMessage: "I've reviewed the patient files you sent. Let's discuss them tomorrow.",
    time: "Yesterday",
    timestamp: Date.now() - 24 * 60 * 60 * 1000, // Yesterday
    unread: 0,
    online: false,
    type: "doctor",
  },
  {
    id: 4,
    avatar: "https://randomuser.me/api/portraits/men/17.jpg",
    name: "Robert Garcia",
    lastMessage: "The new medication seems to be working well. My blood pressure readings look stable now.",
    time: "2 days ago",
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    unread: 0,
    online: true,
    type: "patient",
  },
]

// Mock messages for a selected conversation
const messageThreadData = [
  {
    id: 1,
    sender: "Emma Thompson",
    senderAvatar: "https://randomuser.me/api/portraits/women/62.jpg",
    content:
      "Hello Dr. Johnson, I wanted to ask about the side effects of the new medication you prescribed. I've been feeling a bit dizzy in the mornings.",
    timestamp: "Yesterday, 10:30 AM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Dr. Sarah Johnson",
    senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content:
      "Hi Emma, thank you for letting me know. Dizziness can be a side effect, especially when you first start taking it. Try taking it with food and see if that helps.",
    timestamp: "Yesterday, 11:15 AM",
    isMe: true,
  },
  {
    id: 3,
    sender: "Emma Thompson",
    senderAvatar: "https://randomuser.me/api/portraits/women/62.jpg",
    content: "I'll try that. Should I also monitor my blood pressure when this happens?",
    timestamp: "Yesterday, 11:45 AM",
    isMe: false,
  },
  {
    id: 4,
    sender: "Dr. Sarah Johnson",
    senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content:
      "Yes, it would be helpful to take your blood pressure readings when you experience dizziness. Please log them in your patient portal. If the dizziness persists for more than a few days or becomes severe, please contact me immediately.",
    timestamp: "Yesterday, 12:30 PM",
    isMe: true,
  },
  {
    id: 5,
    sender: "Emma Thompson",
    senderAvatar: "https://randomuser.me/api/portraits/women/62.jpg",
    content: "Thank you, Doctor. I'll make sure to follow your advice.",
    timestamp: "Today, 10:15 AM",
    isMe: false,
  },
]

// Mock user data
const mockUser = {
  id: "doctor_001",
  firstname: "Dr. Sarah",
  lastname: "Johnson",
}

const Messages: React.FC = () => {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("all")
  const [selectedConversation, setSelectedConversation] = useState(conversationsData[0])
  const [messageInput, setMessageInput] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [sortedConversations, setSortedConversations] = useState(conversationsData)

  const BASE_URL = import.meta.env.VITE_APP_SOCKET_URL

  // Socket.IO states for Team chat
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [socketMessages, setSocketMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const [isConnected, setIsConnected] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unreadMessagesByPatient, setUnreadMessagesByPatient] = useState({})
  const [patientConversationMap, setPatientConversationMap] = useState({})
  const [conversationPatientMap, setConversationPatientMap] = useState({})
  const [patientLastActivity, setPatientLastActivity] = useState({})

  // Refs for Socket.IO
  const socketRef = useRef(null)
  const chatEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isInitializedRef = useRef(false)
  const currentConversationRef = useRef(null)
  const selectedPatientRef = useRef(null)

  const { user, token } = useSelector((state: RootState) => state.auth)
  const CURRENT_DOCTOR_ID = user?.id

  const form = useForm({
    defaultValues: {
      recipient: "",
      subject: "",
      message: "",
    },
  })

  // Sort conversations by most recent activity
  const sortConversationsByActivity = useCallback(
    (conversations, patientActivity = {}) => {
      return [...conversations].sort((a, b) => {
        if (activeTab === "doctor") {
          // For doctor tab, use patient activity timestamps
          const aActivity = patientActivity[a.patientId] || 0
          const bActivity = patientActivity[b.patientId] || 0
          return bActivity - aActivity
        } else {
          // For regular conversations, use timestamp
          return (b.timestamp || 0) - (a.timestamp || 0)
        }
      })
    },
    [activeTab],
  )

  // Update conversation order when new message arrives
  const updateConversationOrder = useCallback(
    (conversationId, patientId) => {
      const now = Date.now()

      if (activeTab === "doctor" && patientId) {
        setPatientLastActivity((prev) => ({
          ...prev,
          [patientId]: now,
        }))
      } else {
        // Update regular conversation timestamp
        setSortedConversations((prev) =>
          prev
            .map((conv) => (conv.id === conversationId ? { ...conv, timestamp: now, time: "now" } : conv))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
        )
      }
    },
    [activeTab],
  )

  // Scroll to bottom for socket messages
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [])

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    if (isMobile) {
      setIsChatOpen(true)
    }
  }

  // Handle patient selection for socket chat
  const handlePatientSelect = useCallback(
    (patient) => {
      if (!socketRef.current || !socketRef.current.connected) {
        console.warn("❌ Socket not connected, cannot select patient")
        return
      }

      selectedPatientRef.current = patient
      setSelectedPatient(patient)
      setSocketMessages([])
      setTypingUsers({})
      setCurrentConversationId(null)
      currentConversationRef.current = null
      setIsLoadingHistory(true)

      if (isMobile) {
        setIsChatOpen(true)
      }

      socketRef.current.emit("joinConversation", {
        senderId: CURRENT_DOCTOR_ID,
        receiverId: patient.patientId,
      })
    },
    [CURRENT_DOCTOR_ID, isMobile],
  )

  // Initialize socket connection when Team tab is active
  useEffect(() => {
    if (activeTab !== "doctor" || !CURRENT_DOCTOR_ID || isInitializedRef.current) return

    isInitializedRef.current = true

    // Create socket connection
    const socket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    })

    socketRef.current = socket

    // Connection events
    socket.on("connect", () => {
      setIsConnected(true)
      socket.emit("registerUser", CURRENT_DOCTOR_ID)
    })

    socket.on("disconnect", (reason) => {
      setIsConnected(false)
    })

    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error)
      setIsConnected(false)
    })

    // Message events
    socket.on("receiveMessage", (message) => {
      const senderPatientId = message.sender_id

      // Update conversation order
      updateConversationOrder(message.conversation_id, senderPatientId)

      if (message.conversation_id === currentConversationRef.current) {
        setSocketMessages((prev) => {
          if (prev.some((msg) => msg.id === message.id)) {
            return prev
          }

          const newMessage = {
            ...message,
            isMe: message.sender_id === CURRENT_DOCTOR_ID,
          }

          scrollToBottom()
          return [...prev, newMessage]
        })
      } else {
        setUnreadMessagesByPatient((prev) => {
          const currentUnread = prev[senderPatientId] || []
          if (currentUnread.some((msg) => msg.id === message.id)) {
            return prev
          }

          return {
            ...prev,
            [senderPatientId]: [...currentUnread, message],
          }
        })

        setConversationPatientMap((prev) => ({
          ...prev,
          [message.conversation_id]: senderPatientId,
        }))

        setPatientConversationMap((prev) => ({
          ...prev,
          [senderPatientId]: message.conversation_id,
        }))
      }
    })

    socket.on("messageSentConfirmation", (message) => {
      // Update conversation order for sent messages
      updateConversationOrder(message.conversation_id, message.receiver_id)

      if (message.conversation_id === currentConversationRef.current) {
        setSocketMessages((prev) =>
          prev.map((msg) => {
            if (msg.tempId === message.tempId || msg.id === message.id) {
              return { ...msg, ...message, isMe: true }
            }
            return msg
          }),
        )
        scrollToBottom()
      }
    })

    // Conversation events
    socket.on("conversationJoined", ({ conversationId, senderId, receiverId }) => {
      currentConversationRef.current = conversationId
      setCurrentConversationId(conversationId)
      setSocketMessages([])
      setIsLoadingHistory(true)
      setTypingUsers({})

      const patientId = receiverId
      setPatientConversationMap((prev) => ({
        ...prev,
        [patientId]: conversationId,
      }))

      setConversationPatientMap((prev) => ({
        ...prev,
        [conversationId]: patientId,
      }))

      setUnreadMessagesByPatient((prev) => {
        const newUnread = { ...prev }
        delete newUnread[patientId]
        return newUnread
      })

      socket.emit("getConversationHistory", {
        conversationId,
        userId: CURRENT_DOCTOR_ID,
      })
    })

    socket.on("conversationHistory", ({ conversationId, messages: historyMessages }) => {
      if (conversationId === currentConversationRef.current) {
        const formattedMessages = historyMessages.map((msg) => ({
          ...msg,
          isMe: msg.sender_id === CURRENT_DOCTOR_ID,
        }))

        setSocketMessages(formattedMessages)
        setIsLoadingHistory(false)
        scrollToBottom()
      }
    })

    // Typing events
    socket.on("displayTyping", ({ userId, conversationId }) => {
      if (userId !== CURRENT_DOCTOR_ID && conversationId === currentConversationRef.current) {
        setTypingUsers((prev) => ({ ...prev, [userId]: true }))
      }
    })

    socket.on("removeTyping", ({ userId, conversationId }) => {
      if (conversationId === currentConversationRef.current) {
        setTypingUsers((prev) => {
          const newState = { ...prev }
          delete newState[userId]
          return newState
        })
      }
    })

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error)
    })

    // Cleanup function
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      socket.disconnect()
      isInitializedRef.current = false
      currentConversationRef.current = null
      selectedPatientRef.current = null
    }
  }, [activeTab, CURRENT_DOCTOR_ID, scrollToBottom, updateConversationOrder])

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (token) {
          const res = await getProvidersAPI(token, "")
          if (res && Array.isArray(res)) {
            const transformedPatients = res.map((item) => ({
              ...item,
              patientId: item.user_id,
            }))
            setPatients(transformedPatients)
          }
        } else {
          // Mock data for testing
          const mockPatients = [
            { patientId: "patient_001", firstname: "Alice", lastname: "Smith" },
            { patientId: "patient_002", firstname: "Bob", lastname: "Johnson" },
            { patientId: "patient_003", firstname: "Charlie", lastname: "Brown" },
          ]
          setPatients(mockPatients)
        }
      } catch (error) {
        console.error("❌ Failed to fetch patients:", error)
      }
    }

    fetchPatients()
  }, [token])

  // Sort conversations when data changes
  useEffect(() => {
    if (activeTab === "doctor") {
      const sortedPatients = sortConversationsByActivity(patients, patientLastActivity)
      setPatients(sortedPatients)
    } else {
      const sorted = sortConversationsByActivity(conversationsData)
      setSortedConversations(sorted)
    }
  }, [patientLastActivity, activeTab, sortConversationsByActivity])

  // Send socket message
  const handleSendSocketMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedPatient || !socketRef.current?.connected) {
      console.warn("❌ Cannot send message - missing requirements")
      return
    }

    const tempId = `temp_${Date.now()}_${Math.random()}`
    const messageData = {
      tempId,
      sender_id: CURRENT_DOCTOR_ID,
      receiver_id: selectedPatient.patientId,
      message: messageInput.trim(),
      created_at: new Date().toISOString(),
      isMe: true,
      conversation_id: currentConversationRef.current,
    }

    setSocketMessages((prev) => [...prev, messageData])
    setMessageInput("")
    scrollToBottom()

    socketRef.current.emit("sendMessage", {
      sender_id: CURRENT_DOCTOR_ID,
      receiver_id: selectedPatient.patientId,
      message: messageInput.trim(),
      tempId,
    })
  }, [messageInput, selectedPatient, CURRENT_DOCTOR_ID, scrollToBottom])

  // Handle typing for socket chat
  const handleSocketTyping = useCallback(
    (e) => {
      setMessageInput(e.target.value)

      if (!currentConversationRef.current || !socketRef.current?.connected) {
        return
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      socketRef.current.emit("typing", {
        conversationId: currentConversationRef.current,
        userId: CURRENT_DOCTOR_ID,
      })

      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit("stopTyping", {
            conversationId: currentConversationRef.current,
            userId: CURRENT_DOCTOR_ID,
          })
        }
      }, 1500)
    },
    [CURRENT_DOCTOR_ID],
  )

  // Get unread count for patient
  const getUnreadCount = useCallback(
    (patientId) => {
      const unreadMessages = unreadMessagesByPatient[patientId] || []
      return unreadMessages.length
    },
    [unreadMessagesByPatient],
  )

  // Get typing user name
  const getTypingUserName = useCallback(() => {
    const typingUserIds = Object.keys(typingUsers)
    if (typingUserIds.length === 0) return ""

    const typingId = typingUserIds[0]
    if (typingId === CURRENT_DOCTOR_ID) {
      return `${mockUser.firstname} ${mockUser.lastname}`
    }

    const typingPatient = patients.find((p) => `${p.patientId}` === typingId)
    return typingPatient ? `${typingPatient.firstname} ${typingPatient.lastname}` : "Someone"
  }, [typingUsers, patients, CURRENT_DOCTOR_ID])

  const handleSendMessage = () => {
    if (activeTab === "doctor") {
      handleSendSocketMessage()
    } else {
      if (messageInput.trim() === "") return

      // Update conversation order for regular messages
      updateConversationOrder(selectedConversation.id, new Date())

      toast.success("Message sent successfully")
      setMessageInput("")
    }
  }

  const handleCreateNewMessage = (data: any) => {
    toast.success("New message created successfully")
    form.reset()
  }

  const filterConversations = (type: string) => {
    if (type === "all") return sortedConversations
    return sortedConversations.filter((conversation) => conversation.type === type)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Chat interface component
  const ChatInterface = ({ isInModal = false }) => (
    <>
      {activeTab === "doctor" ? (
        // Socket.IO Team Chat Interface
        selectedPatient ? (
          <>
            <CardHeader className={`px-4 py-3 border-b flex-none ${isInModal ? "pb-2" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isInModal && (
                    <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} className="p-1 h-8 w-8">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedPatient.firstname[0]}
                      {selectedPatient.lastname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedPatient.firstname} {selectedPatient.lastname}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                      Patient ID: {selectedPatient.patientId}
                    </p>
                  </div>
                </div>

                {Object.keys(typingUsers).length > 0 && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm">{getTypingUserName()} is typing...</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className={`flex-1 overflow-auto p-4 space-y-4 ${isInModal ? "max-h-[60vh]" : ""}`}>
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading chat history...</p>
                </div>
              ) : socketMessages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                socketMessages.map((message, index) => (
                  <div
                    key={message.id || message.tempId || index}
                    className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.isMe ? "flex-row-reverse" : ""}`}>
                      {!message.isMe && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback>
                            {selectedPatient.firstname[0]}
                            {selectedPatient.lastname[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.isMe ? "bg-primary text-primary-foreground" : "bg-muted border"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </CardContent>

            <CardFooter className="p-3 border-t flex-none">
              <div className="flex items-center gap-2 w-full">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={handleSocketTyping}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon" disabled={!messageInput.trim() || !isConnected}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Chat</h3>
              <p className="text-muted-foreground">Select a patient to start chatting</p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  Connection:{" "}
                  <span className={`font-semibold ${isConnected ? "text-green-600" : "text-red-600"}`}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )
      ) : (
        // Regular messaging interface
        <>
          <CardHeader className={`px-4 py-3 border-b flex-none ${isInModal ? "pb-2" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isInModal && (
                  <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} className="p-1 h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedConversation.avatar || "/placeholder.svg"}
                    alt={selectedConversation.name}
                  />
                  <AvatarFallback>
                    {selectedConversation.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {selectedConversation.online ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                        Online
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        Last active: {selectedConversation.time}
                      </>
                    )}
                  </p>
                </div>
              </div>
              {!isInModal && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className={`flex-1 overflow-auto p-4 space-y-4 ${isInModal ? "max-h-[60vh]" : ""}`}>
            {messageThreadData.map((message) => (
              <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.isMe ? "flex-row-reverse" : ""}`}>
                  {!message.isMe && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.sender} />
                      <AvatarFallback>
                        {message.sender
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.isMe ? "bg-primary text-primary-foreground" : "bg-muted border"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-1">{message.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="p-3 border-t flex-none">
            <div className="flex items-center gap-2 w-full">
              <Input
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </>
  )

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            {/* <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Message
            </Button> */}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Message</DialogTitle>
              <DialogDescription>Send a secure message to a patient or healthcare team member.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateNewMessage)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient</FormLabel>
                      <FormControl>
                        <Input placeholder="Search for a patient or colleague..." {...field} />
                      </FormControl>
                      <FormDescription>Enter name or ID of the recipient</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Message subject..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Type your message here..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Send Message</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-12"}`}>
        {/* Conversations List */}
        <Card className={`${isMobile ? "w-full" : "md:col-span-4"} flex flex-col`}>
          <CardHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {activeTab === "doctor" ? patients.length : filterConversations(activeTab).length}
                </Badge>
                {activeTab === "doctor" && (
                  <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
                )}
              </div>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-8" />
            </div>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-3">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="patient">Patients</TabsTrigger>
                <TabsTrigger value="doctor">Team</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="flex-1 overflow-auto p-0 max-h-[55vh]">
              <TabsContent value="all" className="m-0 p-0 h-full">
                <div className="space-y-0 divide-y">
                  {filterConversations("all").map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedConversation.id === conversation.id && !isMobile ? "bg-muted/50" : ""
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                            <AvatarFallback>
                              {conversation.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.name}</p>
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{conversation.time}</p>
                              {conversation.unread > 0 && (
                                <Badge
                                  variant="default"
                                  className="h-5 w-5 rounded-full p-0 flex items-center justify-center"
                                >
                                  {conversation.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="patient" className="m-0 p-0 h-full">
                <div className="space-y-0 divide-y">
                  {filterConversations("patient").map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedConversation.id === conversation.id && !isMobile ? "bg-muted/50" : ""
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                            <AvatarFallback>
                              {conversation.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.name}</p>
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{conversation.time}</p>
                              {conversation.unread > 0 && (
                                <Badge
                                  variant="default"
                                  className="h-5 w-5 rounded-full p-0 flex items-center justify-center"
                                >
                                  {conversation.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="doctor" className="m-0 p-0 h-full">
                <div className="space-y-0 divide-y">
                  {patients.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      Loading patients...
                    </div>
                  ) : (
                    patients.map((patient) => {
                      const unreadCount = getUnreadCount(patient.patientId)
                      const isSelected = selectedPatient?.patientId === patient.patientId
                      return (
                        <div
                          key={patient.patientId}
                          onClick={() => handlePatientSelect(patient)}
                          className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors relative ${
                            isSelected && !isMobile ? "bg-muted/50 border-l-4 border-l-blue-500" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {patient.firstname[0]}
                                {patient.lastname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">
                                  {patient.firstname} {patient.lastname}
                                </p>
                                <div className="flex items-center gap-1">
                                  {unreadCount > 0 && !isSelected && (
                                    <Badge
                                      variant="default"
                                      className="h-5 w-5 rounded-full p-0 flex items-center justify-center animate-pulse"
                                    >
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">ID: {patient.patientId}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Chat Interface - Desktop */}
        {!isMobile && (
          <Card className="md:col-span-8 flex flex-col overflow-hidden">
            <ChatInterface />
          </Card>
        )}
      </div>

      {/* Mobile Chat Modal */}
      {isMobile && (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="sm:max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] p-0 gap-0">
            <div className="flex flex-col h-full">
              <ChatInterface isInModal={true} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default Messages
