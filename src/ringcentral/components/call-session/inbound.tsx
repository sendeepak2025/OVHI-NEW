"use client"

import { Button, Space, Tag } from "antd"
import { auto } from "manate/react"
import type InboundCallSession from "ringcentral-web-phone/call-session/inbound"
import type CallSession from "ringcentral-web-phone/call-session/index"

import AnsweredSession from "./answered"

const InboundSession = auto((props: { session: InboundCallSession }) => {
  const { session } = props

  return (
    <Space direction="vertical">
      <Space>
        <strong>Incoming Call</strong>
        <span>from</span>
        <strong>{session.remoteNumber}</strong>
        <Tag color="blue">{session.state}</Tag>
      </Space>
      {session.state === "ringing" && (
        <Space>
          <Button onClick={() => session.answer()} type="primary">
            Answer
          </Button>
          <Button onClick={() => session.decline()} danger>
            Decline
          </Button>
        </Space>
      )}
      {/* @ts-ignore */}
      {session.state === "answered" && <AnsweredSession session={session as any} />}
    </Space>
  )
})

export default InboundSession
