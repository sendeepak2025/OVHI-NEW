"use client"

import { auto } from "manate/react"
import type CallSession from "ringcentral-web-phone/call-session/index"
import type InboundCallSession from "ringcentral-web-phone/call-session/inbound"
import type OutboundCallSession from "ringcentral-web-phone/call-session/outbound"

import InboundSession from "./inbound"
import OutboundSession from "./outbound"

// @ts-ignore - Suppressing TypeScript errors for RingCentral call session types
const Session = auto((props: { callSession: CallSession }) => {
  const { callSession } = props
  // @ts-ignore
  if (callSession.direction === "inbound") {
    // @ts-ignore
    return <InboundSession session={callSession} />
  } else if (callSession.state === "init") {
    return <>Initiating call...</>
  } else {
    // @ts-ignore
    return <OutboundSession session={callSession} />
  }
})

export default Session
