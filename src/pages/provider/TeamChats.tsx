

import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { getAllPatientsAPI } from "@/services/operations/patient";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

// Simple components
const Input = ({ value, onChange, placeholder, className, onKeyDown }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    onKeyDown={onKeyDown}
  />
);

const Button = ({ onClick, children, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 h-10 px-4 py-2 ${className}`}
  >
    {children}
  </button>
);

export default function TeamChats() {
  // State
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 🔥 FIXED: Proper unread message tracking
  const [unreadMessagesByPatient, setUnreadMessagesByPatient] = useState({}); // { patientId: [messages] }
  const [patientConversationMap, setPatientConversationMap] = useState({}); // { patientId: conversationId }
  const [conversationPatientMap, setConversationPatientMap] = useState({}); // { conversationId: patientId }

  // Refs
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);
  const currentConversationRef = useRef(null);
  const selectedPatientRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_APP_SOCKET_URL;

  // Redux
  const { user, token } = useSelector((state: RootState) => state.auth);
  const CURRENT_DOCTOR_ID = user?.id;

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Initialize socket connection ONCE
  useEffect(() => {
    if (!CURRENT_DOCTOR_ID || isInitializedRef.current) return;

    // console.log(
    //   "🔌 Initializing socket connection for user:",
    //   CURRENT_DOCTOR_ID
    // );
    isInitializedRef.current = true;

    // Create socket connection
    const socket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      // console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
      socket.emit("registerUser", CURRENT_DOCTOR_ID);
      // console.log("👤 Registered user:", CURRENT_DOCTOR_ID);
    });

    socket.on("disconnect", (reason) => {
      // console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      // console.error("❌ Connection error:", error);
      setIsConnected(false);
    });

    // 🔥 FIXED: Message events with proper patient-specific unread tracking
    socket.on("receiveMessage", (message) => {
      // console.log("📨 Received message:", message);
      // console.log("🔍 Current conversation:", currentConversationRef.current);
      // console.log("🔍 Message conversation:", message.conversation_id);
      // console.log("🔍 Message sender:", message.sender_id);

      // Find which patient sent this message
      const senderPatientId = message.sender_id;
      // console.log("👤 Message from patient:", senderPatientId);

      // 🔥 Only add message if it belongs to the current conversation
      if (message.conversation_id === currentConversationRef.current) {
        // console.log(
        //   "✅ Message belongs to current conversation - adding to UI"
        // );

        setMessages((prev) => {
          // Check if message already exists
          if (prev.some((msg) => msg.id === message.id)) {
            // console.log("⚠️ Duplicate message ignored:", message.id);
            return prev;
          }

          const newMessage = {
            ...message,
            isMe: message.sender_id === CURRENT_DOCTOR_ID,
          };

          scrollToBottom();
          return [...prev, newMessage];
        });
      } else {
        // console.log(
        //   "⚠️ Message belongs to different conversation - storing as unread for patient:",
        //   senderPatientId
        // );

        // 🔥 Store unread message for the specific patient who sent it
        setUnreadMessagesByPatient((prev) => {
          const currentUnread = prev[senderPatientId] || [];

          // Check if message already exists in unread
          if (currentUnread.some((msg) => msg.id === message.id)) {
            // console.log("⚠️ Duplicate unread message ignored:", message.id);
            return prev;
          }

          // console.log(
          //   `📬 Adding unread message for patient ${senderPatientId}`
          // );
          return {
            ...prev,
            [senderPatientId]: [...currentUnread, message],
          };
        });

        // Update conversation mapping
        setConversationPatientMap((prev) => ({
          ...prev,
          [message.conversation_id]: senderPatientId,
        }));

        setPatientConversationMap((prev) => ({
          ...prev,
          [senderPatientId]: message.conversation_id,
        }));
      }
    });

    socket.on("messageSentConfirmation", (message) => {
      // console.log("✅ Message sent confirmation:", message);

      // Only update if it's for the current conversation
      if (message.conversation_id === currentConversationRef.current) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.tempId === message.tempId || msg.id === message.id) {
              return { ...msg, ...message, isMe: true };
            }
            return msg;
          })
        );
        scrollToBottom();
      }
    });

    // Conversation events
    socket.on(
      "conversationJoined",
      ({ conversationId, senderId, receiverId }) => {
        // console.log(
        //   "🏠 Conversation joined:",
        //   conversationId,
        //   "between",
        //   senderId,
        //   "and",
        //   receiverId
        // );

        // Update refs immediately
        currentConversationRef.current = conversationId;

        // Update state
        setCurrentConversationId(conversationId);
        setMessages([]); // Clear previous messages
        setIsLoadingHistory(true);

        // Clear typing users for new conversation
        setTypingUsers({});

        // 🔥 Update conversation mappings
        const patientId = receiverId; // receiverId is the patient
        setPatientConversationMap((prev) => ({
          ...prev,
          [patientId]: conversationId,
        }));

        setConversationPatientMap((prev) => ({
          ...prev,
          [conversationId]: patientId,
        }));

        // 🔥 Clear unread messages for this patient since we're opening their conversation
        // console.log(`🧹 Clearing unread messages for patient: ${patientId}`);
        setUnreadMessagesByPatient((prev) => {
          const newUnread = { ...prev };
          delete newUnread[patientId];
          return newUnread;
        });

        // Request conversation history
        // console.log("📚 Requesting conversation history for:", conversationId);
        socket.emit("getConversationHistory", {
          conversationId,
          userId: CURRENT_DOCTOR_ID,
        });
      }
    );

    socket.on(
      "conversationHistory",
      ({ conversationId, messages: historyMessages }) => {
        // console.log(
        //   "📚 Received conversation history:",
        //   historyMessages.length,
        //   "messages for conversation:",
        //   conversationId
        // );

        // Use ref for immediate comparison
        if (conversationId === currentConversationRef.current) {
          const formattedMessages = historyMessages.map((msg) => ({
            ...msg,
            isMe: msg.sender_id === CURRENT_DOCTOR_ID,
          }));

          // console.log(
          //   "✅ Setting messages in state:",
          //   formattedMessages.length
          // );
          setMessages(formattedMessages);
          setIsLoadingHistory(false);
          scrollToBottom();
        } else {
          // console.log(
          //   "⚠️ Ignoring history for different conversation:",
          //   conversationId,
          //   "vs",
          //   currentConversationRef.current
          // );
        }
      }
    );

    // Typing events with conversation filtering
    socket.on("displayTyping", ({ userId, conversationId }) => {
      // console.log(
      //   "⌨️ User typing:",
      //   userId,
      //   "in conversation:",
      //   conversationId
      // );

      // Only show typing indicator if it's for the current conversation
      if (
        userId !== CURRENT_DOCTOR_ID &&
        conversationId === currentConversationRef.current
      ) {
        // console.log("✅ Showing typing indicator for current conversation");
        setTypingUsers((prev) => ({ ...prev, [userId]: true }));
      } else {
        // console.log("⚠️ Ignoring typing indicator for different conversation");
      }
    });

    socket.on("removeTyping", ({ userId, conversationId }) => {
      // console.log("⌨️ User stopped typing:", userId);

      // Only remove typing indicator if it's for the current conversation
      if (conversationId === currentConversationRef.current) {
        setTypingUsers((prev) => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      }
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // Cleanup function
    return () => {
      // console.log("🧹 Component unmounting - cleaning up socket");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
      isInitializedRef.current = false;
      currentConversationRef.current = null;
      selectedPatientRef.current = null;
    };
  }, [CURRENT_DOCTOR_ID, scrollToBottom]);

  useEffect(() => {
    // console.log("📥 Typing users updated:", typingUsers);
    // console.log("getTypingUserName():", getTypingUserName());
  }, [typingUsers]);
  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // console.log("👥 Fetching patients...");

        if (token) {
          const res = await getAllPatientsAPI(1, token, "");
          if (res?.data) {
            setPatients(res.data);
            // console.log("✅ Patients loaded:", res.data.length);
          }
        } else {
          // Mock data for testing
          const mockPatients = [
            { patientId: "patient_001", firstname: "Alice", lastname: "Smith" },
            { patientId: "patient_002", firstname: "Bob", lastname: "Johnson" },
            {
              patientId: "patient_003",
              firstname: "Charlie",
              lastname: "Brown",
            },
          ];
          setPatients(mockPatients);
          // console.log("👥 Using mock patients:", mockPatients.length);
        }
      } catch (error) {
        console.error("❌ Failed to fetch patients:", error);
      }
    };

    fetchPatients();
  }, [token]);

  // Handle patient selection
  const handlePatientSelect = useCallback(
    (patient) => {
      if (!socketRef.current || !socketRef.current.connected) {
        console.warn("❌ Socket not connected, cannot select patient");
        return;
      }

      // console.log(
      //   "👤 Selecting patient:",
      //   patient.firstname,
      //   patient.lastname,
      //   "ID:",
      //   patient.patientId
      // );

      // Update selected patient ref
      selectedPatientRef.current = patient;

      // Update selected patient state
      setSelectedPatient(patient);

      // Clear current state
      setMessages([]);
      setTypingUsers({});

      // Reset conversation tracking
      setCurrentConversationId(null);
      currentConversationRef.current = null;

      setIsLoadingHistory(true);

      // // Join conversation
      // console.log(
      //   "🏠 Joining conversation between:",
      //   CURRENT_DOCTOR_ID,
      //   "and",
      //   patient.patientId
      // );
      socketRef.current.emit("joinConversation", {
        senderId: CURRENT_DOCTOR_ID,
        receiverId: patient.patientId,
      });
    },
    [CURRENT_DOCTOR_ID]
  );

  // Send message
  const handleSendMessage = useCallback(() => {
    if (
      !messageInput.trim() ||
      !selectedPatient ||
      !socketRef.current?.connected
    ) {
      console.warn("❌ Cannot send message - missing requirements");
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const messageData = {
      tempId,
      sender_id: CURRENT_DOCTOR_ID,
      receiver_id: selectedPatient.patientId,
      message: messageInput.trim(),
      created_at: new Date().toISOString(),
      isMe: true,
      conversation_id: currentConversationRef.current,
    };

    // console.log(
    //   "📤 Sending message:",
    //   messageData.message,
    //   "to conversation:",
    //   currentConversationRef.current
    // );

    // Add optimistic message
    setMessages((prev) => [...prev, messageData]);
    setMessageInput("");
    scrollToBottom();

    // Send to server
    socketRef.current.emit("sendMessage", {
      sender_id: CURRENT_DOCTOR_ID,
      receiver_id: selectedPatient.patientId,
      message: messageInput.trim(),
      tempId,
    });
  }, [messageInput, selectedPatient, CURRENT_DOCTOR_ID, scrollToBottom]);

  // Handle typing
  const handleTyping = useCallback(
    (e) => {
      setMessageInput(e.target.value);

      if (!currentConversationRef.current || !socketRef.current?.connected) {
        return;
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing event
      socketRef.current.emit("typing", {
        conversationId: currentConversationRef.current,
        userId: CURRENT_DOCTOR_ID,
      });

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit("stopTyping", {
            conversationId: currentConversationRef.current,
            userId: CURRENT_DOCTOR_ID,
          });
        }
      }, 1500);
    },
    [CURRENT_DOCTOR_ID]
  );

  // Handle Enter key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Get typing user name

  const getTypingUserName = useCallback(() => {
    const typingUserIds = Object.keys(typingUsers);
    if (typingUserIds.length === 0) return "";

    const typingId = typingUserIds[0];

    if (typingId === CURRENT_DOCTOR_ID) {
      return user?.firstname ? `${user.firstname} ${user.lastname}` : "You";
    }

    const typingPatient = patients.find((p) => `${p.patientId}` === typingId); // 🔁 Ensure string comparison
    return typingPatient
      ? `${typingPatient.firstname} ${typingPatient.lastname}`
      : "Someone";
  }, [typingUsers, patients, CURRENT_DOCTOR_ID, user]);

  // 🔥 FIXED: Get unread count for a specific patient
  const getUnreadCount = useCallback(
    (patientId) => {
      const unreadMessages = unreadMessagesByPatient[patientId] || [];
      const count = unreadMessages.length;

      if (count > 0) {
        // console.log(`📊 Patient ${patientId} has ${count} unread messages`);
      }

      return count;
    },
    [unreadMessagesByPatient]
  );

  if (!CURRENT_DOCTOR_ID) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Team Chats</h2>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <span className="text-sm">
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <p className="text-sm opacity-80 mt-1">
            Doctor ID: {CURRENT_DOCTOR_ID}
          </p>
          {currentConversationId && (
            <p className="text-xs opacity-70">
              Conversation: {currentConversationId}
            </p>
          )}
        </div>

        {/* Patients List */}
        <div className="flex-1 overflow-y-auto">
          {patients.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Loading patients...
            </div>
          ) : (
            patients.map((patient) => {
              const unreadCount = getUnreadCount(patient.patientId);
              const isSelected =
                selectedPatient?.patientId === patient.patientId;

              return (
                <div
                  key={patient.patientId}
                  onClick={() => handlePatientSelect(patient)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors relative ${
                    isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {patient.firstname} {patient.lastname}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {patient.patientId}
                  </div>

                  {/* 🔥 FIXED: Unread message indicator - only show for patients with unread messages */}
                  {unreadCount > 0 && !isSelected && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                      {unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs">
            <p className="font-semibold">Debug Info:</p>
            <p>
              Unread Messages:{" "}
              {JSON.stringify(
                Object.keys(unreadMessagesByPatient).reduce(
                  (acc, patientId) => {
                    acc[patientId] = unreadMessagesByPatient[patientId].length;
                    return acc;
                  },
                  {}
                )
              )}
            </p>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedPatient ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedPatient.firstname} {selectedPatient.lastname}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Patient ID: {selectedPatient.patientId}
                  </p>
                  {currentConversationId && (
                    <p className="text-xs text-gray-400">
                      Conversation: {currentConversationId}
                    </p>
                  )}
                </div>

                {/* Typing Indicator */}
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
                    <span className="text-sm">
                      {getTypingUserName()} is typing...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading chat history...</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Conversation: {currentConversationId || "Connecting..."}
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id || message.tempId || index}
                    className={`flex ${
                      message.isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm break-words">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isMe ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <Input
                  value={messageInput}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyDown={handleKeyDown}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                  className="px-6"
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Team Chat
              </h3>
              <p className="text-gray-500">
                Select a patient from the sidebar to start chatting
              </p>
              <div className="mt-4 text-sm text-gray-400">
                <p>
                  Connection:{" "}
                  <span
                    className={`font-semibold ${
                      isConnected ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </p>
                <p>Doctor ID: {CURRENT_DOCTOR_ID}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
