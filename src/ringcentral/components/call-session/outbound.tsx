"use client"

import { Space, Tag } from "antd"
import { auto } from "manate/react"
import type OutboundCallSession from "ringcentral-web-phone/call-session/outbound"
import type CallSession from "ringcentral-web-phone/call-session/index"

import AnsweredSession from "./answered"

const OutboundSession = auto((props: { session: OutboundCallSession }) => {
  const { session } = props

  return (
    <Space direction="vertical">
      <Space>
        <strong>Outgoing Call</strong>
        <span>to</span>
        <strong>{session.remoteNumber}</strong>
        <Tag color="blue">{session.state}</Tag>
      </Space>
      {/* @ts-ignore */}
      {session.state === "answered" && <AnsweredSession session={session as any} />}
    </Space>
  )
})

export default OutboundSession
