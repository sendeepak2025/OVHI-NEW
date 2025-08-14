"use client"

import  React from "react"
import { useEffect, useState } from "react"
import { Card, Typography, Empty } from "antd"

import { ringCentralStore } from "../../store/ringcentral"
import CallSessionComponent from "./CallSession"

const { Title } = Typography

const ActiveCallsPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeCalls, setActiveCalls] = useState(ringCentralStore.activeCalls || [])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const updateStatus = () => {
      const connected = ringCentralStore.isConnected
      const calls = ringCentralStore.activeCalls || []

      setIsConnected(connected)
      setActiveCalls(calls)
      setIsVisible(connected && calls.length > 0)

    }

    updateStatus()
    const unsubscribe = ringCentralStore.subscribe(updateStatus)
    const interval = setInterval(updateStatus, 1000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 450,
        maxHeight: "70vh",
        overflow: "auto",
        zIndex: 1000,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        backgroundColor: "white",
      }}
    >
      <Card
        title={
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            📞 Active Calls ({activeCalls.length})
          </Title>
        }
        style={{ margin: 0 }}
      >
        {activeCalls.length > 0 ? (
          activeCalls.map((callSession, index) => (
            <div key={callSession.callId || index} style={{ marginBottom: index < activeCalls.length - 1 ? 16 : 0 }}>
              <CallSessionComponent callSession={callSession} />
            </div>
          ))
        ) : (
          <Empty description="No active calls" />
        )}
      </Card>
    </div>
  )
}

export default ActiveCallsPanel
