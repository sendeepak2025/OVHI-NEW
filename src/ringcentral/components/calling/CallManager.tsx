

import React from "react";
import { useState, useEffect } from "react";
import { Card, Button, Space, Typography, Modal, Avatar } from "antd";
import { Phone, PhoneOff, User } from "lucide-react";

import { ringCentralStore } from "../../store/ringcentral";

import { getSinglePatientByNumberAPI } from "@/services/operations/patient";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const { Text, Title } = Typography;

const CallManager: React.FC = () => {
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const updateIncomingCalls = () => {
      const activeCalls = ringCentralStore.activeCalls || [];
      const ringingInbound = activeCalls.find(
        (call) => call.direction === "inbound" && call.state === "ringing"
      );
      setIncomingCall(ringingInbound || null);
    };

    updateIncomingCalls();
    const unsubscribe = ringCentralStore.subscribe(updateIncomingCalls);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAnswer = async () => {
    if (incomingCall) {
      try {
        await incomingCall.answer();
        setIncomingCall(null);
      } catch (error) {
        console.error("❌ Failed to answer call:", error);
        globalThis.notifier?.error({
          message: "Answer Failed",
          description: "Failed to answer the call. Please try again.",
        });
      }
    }
  };

  const handleDecline = async () => {
    if (incomingCall) {
      try {
        await incomingCall.decline();
        setIncomingCall(null);
      } catch (error) {
        console.error("❌ Failed to decline call:", error);
        globalThis.notifier?.error({
          message: "Decline Failed",
          description: "Failed to decline the call. Please try again.",
        });
      }
    }
  };

  const findPatientByPhone = async (phoneNumber: string) => {
    try {
  
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    const res = await getSinglePatientByNumberAPI(cleanNumber, token);
    // console.log(res[0]);
    return res[0];
  };



  if (!incomingCall) return null;

  const [patient, setPatient] = React.useState<any>(null);
  
  React.useEffect(() => {
    const loadPatient = async () => {
      if (incomingCall?.remoteNumber) {
        const patientData = await findPatientByPhone(incomingCall.remoteNumber);
        setPatient(patientData);
      }
    };
    loadPatient();
  }, [incomingCall?.remoteNumber]);

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();

    if (birth > today) return 0; // or throw an error if preferred

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <Modal
      title="📞 Incoming Call"
      open={!!incomingCall}
      footer={null}
      closable={false}
      centered
      width={450}
      style={{ zIndex: 2000 }}
    >
      <Card style={{ textAlign: "center" }}>
        <Space
          direction="vertical"
          align="center"
          style={{ width: "100%" }}
          size="large"
        >
          <Avatar
            size={80}
            icon={<User size={40} />}
            style={{ backgroundColor: "#1890ff" }}
          />

          <div>
            <Title level={3} style={{ margin: 0 }}>
              {patient ? patient.firstName : "Unknown Caller"}
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              {incomingCall.remoteNumber}
            </Text>
            {patient && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Patient ID: {patient.patientId}</Text>
                <br />
                <Text type="secondary">
                  Age: calculateAge(patient.birthDate) | {patient.gender}
                </Text>
              </div>
            )}
          </div>

          <Text type="secondary" style={{ fontSize: "14px" }}>
            📞 Incoming call...
          </Text>

          <Space size="large">
            <Button
              type="primary"
              icon={<Phone size={24} />}
              onClick={handleAnswer}
              size="large"
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                height: "60px",
                width: "120px",
                borderRadius: "30px",
              }}
            >
              Answer
            </Button>

            <Button
              danger
              icon={<PhoneOff size={24} />}
              onClick={handleDecline}
              size="large"
              style={{
                height: "60px",
                width: "120px",
                borderRadius: "30px",
              }}
            >
              Decline
            </Button>
          </Space>
        </Space>
      </Card>
    </Modal>
  );
};

export default CallManager;
