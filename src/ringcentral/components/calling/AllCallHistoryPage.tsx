"use client"

import  React from "react"
import { Card, Typography } from "antd"
import { History } from "lucide-react"

import CallHistoryPanel from "./CallHistoryPanel"

const { Title } = Typography

const AllCallHistoryPage: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <History size={24} />
            Complete Call History
          </Title>
        </div>

        <CallHistoryPanel showAll={true} />
      </Card>
    </div>
  )
}

export default AllCallHistoryPage
