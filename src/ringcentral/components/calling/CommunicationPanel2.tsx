

import React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Divider,
  Badge,
  Alert,
  Spin,
  Statistic,
  Row,
  Col,
  Tabs,
} from "antd";
import {
  Phone,
  MessageCircle,
  Video,
  Clock,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Bug,
  FileAudio,
  History,
} from "lucide-react";

import { ringCentralStore } from "../../store/ringcentral";
import type { Patient } from "../../types";
import CallHistoryPanel from "./CallHistoryPanel";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Props {
  patient: Patient;
}

const CommunicationPanel2: React.FC<Props> = ({ patient }) => {
  // Early return if patient is not provided
  if (!patient) {
    return (
      <Card title="Communication">
        <Alert
          message="Patient data not available"
          description="Unable to load communication panel without patient information."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeCalls, setActiveCalls] = useState([]);
  const [tokenExpiry, setTokenExpiry] = useState("Not logged in");
  const [callStats, setCallStats] = useState({
    total: 0,
    incoming: 0,
    outgoing: 0,
    missed: 0,
    withRecording: 0,
  });
  const [initComplete, setInitComplete] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const newIsLoggedIn = ringCentralStore.isLoggedIn;
      const newIsConnected = ringCentralStore.isConnected;

      // console.log("🔄 CommunicationPanel state update:");
      // console.log("  - isLoggedIn:", newIsLoggedIn);
      // console.log("  - isConnected:", newIsConnected);
      // console.log("  - initComplete:", ringCentralStore.initializationComplete);

      setIsConnected(newIsConnected);
      setIsLoggedIn(newIsLoggedIn);
      setActiveCalls(ringCentralStore.activeCalls || []);
      setTokenExpiry(ringCentralStore.tokenExpiryFormatted);
      setCallStats(ringCentralStore.getCallStats());
      setInitComplete(ringCentralStore.initializationComplete);
    };

    updateStatus();
    const unsubscribe = ringCentralStore.subscribe(updateStatus);
    const interval = setInterval(updateStatus, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleVoiceCall = async () => {
    // console.log("📞 Voice call button clicked");
    // console.log("  - isLoggedIn:", isLoggedIn);
    // console.log("  - isConnected:", isConnected);

    if (!isLoggedIn) {
      globalThis.notifier?.error({
        message: "Not Logged In",
        description:
          "Please click 'Login & Connect' in the header to start making calls",
      });
      return;
    }

    if (!isConnected) {
      globalThis.notifier?.error({
        message: "Not Connected",
        description: "Please connect to RingCentral first",
      });
      return;
    }

    if (isCallInProgress) {
      globalThis.notifier?.warning({
        message: "Call in Progress",
        description: "Please wait for the current call to complete",
      });
      return;
    }

    try {
      setIsCallInProgress(true);

      globalThis.notifier?.info({
        message: "Initiating Call...",
        description: `Calling ${patient.name} at ${patient.phone}`,
      });

      console.log(
        "📞 Starting call to:",
        patient.phone,
        "for patient:",
        patient.name
      );
      await ringCentralStore.makeCall(patient.phone, patient.name);

      setTimeout(() => {
        setIsCallInProgress(false);
      }, 3000);
    } catch (error) {
      console.error("❌ Call initiation failed:", error);
      setIsCallInProgress(false);
      globalThis.notifier?.error({
        message: "Call Failed",
        description: "Failed to initiate call. Please try again.",
      });
    }
  };

  const handleVideoCall = () => {
    globalThis.notifier?.info({
      message: "Video Call",
      description: "Video calling feature coming soon!",
    });
  };

  const handleMessage = () => {
    globalThis.notifier?.info({
      message: "Messaging",
      description: "Messaging feature coming soon!",
    });
  };

  const handleDebug = () => {
    ringCentralStore.debugState();
    globalThis.notifier?.info({
      message: "Debug Info",
      description: "Check console for detailed state information",
    });
  };

  // Show loading state during initialization
  if (!initComplete) {
    return (
      <Card title="Communication">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text>Initializing RingCentral...</Text>
          </div>
        </div>
      </Card>
    );
  }

  // Check for active call with this patient
  const activeCall = activeCalls.find((session) => {
    const sessionPhone = session.remoteNumber.replace(/\D/g, "");
    const patientPhone = patient.phone.replace(/\D/g, "");
    return (
      sessionPhone.includes(patientPhone) || patientPhone.includes(sessionPhone)
    );
  });

  const hasActiveCalls = activeCalls.length > 0;

  // Get call statistics for this patient
  const patientCallHistory = ringCentralStore.getCallHistoryForNumber(
    patient.phone
  );
  const patientStats = {
    total: patientCallHistory.length,
    incoming: patientCallHistory.filter((c) => c.direction === "Inbound")
      .length,
    outgoing: patientCallHistory.filter((c) => c.direction === "Outbound")
      .length,
    missed: patientCallHistory.filter((c) => c.result === "Missed").length,
    withRecording: patientCallHistory.filter((c) => !!c.recording).length,
  };

  return (
    <Card title="Communication">
      <Space direction="vertical" style={{ width: "100%" }}>
        {/* Connection Status */}
        <div style={{ textAlign: "center", padding: "8px" }}>
          <Space direction="vertical" size="small">
            <Badge
              status={
                isConnected ? "success" : isLoggedIn ? "warning" : "error"
              }
              text={
                isConnected
                  ? "RingCentral Connected"
                  : isLoggedIn
                  ? "Logged In (Disconnected)"
                  : "Not Logged In"
              }
            />

            {isLoggedIn && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <Clock size={12} />
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  {tokenExpiry}
                </Text>
              </div>
            )}

            {hasActiveCalls && (
              <Badge
                count={activeCalls.length}
                style={{ backgroundColor: "#52c41a" }}
              >
                <Text>Active Calls</Text>
              </Badge>
            )}
          </Space>
        </div>

        <Divider />

        {/* Tabbed Interface */}
        <Tabs defaultActiveKey="stats" size="small">
          <TabPane
            tab={
              <Space>
                <PhoneCall size={14} />
                Statistics
              </Space>
            }
            key="stats"
          >
            {/* Call Statistics for this Patient */}
            <div>
              <Title level={5}>Call Statistics for {patient.name}</Title>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total"
                    value={patientStats.total}
                    prefix={<PhoneCall size={16} />}
                    valueStyle={{ fontSize: "16px" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Incoming"
                    value={patientStats.incoming}
                    prefix={<PhoneIncoming size={16} />}
                    valueStyle={{ fontSize: "16px", color: "#52c41a" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Outgoing"
                    value={patientStats.outgoing}
                    prefix={<PhoneOutgoing size={16} />}
                    valueStyle={{ fontSize: "16px", color: "#1890ff" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Missed"
                    value={patientStats.missed}
                    prefix={<PhoneMissed size={16} />}
                    valueStyle={{ fontSize: "16px", color: "#ff4d4f" }}
                  />
                </Col>
              </Row>

              {patientStats.withRecording > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <Statistic
                    title="With Recordings"
                    value={patientStats.withRecording}
                    prefix={<FileAudio size={16} />}
                    valueStyle={{ fontSize: "16px", color: "#ff4d4f" }}
                  />
                </div>
              )}
            </div>

            <Divider />

            {/* Overall Call Statistics */}
            <div>
              <Title level={5}>Overall Statistics</Title>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Calls"
                    value={callStats.total}
                    valueStyle={{ fontSize: "14px" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Incoming"
                    value={callStats.incoming}
                    valueStyle={{ fontSize: "14px", color: "#52c41a" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Outgoing"
                    value={callStats.outgoing}
                    valueStyle={{ fontSize: "14px", color: "#1890ff" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Missed"
                    value={callStats.missed}
                    valueStyle={{ fontSize: "14px", color: "#ff4d4f" }}
                  />
                </Col>
              </Row>

              {callStats.withRecording > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="Recordings"
                        value={callStats.withRecording}
                        valueStyle={{ fontSize: "14px", color: "#ff4d4f" }}
                        prefix={<FileAudio size={14} />}
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </div>
          </TabPane>

          <TabPane
            tab={
              <Space>
                <History size={14} />
                Call History
                {patientStats.total > 0 && (
                  <Badge count={patientStats.total} size="small" />
                )}
              </Space>
            }
            key="history"
          >
            <CallHistoryPanel patientPhone={patient.phone} />
          </TabPane>
        </Tabs>

        <Divider />

        {/* Emergency Contact */}
        <div>
          <Title level={5}>Emergency Contact</Title>
          <Space direction="vertical">
            <Text strong>{patient.emergencyContact.name}</Text>
            <Text>{patient.emergencyContact.phone}</Text>
            <Text type="secondary">{patient.emergencyContact.relation}</Text>
            <Button
              size="small"
              icon={<Phone size={14} />}
              onClick={() =>
                ringCentralStore.makeCall(
                  patient.emergencyContact.phone,
                  patient.emergencyContact.name
                )
              }
              disabled={!isLoggedIn || !isConnected || isCallInProgress}
              danger
            >
              Call Emergency Contact
            </Button>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default CommunicationPanel2;
