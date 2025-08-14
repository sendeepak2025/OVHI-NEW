"use client"

import  React from "react"
import { useState, useEffect } from "react"
import { Card, Button, Space, Tag, Select, Input, Popover, Typography, Alert, Progress, Tooltip } from "antd"
import { Phone, PhoneOff, Mic, MicOff, Pause, Play, Hash, Circle, Square } from "lucide-react"

import type { CallSession } from "../../store/ringcentral"

const { Text } = Typography

interface Props {
  callSession: CallSession
}

const CallSessionComponent: React.FC<Props> = ({ callSession }) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [dtmfPopoverVisible, setDtmfPopoverVisible] = useState(false)
  const [dtmfString, setDtmfString] = useState("")
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const newDevices = await navigator.mediaDevices.enumerateDevices()
        setDevices(newDevices)
      } catch (error) {
        console.error("Error fetching devices:", error)
        setError("Could not access audio devices")
      }
    }

    fetchDevices()
    const handler = setInterval(fetchDevices, 10000)
    return () => clearInterval(handler)
  }, [])

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (callSession?.state === "answered" && callSession.startTime) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - callSession.startTime!) / 1000)
        setCallDuration(duration)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [callSession?.state, callSession?.startTime])

  if (!callSession) {
    return <Alert message="Call Session Error" description="Call session data is not available" type="error" showIcon />
  }

  const getCallTypeColor = () => {
    switch (callSession.state) {
      case "answered":
        return "green"
      case "ringing":
        return "blue"
      case "init":
        return "orange"
      case "hold":
        return "purple"
      case "ended":
        return "default"
      case "failed":
        return "red"
      default:
        return "default"
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAction = async (action: () => Promise<void>, actionName: string) => {
    try {
      setError(null)
      await action()
    } catch (error) {
      console.error(`Error ${actionName}:`, error)
      setError(`Failed to ${actionName}`)
      globalThis.notifier?.error({
        message: `Call Action Failed`,
        description: `Failed to ${actionName}. Please try again.`,
      })
    }
  }

  const dtmfButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "#"],
  ]

  return (
    <Card
      size="small"
      title={
        <Space>
          <span style={{ fontSize: "14px" }}>
            {callSession.direction === "inbound" ? "📞 Incoming" : "📱 Outgoing"}
          </span>
          <Tag color={getCallTypeColor()} style={{ fontSize: "12px" }}>
            {callSession.state}
          </Tag>
          {callSession.patientName && (
            <Tag color="blue" style={{ fontSize: "11px" }}>
              {callSession.patientName}
            </Tag>
          )}
        </Space>
      }
      style={{
        border: `2px solid ${callSession.state === "answered" ? "#52c41a" : "#1890ff"}`,
        borderRadius: "8px",
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        {error && <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />}

        {/* Call Info */}
        <div style={{ textAlign: "center" }}>
          <Text strong style={{ fontSize: "16px" }}>
            {callSession.remoteNumber || "Unknown Number"}
          </Text>
          {callSession.state === "answered" && (
            <div>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                Duration: {formatDuration(callDuration)}
              </Text>
              {callDuration > 0 && (
                <Progress
                  percent={Math.min((callDuration / 3600) * 100, 100)}
                  showInfo={false}
                  size="small"
                  style={{ marginTop: 4 }}
                />
              )}
            </div>
          )}
        </div>

        {/* Call Controls Based on State */}
        {callSession.state === "ringing" && callSession.direction === "inbound" && (
          <Space style={{ width: "100%", justifyContent: "center" }}>
            <Button
              type="primary"
              icon={<Phone size={16} />}
              onClick={() => handleAction(callSession.answer, "answer")}
              size="large"
            >
              Answer
            </Button>
            <Button
              danger
              icon={<PhoneOff size={16} />}
              onClick={() => handleAction(callSession.decline, "decline")}
              size="large"
            >
              Decline
            </Button>
          </Space>
        )}

        {(callSession.state === "answered" || callSession.state === "hold") && (
          <>
            <Space wrap style={{ width: "100%", justifyContent: "center" }}>
              {/* Hangup */}
              <Button danger icon={<PhoneOff size={16} />} onClick={() => handleAction(callSession.hangup, "hang up")}>
                End Call
              </Button>

              {/* Hold/Unhold */}
              <Tooltip title={callSession.isOnHold ? "Resume call" : "Put call on hold"}>
                <Button
                  icon={callSession.isOnHold ? <Play size={16} /> : <Pause size={16} />}
                  onClick={() =>
                    handleAction(
                      callSession.isOnHold ? callSession.unhold : callSession.hold,
                      callSession.isOnHold ? "resume" : "hold",
                    )
                  }
                  type={callSession.isOnHold ? "primary" : "default"}
                >
                  {callSession.isOnHold ? "Resume" : "Hold"}
                </Button>
              </Tooltip>

              {/* Mute/Unmute */}
              <Tooltip title={callSession.isMuted ? "Unmute microphone" : "Mute microphone"}>
                <Button
                  icon={callSession.isMuted ? <Mic size={16} /> : <MicOff size={16} />}
                  onClick={() =>
                    handleAction(
                      callSession.isMuted ? callSession.unmute : callSession.mute,
                      callSession.isMuted ? "unmute" : "mute",
                    )
                  }
                  type={callSession.isMuted ? "primary" : "default"}
                >
                  {callSession.isMuted ? "Unmute" : "Mute"}
                </Button>
              </Tooltip>

              {/* Recording */}
              <Tooltip title={callSession.isRecording ? "Stop recording" : "Start recording"}>
                <Button
                  icon={callSession.isRecording ? <Square size={16} /> : <Circle size={16} />}
                  onClick={() =>
                    handleAction(
                      callSession.isRecording ? callSession.stopRecording : callSession.startRecording,
                      callSession.isRecording ? "stop recording" : "start recording",
                    )
                  }
                  type={callSession.isRecording ? "primary" : "default"}
                  style={{ color: callSession.isRecording ? "#ff4d4f" : undefined }}
                >
                  {/* {callSession.isRecording ? "Stop Rec" : "Record"} */}
                </Button>
              </Tooltip>

              {/* DTMF Keypad */}
              <Popover
                open={dtmfPopoverVisible}
                onOpenChange={(visible) => setDtmfPopoverVisible(visible)}
                trigger="click"
                placement="top"
                content={
                  <Space direction="vertical" style={{ width: 200 }}>
                    <Input
                      placeholder="Enter digits"
                      value={dtmfString}
                      onChange={(e) => setDtmfString(e.target.value.trim())}
                      onPressEnter={() => {
                        if (dtmfString) {
                          handleAction(() => callSession.sendDtmf(dtmfString), "send DTMF")
                          setDtmfString("")
                          setDtmfPopoverVisible(false)
                        }
                      }}
                    />

                    {/* DTMF Button Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
                      {dtmfButtons.flat().map((digit) => (
                        <Button
                          key={digit}
                          size="small"
                          onClick={() => {
                            handleAction(() => callSession.sendDtmf(digit), `send DTMF ${digit}`)
                          }}
                          style={{ minWidth: "40px" }}
                        >
                          {digit}
                        </Button>
                      ))}
                    </div>

                    <Button
                      onClick={() => {
                        if (dtmfString) {
                          handleAction(() => callSession.sendDtmf(dtmfString), "send DTMF")
                          setDtmfString("")
                          setDtmfPopoverVisible(false)
                        }
                      }}
                      block
                      type="primary"
                      disabled={!dtmfString}
                    >
                      Send DTMF
                    </Button>
                  </Space>
                }
              >
                <Button icon={<Hash size={16} />}>Keypad</Button>
              </Popover>
            </Space>

            {/* Audio Device Selection */}
            {callSession.state === "answered" && devices.length > 0 && (
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <div>
                  <Text style={{ fontSize: "12px", color: "#666" }}>🎤 Microphone:</Text>
                  <Select
                    size="small"
                    style={{ width: "100%", marginTop: 4 }}
                    placeholder="Select Microphone"
                    value={callSession.inputDeviceId}
                    onChange={(value) => {
                      handleAction(() => callSession.changeInputDevice(value), "change microphone")
                    }}
                    options={devices
                      .filter((d) => d.kind === "audioinput")
                      .map((d) => ({
                        value: d.deviceId,
                        label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`,
                      }))}
                  />
                </div>

                {devices.filter((d) => d.kind === "audiooutput").length > 0 && (
                  <div>
                    <Text style={{ fontSize: "12px", color: "#666" }}>🔊 Speaker:</Text>
                    <Select
                      size="small"
                      style={{ width: "100%", marginTop: 4 }}
                      placeholder="Select Speaker"
                      value={callSession.outputDeviceId}
                      onChange={(value) => {
                        handleAction(() => callSession.changeOutputDevice(value), "change speaker")
                      }}
                      options={devices
                        .filter((d) => d.kind === "audiooutput")
                        .map((d) => ({
                          value: d.deviceId,
                          label: d.label || `Speaker ${d.deviceId.slice(0, 8)}`,
                        }))}
                    />
                  </div>
                )}
              </Space>
            )}
          </>
        )}

        {/* Call Status Messages */}
        {callSession.state === "init" && (
          <div style={{ textAlign: "center" }}>
            <Text type="secondary">🔄 Initiating call...</Text>
          </div>
        )}

        {callSession.state === "ringing" && callSession.direction === "outbound" && (
          <div style={{ textAlign: "center" }}>
            <Text type="secondary">📞 Ringing...</Text>
          </div>
        )}

        {callSession.isOnHold && (
          <div style={{ textAlign: "center", background: "#fff7e6", padding: "4px", borderRadius: "4px" }}>
            <Text type="warning">⏸️ Call is on hold</Text>
          </div>
        )}

        {callSession.isMuted && (
          <div style={{ textAlign: "center", background: "#f6ffed", padding: "4px", borderRadius: "4px" }}>
            <Text type="success">🔇 Microphone muted</Text>
          </div>
        )}

        {callSession.isRecording && (
          <div style={{ textAlign: "center", background: "#fff1f0", padding: "4px", borderRadius: "4px" }}>
            <Text type="danger">🔴 Recording in progress</Text>
          </div>
        )}
      </Space>
    </Card>
  )
}

export default CallSessionComponent
