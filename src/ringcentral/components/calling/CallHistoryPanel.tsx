"use client"

import  React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Card,
  List,
  Typography,
  Tag,
  Space,
  Button,
  Spin,
  Empty,
  Tooltip,
  Badge,
  Divider,
  Modal,
  Descriptions,
} from "antd"
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Download,
  RefreshCw,
  Volume2,
  FileAudio,
  MapPin,
  DollarSign,
} from "lucide-react"

import { ringCentralStore, type CallHistoryRecord } from "../../store/ringcentral"

const { Text, Title } = Typography

interface Props {
  patientPhone?: string
  showAll?: boolean
}

const CallHistoryPanel: React.FC<Props> = ({ patientPhone, showAll = false }) => {
  const [callHistory, setCallHistory] = useState<CallHistoryRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCall, setSelectedCall] = useState<CallHistoryRecord | null>(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateCallHistory = () => {
      if (patientPhone && !showAll) {
        // Filter for specific patient
        const filtered = ringCentralStore.getCallHistoryForNumber(patientPhone)
        setCallHistory(filtered)
      } else {
        // Show all call history
        setCallHistory(ringCentralStore.callHistory)
      }

      setLoading(ringCentralStore.callHistoryLoading)
      setHasMore(ringCentralStore.hasMoreCallHistory)
    }

    updateCallHistory()
    const unsubscribe = ringCentralStore.subscribe(updateCallHistory)

    return () => {
      unsubscribe()
    }
  }, [patientPhone, showAll])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

    // Load more when scrolled to 80% of the content
    if (scrollHeight - scrollTop <= clientHeight * 1.2 && hasMore && !loading) {
      ringCentralStore.loadMoreCallHistory()
    }
  }

  const handleRefresh = () => {
    ringCentralStore.refreshCallHistory()
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "0s"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getCallIcon = (call: CallHistoryRecord) => {
    if (call.result === "Missed") {
      return <PhoneMissed size={16} style={{ color: "#ff4d4f" }} />
    } else if (call.direction === "Inbound") {
      return <PhoneIncoming size={16} style={{ color: "#52c41a" }} />
    } else {
      return <PhoneOutgoing size={16} style={{ color: "#1890ff" }} />
    }
  }

  const getCallStatusColor = (result: string) => {
    switch (result) {
      case "Completed":
        return "green"
      case "Missed":
        return "red"
      case "Voicemail":
        return "orange"
      case "Busy":
        return "volcano"
      case "No Answer":
        return "gold"
      default:
        return "default"
    }
  }

  const handleDownloadRecording = async (recordingId: string) => {
    const url = await ringCentralStore.downloadRecording(recordingId)
    if (url) {
      window.open(url, "_blank")
    }
  }

  const showCallDetails = (call: CallHistoryRecord) => {
    setSelectedCall(call)
    setDetailsModalVisible(true)
  }

  const renderCallItem = (call: CallHistoryRecord) => {
    const phoneNumber = call.direction === "Inbound" ? call.from?.phoneNumber : call.to?.phoneNumber
    const contactName = call.direction === "Inbound" ? call.from?.name : call.to?.name
    const location = call.direction === "Inbound" ? call.from?.location : call.to?.location

    return (
      <List.Item
        key={call.id}
        style={{
          cursor: "pointer",
          padding: "12px 16px",
          borderRadius: "8px",
          margin: "4px 0",
          background: "#fafafa",
          border: "1px solid #f0f0f0",
        }}
        onClick={() => showCallDetails(call)}
        actions={[
          call.recording && (
            <Tooltip title="Download Recording">
              <Button
                type="text"
                size="small"
                icon={<Download size={14} />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadRecording(call.recording!.id)
                }}
              />
            </Tooltip>
          ),
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {getCallIcon(call)}
              {call.recording && (
                <Badge dot color="#ff4d4f">
                  <FileAudio size={14} style={{ color: "#666" }} />
                </Badge>
              )}
            </div>
          }
          title={
            <Space>
              <Text strong>{contactName || phoneNumber || "Unknown"}</Text>
              <Tag color={getCallStatusColor(call.result)}>
                {call.result}
              </Tag>
              {call.recording && (
                <Tag color="red" icon={<Volume2 size={10} />}>
                  REC
                </Tag>
              )}
            </Space>
          }
          description={
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space>
                <Clock size={12} />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {formatDate(call.startTime)}
                </Text>
                {call.duration > 0 && (
                  <>
                    <Divider type="vertical" />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Duration: {formatDuration(call.duration)}
                    </Text>
                  </>
                )}
              </Space>

              {call.recording && (
                <Space>
                  <FileAudio size={12} style={{ color: "#ff4d4f" }} />
                  <Text type="secondary" style={{ fontSize: "12px", color: "#ff4d4f" }}>
                    Recording: {call.recording.duration ? formatDuration(call.recording.duration) : "Available"}
                  </Text>
                </Space>
              )}

              {location && (
                <Space>
                  <MapPin size={12} />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {location}
                  </Text>
                </Space>
              )}

              <Space>
                <Tag>{call.type}</Tag>
                <Tag>{call.transport}</Tag>
                {call.action !== "Phone Call" && (
                  <Tag color="blue">
                    {call.action}
                  </Tag>
                )}
              </Space>
            </Space>
          }
        />
      </List.Item>
    )
  }

  return (
    <>
      <Card
        title={
          <Space>
            <Clock size={16} />
            <span>{showAll ? "All Call History" : "Call History"}</span>
            {callHistory.length > 0 && <Badge count={callHistory.length} style={{ backgroundColor: "#52c41a" }} />}
          </Space>
        }
        extra={
          <Button type="text" icon={<RefreshCw size={14} />} onClick={handleRefresh} loading={loading} size="small">
            Refresh
          </Button>
        }
        style={{ height: showAll ? "70vh" : "400px" }}
        bodyStyle={{ padding: 0, height: "calc(100% - 57px)", overflow: "hidden" }}
      >
        <div
          ref={listRef}
          style={{
            height: "100%",
            overflowY: "auto",
            padding: "8px",
          }}
          onScroll={handleScroll}
        >
          {callHistory.length > 0 ? (
            <>
              <List dataSource={callHistory} renderItem={renderCallItem} split={false} />

              {loading && (
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <Spin size="small" />
                  <Text type="secondary" style={{ marginLeft: "8px" }}>
                    Loading more calls...
                  </Text>
                </div>
              )}

              {!hasMore && callHistory.length > 0 && (
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <Text type="secondary">No more call history</Text>
                </div>
              )}
            </>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px" }}>
                <Text>Loading call history...</Text>
              </div>
            </div>
          ) : (
            <Empty
              description="No call history found"
              style={{ padding: "40px" }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Card>

      {/* Call Details Modal */}
      <Modal
        title="Call Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          selectedCall?.recording && (
            <Button
              key="download"
              type="primary"
              icon={<Download size={14} />}
              onClick={() => {
                if (selectedCall?.recording) {
                  handleDownloadRecording(selectedCall.recording.id)
                }
              }}
            >
              Download Recording
            </Button>
          ),
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
        ].filter(Boolean)}
        width={600}
      >
        {selectedCall && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Direction" span={1}>
              <Space>
                {getCallIcon(selectedCall)}
                {selectedCall.direction}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={1}>
              <Tag color={getCallStatusColor(selectedCall.result)}>{selectedCall.result}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="From" span={1}>
              <Space direction="vertical" size="small">
                <Text>{selectedCall.from?.phoneNumber || "Unknown"}</Text>
                {selectedCall.from?.name && <Text type="secondary">{selectedCall.from.name}</Text>}
                {selectedCall.from?.location && (
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    📍 {selectedCall.from.location}
                  </Text>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="To" span={1}>
              <Space direction="vertical" size="small">
                <Text>{selectedCall.to?.phoneNumber || "Unknown"}</Text>
                {selectedCall.to?.name && <Text type="secondary">{selectedCall.to.name}</Text>}
                {selectedCall.to?.location && (
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    📍 {selectedCall.to.location}
                  </Text>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Start Time" span={1}>
              <Space direction="vertical" size="small">
                <Text>{new Date(selectedCall.startTime).toLocaleString()}</Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {formatDate(selectedCall.startTime)}
                </Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Duration" span={1}>
              <Text>{formatDuration(selectedCall.duration)}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Type" span={1}>
              <Tag>{selectedCall.type}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Transport" span={1}>
              <Tag>{selectedCall.transport}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Action" span={2}>
              <Tag color="blue">{selectedCall.action}</Tag>
            </Descriptions.Item>

            {selectedCall.recording && (
              <>
                <Descriptions.Item label="Recording" span={2}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Space>
                      <FileAudio size={16} style={{ color: "#ff4d4f" }} />
                      <Text strong style={{ color: "#ff4d4f" }}>
                        Recording Available
                      </Text>
                      <Tag color="red">{selectedCall.recording.type}</Tag>
                    </Space>
                    {selectedCall.recording.duration && (
                      <Text type="secondary">Duration: {formatDuration(selectedCall.recording.duration)}</Text>
                    )}
                  </Space>
                </Descriptions.Item>
              </>
            )}

            {selectedCall.billing && (
              <Descriptions.Item label="Billing" span={2}>
                <Space>
                  <DollarSign size={14} />
                  {selectedCall.billing.costIncluded && <Text>Included: ${selectedCall.billing.costIncluded}</Text>}
                  {selectedCall.billing.costPurchased && <Text>Purchased: ${selectedCall.billing.costPurchased}</Text>}
                </Space>
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Session ID" span={2}>
              <Text code style={{ fontSize: "11px" }}>
                {selectedCall.sessionId}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}

export default CallHistoryPanel
