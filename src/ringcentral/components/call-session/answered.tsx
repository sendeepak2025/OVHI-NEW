"use client"

import { Button, Input, Popover, Select, Space } from "antd"
import { auto } from "manate/react"
import { useEffect, useState } from "react"
import type CallSession from "ringcentral-web-phone/call-session/index"

const AnsweredSession = auto((props: { session: any }) => {
  const { session } = props
  const [dtmfPopoverVisible, setDtmfPopoverVisible] = useState(false)
  const [dtmfString, setDtmfString] = useState("")
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    const fetchDevices = async () => {
      const newDevices = await navigator.mediaDevices.enumerateDevices()
      if (newDevices.map((d) => d.deviceId).join("|") !== devices.map((d) => d.deviceId).join("|")) {
        setDevices(newDevices)
      }
    }
    fetchDevices()
    const handler = setInterval(fetchDevices, 10000)
    return () => clearInterval(handler)
  }, [devices])

  return (
    <Space wrap>
      <Button onClick={() => session.hangup()} danger>
        Hang up
      </Button>
      <Button onClick={() => session.hold()}>Hold</Button>
      <Button onClick={() => session.unhold()}>Unhold</Button>
      <Button onClick={() => session.mute()}>Mute</Button>
      <Button onClick={() => session.unmute()}>Unmute</Button>

      <Popover
        open={dtmfPopoverVisible}
        onOpenChange={(visible) => setDtmfPopoverVisible(visible)}
        trigger="click"
        placement="top"
        content={
          <Space direction="vertical">
            <Input placeholder="123#*" value={dtmfString} onChange={(e) => setDtmfString(e.target.value.trim())} />
            <Button
              onClick={() => {
                session.sendDtmf(dtmfString)
                setDtmfString("")
                setDtmfPopoverVisible(false)
              }}
            >
              Send DTMF
            </Button>
          </Space>
        }
      >
        <Button>Send DTMF</Button>
      </Popover>

      <Select
        options={devices.filter((d) => d.kind === "audioinput").map((d) => ({ value: d.deviceId, label: d.label }))}
        value={session.inputDeviceId}
        onChange={(value) => {
          session.changeInputDevice(value)
        }}
        style={{ width: 200 }}
        placeholder="Select Microphone"
      />

      {devices.filter((d) => d.kind === "audiooutput").length > 0 && (
        <Select
          options={devices.filter((d) => d.kind === "audiooutput").map((d) => ({ value: d.deviceId, label: d.label }))}
          value={session.outputDeviceId}
          onChange={(value) => {
            session.changeOutputDevice(value)
          }}
          style={{ width: 200 }}
          placeholder="Select Speaker"
        />
      )}
    </Space>
  )
})

export default AnsweredSession
