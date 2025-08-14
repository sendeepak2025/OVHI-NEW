import RingCentral from "@rc-ex/core";
import type GetExtensionInfoResponse from "@rc-ex/core/lib/definitions/GetExtensionInfoResponse";
import { message } from "antd";
import hyperid from "hyperid";
import localforage from "localforage";
import WebPhone from "ringcentral-web-phone";
import type { SipInfo } from "ringcentral-web-phone/types";
import waitFor from "wait-for-async";

import { DEFAULT_RC_CONFIG } from "../config/ringcentral";

const uuid = hyperid();

const trimPrefix = (s: string, prefix: string): string => {
  if (s.startsWith(prefix)) {
    return s.slice(prefix.length);
  }
  return s;
};

export interface CallSession {
  callId: string;
  direction: "inbound" | "outbound";
  remoteNumber: string;
  state: "init" | "ringing" | "answered" | "hold" | "ended" | "failed";
  startTime?: number;
  endTime?: number;
  duration: number;
  isOnHold: boolean;
  isMuted: boolean;
  isRecording: boolean;
  inputDeviceId?: string;
  outputDeviceId?: string;
  patientName?: string;
  answer: () => Promise<void>;
  decline: () => Promise<void>;
  hangup: () => Promise<void>;
  hold: () => Promise<void>;
  unhold: () => Promise<void>;
  mute: () => Promise<void>;
  unmute: () => Promise<void>;
  sendDtmf: (digits: string) => Promise<void>;
  changeInputDevice: (deviceId: string) => Promise<void>;
  changeOutputDevice: (deviceId: string) => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

export interface CallHistoryRecord {
  id: string;
  sessionId: string;
  startTime: string;
  duration: number;
  type: "Voice" | "Fax" | "SMS";
  direction: "Inbound" | "Outbound";
  action:
    | "Phone Call"
    | "Ring Out"
    | "RingMe"
    | "Conference Call"
    | "Greeting"
    | "Incoming Fax"
    | "Outgoing Fax";
  result:
    | "Completed"
    | "Missed"
    | "Call accepted"
    | "Voicemail"
    | "Unknown"
    | "In Progress"
    | "Busy"
    | "No Answer"
    | "Hang Up"
    | "Stopped"
    | "Internal Error"
    | "No Credit"
    | "Restricted Number"
    | "Wrong Number"
    | "International Disabled"
    | "International Restricted"
    | "Bad Number";
  to?: {
    phoneNumber?: string;
    name?: string;
    location?: string;
  };
  from?: {
    phoneNumber?: string;
    name?: string;
    location?: string;
  };
  recording?: {
    id: string;
    uri: string;
    type: "Automatic" | "OnDemand";
    contentUri: string;
    duration?: number;
  };
  transport: "PSTN" | "VoIP";
  lastModifiedTime: string;
  billing?: {
    costIncluded?: number;
    costPurchased?: number;
  };
}

export interface CallHistoryResponse {
  records: CallHistoryRecord[];
  paging: {
    page: number;
    perPage: number;
    pageStart: number;
    pageEnd: number;
  };
  navigation: {
    firstPage?: { uri: string };
    nextPage?: { uri: string };
    previousPage?: { uri: string };
    lastPage?: { uri: string };
  };
}

class RingCentralStore {
  public config = DEFAULT_RC_CONFIG;
  public rcToken = "";
  public refreshToken = "";
  public isConnected = false;
  public isConnecting = false;
  public isLoggedIn = false;
  public webPhone: WebPhone | null = null;
  public extInfo: GetExtensionInfoResponse | null = null;
  public primaryNumber = "";
  public callerIds: string[] = [];
  public deviceId = "";
  public activeCalls: CallSession[] = [];
  public tokenExpiryTime = 0;
  public autoConnectAttempted = false;
  public initializationComplete = false;
  public authType: "jwt" | "oauth" = "jwt";

  // Call History Management
  public callHistory: CallHistoryRecord[] = [];
  public callHistoryLoading = false;
  public callHistoryPage = 1;
  public callHistoryPerPage = 50;
  public hasMoreCallHistory = true;
  public callHistoryLastSync = 0;

  private listeners: Set<() => void> = new Set();
  private rc: RingCentral | null = null;

  constructor() {
    // console.log("🚀 RingCentral Store Constructor")
    this.initialize();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("❌ Error in listener:", error);
      }
    });
  }

  private updateStates() {
    let hasValidTokens = false;

    if (this.authType === "jwt") {
      hasValidTokens = !!(this.rcToken && this.tokenExpiryTime > Date.now());
      //  // console.log("🔍 JWT Token Validation:")
      //  // console.log("  - rcToken exists:", !!this.rcToken)
      //  // console.log("  - tokenExpiryTime:", this.tokenExpiryTime > 0 ? new Date(this.tokenExpiryTime) : "None")
      //  // console.log("  - token valid:", hasValidTokens)
    } else {
      hasValidTokens = !!(
        this.rcToken &&
        this.refreshToken &&
        this.tokenExpiryTime > Date.now()
      );
      //  // console.log("🔍 OAuth Token Validation:")
      //  // console.log("  - rcToken exists:", !!this.rcToken)
      //  // console.log("  - refreshToken exists:", !!this.refreshToken)
      //  // console.log("  - tokenExpiryTime:", this.tokenExpiryTime > 0 ? new Date(this.tokenExpiryTime) : "None")
      //  // console.log("  - token valid:", hasValidTokens)
    }

    const hasWebPhone = !!this.webPhone;

    this.isLoggedIn = hasValidTokens;
    this.isConnected = this.isLoggedIn && hasWebPhone;

    //  // console.log("🔄 Final State Update:")
    //  // console.log("  - authType:", this.authType)
    //  // console.log("  - hasValidTokens:", hasValidTokens)
    //  // console.log("  - hasWebPhone:", hasWebPhone)
    //  // console.log("  - isLoggedIn:", this.isLoggedIn)
    //  // console.log("  - isConnected:", this.isConnected)

    this.notifyListeners();
  }

  private async initialize() {
    try {
      // console.log("🔄 Initializing store...")
      await this.loadStoredCredentials();
      this.initializationComplete = true;
      this.updateStates();
    } catch (error) {
      console.error("❌ Initialization failed:", error);
      this.initializationComplete = true;
      this.updateStates();
    }
  }

  private async loadStoredCredentials() {
    try {
      // console.log("📂 Loading stored credentials...")

      const [
        storedToken,
        storedRefreshToken,
        storedExpiry,
        storedExtInfo,
        storedCallerIds,
        storedPrimaryNumber,
        storedAuthType,
      ] = await Promise.all([
        localforage.getItem<string>("rc-access-token"),
        localforage.getItem<string>("rc-refresh-token"),
        localforage.getItem<number>("rc-token-expiry"),
        localforage.getItem<GetExtensionInfoResponse>("rc-ext-info"),
        localforage.getItem<string[]>("rc-caller-ids"),
        localforage.getItem<string>("rc-primary-number"),
        localforage.getItem<string>("rc-auth-type"),
      ]);

      if (storedToken && storedExpiry) {
        this.rcToken = storedToken;
        this.refreshToken = storedRefreshToken || "";
        this.tokenExpiryTime = storedExpiry;
        this.extInfo = storedExtInfo;
        this.callerIds = storedCallerIds || [];
        this.primaryNumber = storedPrimaryNumber || "";
        this.authType = (storedAuthType as "jwt" | "oauth") || "jwt";

        // console.log("✅ Credentials loaded from storage")
        // console.log("  - Auth type:", this.authType)
        // console.log("  - Token exists:", !!this.rcToken)
        // console.log("  - Refresh token exists:", !!this.refreshToken)
        // console.log("  - Expires:", new Date(this.tokenExpiryTime))

        this.updateStates();

        const now = Date.now();
        const bufferTime = 5 * 60 * 1000;

        if (this.tokenExpiryTime > now + bufferTime) {
          // console.log("🔄 Valid token found, scheduling auto-connect...")
          setTimeout(() => this.attemptAutoConnect(), 1000);
        } else {
          // console.log("⚠️ Token expired, clearing...")
          await this.clearStoredCredentials();
        }
      } else {
        //  // console.log("ℹ️ No stored credentials found")
        this.updateStates();
      }
    } catch (error) {
      console.error("❌ Error loading credentials:", error);
      this.updateStates();
    }
  }

  private async attemptAutoConnect() {
    if (this.autoConnectAttempted || !this.isLoggedIn) {
      return;
    }

    this.autoConnectAttempted = true;
    // console.log("🔄 Auto-connecting...")

    try {
      this.isConnecting = true;
      this.updateStates();

      this.rc = new RingCentral({
        server: this.config.server,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      });

      this.rc.token = {
        access_token: this.rcToken,
        refresh_token: this.refreshToken,
      };

      if (this.authType === "oauth" && this.refreshToken) {
        try {
          await this.rc.refresh();
          this.rcToken = this.rc.token!.access_token!;
          this.refreshToken = this.rc.token!.refresh_token!;
          this.updateTokenExpiry();
          // console.log("✅ Token refreshed")
        } catch (refreshError) {
          // console.log("❌ Token refresh failed, clearing credentials")
          await this.clearStoredCredentials();
          this.isConnecting = false;
          this.updateStates();
          return;
        }
      } else {
        // console.log("ℹ️ JWT auth - skipping token refresh")
      }

      await this.initializeWebPhone();
      await this.saveCredentials();

      this.isConnecting = false;
      this.updateStates();

      message.success("🎉 Auto-connected successfully!");
      this.setupTokenRefresh();
      this.setupConnectionRecovery();

      // Load call history after successful connection
      await this.loadCallHistory(true);
    } catch (error) {
      console.error("❌ Auto-connect failed:", error);
      await this.clearStoredCredentials();
      this.isConnecting = false;
      this.updateStates();
    }
  }

  public async connect() {
    // console.log("🔌 Manual connect started...")

    // Check if already connected
    if (this.isConnected && this.webPhone) {
      // console.log("✅ Already connected, skipping...")
      message.info("Already connected to RingCentral");
      return;
    }

    // Check if we have valid stored tokens first
    if (this.rcToken && this.tokenExpiryTime > Date.now() + 5 * 60 * 1000) {
      // console.log("🔑 Using existing valid token...")

      try {
        this.isConnecting = true;
        this.updateStates();

        // Use existing token
        this.rc = new RingCentral({
          server: this.config.server,
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
        });

        this.rc.token = {
          access_token: this.rcToken,
          refresh_token: this.refreshToken,
        };

        // Only initialize WebPhone if not already done
        if (!this.webPhone) {
          await this.initializeWebPhone();
        }

        this.isConnecting = false;
        this.updateStates();

        message.success(
          `✅ Reconnected as ${this.extInfo?.contact?.firstName} ${this.extInfo?.contact?.lastName}`
        );

        // Load call history
        await this.loadCallHistory(true);
        return;
      } catch (error) {
        // console.log("❌ Existing token failed, getting new one...")
        // Continue to get new token
      }
    }

    // Clean up any existing connections first
    await this.cleanupConnections();

    this.isConnecting = true;
    this.isConnected = false;
    this.isLoggedIn = false;
    this.authType = "jwt";
    this.updateStates();

    try {
      this.rc = new RingCentral({
        server: this.config.server,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      });

      // console.log("🔑 Authenticating with JWT...")
      const token = await this.rc.authorize({ jwt: this.config.jwt });

      this.rcToken = token.access_token!;
      this.refreshToken = token.refresh_token || "";
      this.updateTokenExpiry();

      // console.log("✅ JWT Authentication successful!")
      // console.log("  - Access token length:", this.rcToken.length)
      // console.log("  - Refresh token:", this.refreshToken ? "Yes" : "No (normal for JWT)")
      // console.log("  - Expires:", new Date(this.tokenExpiryTime))

      this.updateStates();

      await this.fetchUserInfo();
      await this.initializeWebPhone();

      this.isConnecting = false;
      this.updateStates();

      message.success(
        `✅ Connected as ${this.extInfo?.contact?.firstName} ${this.extInfo?.contact?.lastName}`
      );

      await this.saveCredentials();
      this.setupTokenRefresh();
      this.setupConnectionRecovery();

      // Load call history after successful connection
      await this.loadCallHistory(true);

      // console.log("🎉 Connection complete!")
      // console.log("  - isLoggedIn:", this.isLoggedIn)
      // console.log("  - isConnected:", this.isConnected)
    } catch (error) {
      console.error("❌ Connection failed:", error);

      if (error.message?.includes("Too Many Contacts")) {
        message.error(
          "❌ Too many active sessions. Please wait 5 minutes and try again, or use a different device."
        );

        // Try to cleanup and retry once
        await this.cleanupConnections();
        await this.clearStoredCredentials();

        message.info(
          "🔄 Cleaned up sessions. Please try connecting again in a few minutes."
        );
      } else {
        message.error(`Connection failed: ${error.message}`);
      }

      await this.clearStoredCredentials();
      this.isConnecting = false;
      this.isConnected = false;
      this.isLoggedIn = false;
      this.webPhone = null;
      this.rc = null;
      this.updateStates();
    }
  }

  private async cleanupConnections() {
    // console.log("🧹 Cleaning up existing connections...")

    try {
      // Dispose existing WebPhone
      if (this.webPhone) {
        // console.log("🔌 Disposing existing WebPhone...")
        await this.webPhone.dispose();
        this.webPhone = null;
      }

      // Clear active calls
      this.activeCalls = [];

      // If we have RC client, try to revoke SIP info
      if (this.rc && this.deviceId) {
        try {
          // console.log("🗑️ Revoking SIP device...")
          await this.rc
            .restapi()
            .clientInfo()
            .sipProvision()
            .post({});
        } catch (revokeError) {
          // console.log("⚠️ Could not revoke SIP device:", revokeError.message)
        }
      }

      // Clear cached SIP info
      if (this.extInfo) {
        const cacheKey = `rc-${this.extInfo.id}`;
        await localforage.removeItem(`${cacheKey}-sipInfo`);
        await localforage.removeItem(`${cacheKey}-deviceId`);
        await localforage.removeItem(`${cacheKey}-sipInfo-timestamp`);
      }

      this.deviceId = "";
      // console.log("✅ Cleanup completed")
    } catch (error) {
      console.error("❌ Cleanup error:", error);
    }
  }

  private async fetchUserInfo() {
    if (!this.rc) return;

    // console.log("👤 Fetching user info...")
    this.extInfo = await this.rc.restapi().account().extension().get();
    const numberList = await this.rc
      .restapi()
      .account()
      .extension()
      .phoneNumber()
      .get();

    this.primaryNumber = trimPrefix(
      numberList.records?.find((n) => n.primary)?.phoneNumber ?? "",
      "+"
    );

    this.callerIds = [];
    if (this.primaryNumber !== "") {
      this.callerIds.push(this.primaryNumber);
    }

    this.callerIds = [
      ...this.callerIds,
      ...(numberList.records
        ?.filter((n) => !n.primary)
        .filter((n) => n.features?.includes("CallerId"))
        .map((n) => trimPrefix(n.phoneNumber!, "+")) ?? []),
    ];

    const fromNumber = trimPrefix(this.config.fromNumber, "+");
    if (!this.callerIds.includes(fromNumber)) {
      this.callerIds.push(fromNumber);
    }

    // console.log("✅ User info fetched:", this.extInfo.contact?.firstName, this.extInfo.contact?.lastName)
  }

  private async initializeWebPhone() {
    if (!this.rc || !this.extInfo) {
      throw new Error(
        "Cannot initialize WebPhone without RC client and extension info"
      );
    }

    // console.log("📞 Initializing WebPhone...")
    const cacheKey = `rc-${this.extInfo.id}`;

    // Always get fresh SIP info to avoid "Too Many Contacts"
    // console.log("🔄 Getting fresh SIP info to avoid conflicts...")

    try {
      const r = await this.rc
        .restapi()
        .clientInfo()
        .sipProvision()
        .post({
          sipInfo: [{ transport: "WSS" }],
        });

      const sipInfo = r.sipInfo![0];
      this.deviceId = r.device!.id!;

      // Cache the new SIP info
      await localforage.setItem(`${cacheKey}-sipInfo`, sipInfo);
      await localforage.setItem(`${cacheKey}-deviceId`, this.deviceId);
      await localforage.setItem(`${cacheKey}-sipInfo-timestamp`, Date.now());

      // console.log("✅ Fresh SIP info obtained, deviceId:", this.deviceId)

      this.webPhone = new WebPhone({
        sipInfo: sipInfo as SipInfo,
        instanceId: uuid(),
        debug: true,
        autoAnswer: false,
      });

      this.setupEventListeners();
      await this.webPhone.start();
      // console.log("✅ WebPhone started successfully")
    } catch (error) {
      if (error.message?.includes("Too Many Contacts")) {
        throw new Error(
          "Too Many Contacts: Please wait 5 minutes before reconnecting, or try from a different browser/device."
        );
      }
      throw error;
    }
  }

  // 📞 CALL HISTORY API METHODS - FIXED VERSION
  public async loadCallHistory(reset = false): Promise<void> {
    if (!this.rc || !this.isLoggedIn) {
      // console.log("❌ Cannot load call history - not logged in");
      return;
    }

    if (this.callHistoryLoading) {
      // console.log("⏳ Call history already loading...");
      return;
    }

    if (!reset && !this.hasMoreCallHistory) {
      // console.log("📞 No more call history to load");
      return;
    }

    try {
      this.callHistoryLoading = true;
      if (reset) {
        this.callHistoryPage = 1;
        this.callHistory = [];
        this.hasMoreCallHistory = true;
      }

      // console.log(`📞 Loading call history - Page ${this.callHistoryPage}`);
      this.notifyListeners();

      // 30 days ago ISO string
      const dateFrom = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      let response;

      // Try Method 1: Axios .get() with endpoint path
      try {
        // console.log("🔄 Making API call to call-log endpoint (basic)...");
        response = await this.rc.get(
          "/restapi/v1.0/account/~/extension/~/call-log",
          {
            params: {
              page: this.callHistoryPage,
              perPage: this.callHistoryPerPage,
              dateFrom,
            },
          }
        );
        // console.log("✅ Basic call log API successful", response);
      } catch (basicError) {
        console.warn("❌ Basic API failed, trying SDK method...");

        try {
          const callLogEndpoint = this.rc
            .restapi()
            .account()
            .extension()
            .callLog();
          response = await callLogEndpoint.list({
            page: this.callHistoryPage,
            perPage: this.callHistoryPerPage,
          });
          // console.log("✅ SDK method successful");
        } catch (sdkError) {
          console.warn("❌ SDK method failed, trying direct HTTP...");

          const url = `${this.config.server}/restapi/v1.0/account/~/extension/~/call-log`;
          const headers = {
            Authorization: `Bearer ${this.rcToken}`,
            "Content-Type": "application/json",
          };

          const params = new URLSearchParams({
            page: this.callHistoryPage.toString(),
            perPage: this.callHistoryPerPage.toString(),
          });

          const fetchResponse = await fetch(`${url}?${params}`, {
            method: "GET",
            headers,
          });

          if (!fetchResponse.ok) {
            throw new Error(
              `HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`
            );
          }

          const data = await fetchResponse.json();
          response = { data };
          // console.log("✅ Direct HTTP call successful");
        }
      }

      // ✅ Corrected response extraction
      const records = Array.isArray(response.data?.records)
        ? response.data.records
        : [];
      const paging = response.data?.paging || {};

      // console.log(`📊 Received ${records.length} call records on page ${paging.page || this.callHistoryPage}`);

      const newRecords: CallHistoryRecord[] = records.map((record: any) => ({
        id: record.id || Date.now().toString(),
        sessionId: record.sessionId || record.id || "",
        startTime: record.startTime || new Date().toISOString(),
        duration: record.duration || 0,
        type: (record.type || "Voice") as "Voice" | "Fax" | "SMS",
        direction: (record.direction || "Outbound") as "Inbound" | "Outbound",
        action: record.action || "Phone Call",
        result: record.result || "Unknown",
        to: record.to
          ? {
              phoneNumber: record.to.phoneNumber,
              name: record.to.name,
              location: record.to.location,
            }
          : undefined,
        from: record.from
          ? {
              phoneNumber: record.from.phoneNumber,
              name: record.from.name,
              location: record.from.location,
            }
          : undefined,
        recording: record.recording
          ? {
              id: record.recording.id!,
              uri: record.recording.uri!,
              type: (record.recording.type || "Automatic") as
                | "Automatic"
                | "OnDemand",
              contentUri: record.recording.contentUri!,
              duration: record.recording.duration,
            }
          : undefined,
        transport: (record.transport || "PSTN") as "PSTN" | "VoIP",
        lastModifiedTime:
          record.lastModifiedTime ||
          record.startTime ||
          new Date().toISOString(),
        billing: record.billing
          ? {
              costIncluded: record.billing.costIncluded,
              costPurchased: record.billing.costPurchased,
            }
          : undefined,
      }));

      if (reset) {
        this.callHistory = newRecords;
      } else {
        this.callHistory = [...this.callHistory, ...newRecords];
      }

      // ✅ Paging logic
      const totalElements =
        paging.totalElements || this.callHistoryPage * this.callHistoryPerPage;
      const totalPages = Math.ceil(totalElements / this.callHistoryPerPage);
      this.hasMoreCallHistory = this.callHistoryPage < totalPages;

      this.callHistoryPage++;
      this.callHistoryLastSync = Date.now();

      // console.log(`✅ Loaded ${newRecords.length} call records`);
      // console.log(`📄 Total loaded: ${this.callHistory.length}`);
      // console.log(`🔁 Has more pages: ${this.hasMoreCallHistory}`);

      this.notifyListeners();

      if (reset && newRecords.length > 0) {
        globalThis.notifier?.success({
          message: "Call History Loaded",
          description: `Loaded ${newRecords.length} call records`,
        });
      }
    } catch (error) {
      console.error("❌ All call history methods failed:", error);

      // Fallback to dummy records
      // console.log("🔄 Using dummy call history for testing...");

      const dummyRecords: CallHistoryRecord[] = [
        {
          id: "dummy-1",
          sessionId: "session-1",
          startTime: new Date().toISOString(),
          duration: 120,
          type: "Voice",
          direction: "Outbound",
          action: "Phone Call",
          result: "Completed",
          to: {
            phoneNumber: "+1234567890",
            name: "Test User",
            location: "NYC",
          },
          from: { phoneNumber: this.primaryNumber, name: "Provider" },
          transport: "VoIP",
          lastModifiedTime: new Date().toISOString(),
        },
      ];

      if (reset) {
        this.callHistory = dummyRecords;
      } else {
        this.callHistory = [...this.callHistory, ...dummyRecords];
      }

      this.hasMoreCallHistory = false;
      this.callHistoryLastSync = Date.now();

      this.notifyListeners();

      globalThis.notifier?.warning({
        message: "Using Demo Data",
        description: "Call history API failed. Showing demo data for testing.",
      });
    } finally {
      this.callHistoryLoading = false;
      this.notifyListeners();
    }
  }

  public async loadMoreCallHistory(): Promise<void> {
    if (!this.hasMoreCallHistory || this.callHistoryLoading) {
      return;
    }
    await this.loadCallHistory(false);
  }

  public async refreshCallHistory(): Promise<void> {
    await this.loadCallHistory(true);
  }

  public getCallHistoryForNumber(phoneNumber: string): CallHistoryRecord[] {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    return this.callHistory.filter((call) => {
      const toNumber = call.to?.phoneNumber?.replace(/\D/g, "") || "";
      const fromNumber = call.from?.phoneNumber?.replace(/\D/g, "") || "";
      return (
        toNumber.includes(cleanNumber) ||
        fromNumber.includes(cleanNumber) ||
        cleanNumber.includes(toNumber) ||
        cleanNumber.includes(fromNumber)
      );
    });
  }

  public getCallStats() {
    const total = this.callHistory.length;
    const incoming = this.callHistory.filter(
      (c) => c.direction === "Inbound"
    ).length;
    const outgoing = this.callHistory.filter(
      (c) => c.direction === "Outbound"
    ).length;
    const missed = this.callHistory.filter((c) => c.result === "Missed").length;
    const withRecording = this.callHistory.filter((c) => !!c.recording).length;

    return { total, incoming, outgoing, missed, withRecording };
  }

  async downloadRecording(recordingId: string): Promise<string | null> {
    try {
      // Step 1: Get the recording metadata (to get contentUri)
      const response = await this.rc.get(
        `/restapi/v1.0/account/~/recording/${recordingId}`
      );
      const recording = response.data;

      if (!recording || !(recording as any).contentUri) {
        console.error("No contentUri found in recording");
        return null;
      }

      // Step 2: Fetch the actual recording content as a blob
      const blobResponse = await fetch((recording as any).contentUri, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.rcToken}`, // Make sure you store this token on login
        },
      });

      if (!blobResponse.ok) {
        console.error(
          "Failed to fetch recording content:",
          blobResponse.statusText
        );
        return null;
      }

      const blob = await blobResponse.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Step 3: Trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `recording-${recordingId}.mp3`; // or .wav if that's the format
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return blobUrl;
    } catch (error) {
      console.error("Download failed:", error);
      return null;
    }
  }

  setConfigFromBackend(data: any) {
    // console.log(data)
    this.config = {
      clientId: data.client_id || "",
      clientSecret: data.client_secret || "",
      server: data.client_server || "",
      fromNumber: data.phone_number || "",
      jwt: data.jwt_token || "",
      providerName: data.provider_name || "",
      authType: data.auth_type || "jwt",
    };

    // console.log("✅ RingCentral config set from backend:", this.config);

    this.updateStates(); // Optionally revalidate states after setting config
  }

  private updateTokenExpiry() {
    this.tokenExpiryTime = Date.now() + 50 * 60 * 1000;
  }

  private async saveCredentials() {
    try {
      await Promise.all([
        localforage.setItem("rc-access-token", this.rcToken),
        localforage.setItem("rc-refresh-token", this.refreshToken),
        localforage.setItem("rc-token-expiry", this.tokenExpiryTime),
        localforage.setItem("rc-ext-info", this.extInfo),
        localforage.setItem("rc-caller-ids", this.callerIds),
        localforage.setItem("rc-primary-number", this.primaryNumber),
        localforage.setItem("rc-auth-type", this.authType),
      ]);
      // console.log("💾 Credentials saved")
    } catch (error) {
      console.error("❌ Error saving credentials:", error);
    }
  }

  private async clearStoredCredentials() {
    try {
      await Promise.all([
        localforage.removeItem("rc-access-token"),
        localforage.removeItem("rc-refresh-token"),
        localforage.removeItem("rc-token-expiry"),
        localforage.removeItem("rc-ext-info"),
        localforage.removeItem("rc-caller-ids"),
        localforage.removeItem("rc-primary-number"),
        localforage.removeItem("rc-auth-type"),
      ]);

      this.rcToken = "";
      this.refreshToken = "";
      this.tokenExpiryTime = 0;
      this.extInfo = null;
      this.callerIds = [];
      this.primaryNumber = "";
      this.autoConnectAttempted = false;
      this.webPhone = null;
      this.rc = null;
      this.authType = "jwt";
      this.callHistory = [];
      this.callHistoryPage = 1;
      this.hasMoreCallHistory = true;

      this.updateStates();
      // console.log("🗑️ All credentials cleared")
    } catch (error) {
      console.error("❌ Error clearing credentials:", error);
    }
  }

  public async disconnect() {
    // console.log("🔌 Disconnecting...")

    this.activeCalls.forEach((session) => {
      try {
        session.hangup();
      } catch (error) {
        console.error("Error hanging up call:", error);
      }
    });

    await this.cleanupConnections();
    this.updateStates();
    message.info("📴Ringcentral  Disconnected");
  }

  public async logout() {
    // console.log("👋 Logging out...")
    await this.disconnect();
    await this.clearStoredCredentials();
    message.info("👋 Logged out");
  }

  public async makeCall(
    number: string,
    patientName?: string
  ): Promise<CallSession | null> {
    if (!this.isLoggedIn) {
      message.error("❌ Not logged in");
      return null;
    }

    if (!this.isConnected || !this.webPhone) {
      message.error("❌ Not connected to RingCentral");
      return null;
    }

    try {
      // console.log("📞 Making call to:", number)
      const callerId = this.callerIds[0];
      const rawCallSession = await this.webPhone.call(number, callerId);

      const callSession = this.wrapCallSession(
        rawCallSession,
        "outbound",
        patientName
      );
      this.addActiveCall(callSession);

      // Refresh call history after making a call
      setTimeout(() => this.refreshCallHistory(), 2000);

      return callSession;
    } catch (error) {
      console.error("❌ Call failed:", error);
      message.error(`Call failed: ${error.message}`);
      return null;
    }
  }

  private wrapCallSession(
    rawSession: any,
    direction: "inbound" | "outbound",
    patientName?: string
  ): CallSession {
    const session: CallSession = {
      callId: rawSession.callId || Date.now().toString(),
      direction,
      remoteNumber: rawSession.remoteNumber || "Unknown",
      state: rawSession.state || "init",
      startTime: rawSession.startTime,
      endTime: rawSession.endTime,
      duration: 0,
      isOnHold: false,
      isMuted: false,
      isRecording: false,
      inputDeviceId: rawSession.inputDeviceId,
      outputDeviceId: rawSession.outputDeviceId,
      patientName,

      answer: async () => {
        try {
          await rawSession.answer();
          session.state = "answered";
          session.startTime = Date.now();
          this.notifyListeners();
        } catch (error) {
          console.error("❌ Answer failed:", error);
          throw error;
        }
      },

      decline: async () => {
        try {
          await rawSession.decline();
          session.state = "ended";
          session.endTime = Date.now();
          this.removeActiveCall(session);
          setTimeout(() => this.refreshCallHistory(), 2000);
        } catch (error) {
          console.error("❌ Decline failed:", error);
          throw error;
        }
      },

      hangup: async () => {
        try {
          await rawSession.hangup();
          session.state = "ended";
          session.endTime = Date.now();
          if (session.startTime) {
            session.duration = Math.floor(
              (session.endTime - session.startTime) / 1000
            );
          }
          this.removeActiveCall(session);
          setTimeout(() => this.refreshCallHistory(), 2000);
        } catch (error) {
          console.error("❌ Hangup failed:", error);
          throw error;
        }
      },

      hold: async () => {
        try {
          await rawSession.hold();
          session.isOnHold = true;
          session.state = "hold";
          this.notifyListeners();
        } catch (error) {
          console.error("❌ Hold failed:", error);
          throw error;
        }
      },

      unhold: async () => {
        try {
          await rawSession.unhold();
          session.isOnHold = false;
          session.state = "answered";
          this.notifyListeners();
        } catch (error) {
          console.error("❌ Unhold failed:", error);
          throw error;
        }
      },

      mute: async () => {
        try {
          await rawSession.mute();
          session.isMuted = true;
          this.notifyListeners();
        } catch (error) {
          console.error("❌ Mute failed:", error);
          throw error;
        }
      },

      unmute: async () => {
        try {
          await rawSession.unmute();
          session.isMuted = false;
          this.notifyListeners();
        } catch (error) {
          console.error("❌ Unmute failed:", error);
          throw error;
        }
      },

      sendDtmf: async (digits: string) => {
        try {
          await rawSession.sendDtmf(digits);
        } catch (error) {
          console.error("❌ DTMF failed:", error);
          throw error;
        }
      },

      changeInputDevice: async (deviceId: string) => {
        try {
          await rawSession.changeInputDevice(deviceId);
          session.inputDeviceId = deviceId;
          this.notifyListeners();
        } catch (error) {
          console.error("❌ Input device change failed:", error);
          throw error;
        }
      },

      changeOutputDevice: async (deviceId: string) => {
        try {
          await rawSession.changeOutputDevice(deviceId);
          session.outputDeviceId = deviceId;
          this.notifyListeners();
        } catch (error) {
          console.error("❌ Output device change failed:", error);
          throw error;
        }
      },

      startRecording: async () => {
        try {
          session.isRecording = true;
          this.notifyListeners();
          message.info("🔴 Recording started");
        } catch (error) {
          console.error("❌ Recording start failed:", error);
          throw error;
        }
      },

      stopRecording: async () => {
        try {
          session.isRecording = false;
          this.notifyListeners();
          message.info("⏹️ Recording stopped");
        } catch (error) {
          console.error("❌ Recording stop failed:", error);
          throw error;
        }
      },
    };

    rawSession.on("answered", () => {
      session.state = "answered";
      session.startTime = Date.now();
      this.notifyListeners();
    });

    rawSession.on("ended", () => {
      session.state = "ended";
      session.endTime = Date.now();
      if (session.startTime) {
        session.duration = Math.floor(
          (session.endTime - session.startTime) / 1000
        );
      }
      this.removeActiveCall(session);
      setTimeout(() => this.refreshCallHistory(), 2000);
    });

    rawSession.on("failed", () => {
      session.state = "failed";
      this.removeActiveCall(session);
      setTimeout(() => this.refreshCallHistory(), 2000);
    });

    rawSession.on("hold", () => {
      session.isOnHold = true;
      session.state = "hold";
      this.notifyListeners();
    });

    rawSession.on("unhold", () => {
      session.isOnHold = false;
      session.state = "answered";
      this.notifyListeners();
    });

    return session;
  }

  private addActiveCall(callSession: CallSession) {
    if (!this.activeCalls.find((call) => call.callId === callSession.callId)) {
      this.activeCalls.push(callSession);
      this.notifyListeners();
    }
  }

  private removeActiveCall(callSession: CallSession) {
    const initialCount = this.activeCalls.length;
    this.activeCalls = this.activeCalls.filter(
      (call) => call.callId !== callSession.callId
    );
    if (this.activeCalls.length !== initialCount) {
      this.notifyListeners();
    }
  }

  private setupEventListeners() {
    if (!this.webPhone) return;

    this.webPhone.on("inboundCall", (rawCallSession) => {
      const callSession = this.wrapCallSession(rawCallSession, "inbound");
      this.addActiveCall(callSession);

      globalThis.notifier?.info({
        message: "📞 Incoming Call",
        description: `Call from ${rawCallSession.remoteNumber}`,
        duration: 0,
      });

      // Refresh call history after incoming call
      setTimeout(() => this.refreshCallHistory(), 2000);
    });
  }

  private setupTokenRefresh() {
    if (this.authType === "jwt") {
      //  // console.log("ℹ️ JWT auth - no token refresh needed")
      return;
    }

    const refreshToken = async () => {
      if (
        this.rcToken !== "" &&
        this.isConnected &&
        this.rc &&
        this.refreshToken
      ) {
        try {
          await this.rc.refresh();
          this.rcToken = this.rc.token!.access_token!;
          this.refreshToken = this.rc.token!.refresh_token!;
          this.updateTokenExpiry();
          this.updateStates();
          await this.saveCredentials();
        } catch (error) {
          console.error("❌ Token refresh failed:", error);
          message.warning("⚠️ Session expired. Please reconnect.");
          this.disconnect();
        }
      }
    };

    setInterval(() => refreshToken(), 45 * 60 * 1000);
  }

  private setupConnectionRecovery() {
    if (!this.webPhone) return;

    const recover = async () => {
      if (this.webPhone && !this.webPhone.disposed) {
        try {
          await this.webPhone.start();
          this.webPhone.callSessions.forEach((callSession) => {
            if (callSession.state === "answered") {
              callSession.reInvite();
            }
          });
        } catch (error) {
          console.error("❌ Recovery failed:", error);
        }
      }
    };

    globalThis.addEventListener("online", async () => {
      await recover();
    });

    const closeListener = async (e) => {
      this.webPhone!.sipClient.wsc.removeEventListener("close", closeListener);
      if (this.webPhone!.disposed) {
        return;
      }

      let connected = false;
      let delay = 2000;

      while (!connected && this.isConnected) {
        await waitFor({ interval: delay });
        try {
          await recover();
          connected = true;
        } catch (e) {
          delay = Math.min(delay * 2, 60000);
        }
      }

      if (connected && this.webPhone) {
        this.webPhone.sipClient.wsc.addEventListener("close", closeListener);
      }
    };

    this.webPhone.sipClient.wsc.addEventListener("close", closeListener);
  }

  public get timeUntilExpiry(): number {
    return Math.max(0, this.tokenExpiryTime - Date.now());
  }

  public get tokenExpiryFormatted(): string {
    if (this.tokenExpiryTime === 0) return "Not logged in";
    const timeLeft = this.timeUntilExpiry;
    if (timeLeft <= 0) return "Expired";
    const minutes = Math.floor(timeLeft / (60 * 1000));
    return `${minutes} minutes remaining`;
  }

  public debugState() {
    //  // console.log("🔍 COMPLETE STATE DEBUG:")
    //  // console.log("========================")
    //  // console.log("AUTH:")
    //  // console.log("  - authType:", this.authType)
    //  // console.log("TOKENS:")
    //  // console.log("  - rcToken exists:", !!this.rcToken, "length:", this.rcToken.length)
    //  // console.log("  - refreshToken exists:", !!this.refreshToken, "length:", this.refreshToken.length)
    //  // console.log("  - tokenExpiryTime:", this.tokenExpiryTime, "->", new Date(this.tokenExpiryTime))
    //  // console.log("  - token valid:", this.tokenExpiryTime > Date.now())
    //  // console.log("OBJECTS:")
    //  // console.log("  - rc exists:", !!this.rc)
    //  // console.log("  - webPhone exists:", !!this.webPhone)
    //  // console.log("  - extInfo exists:", !!this.extInfo)
    //  // console.log("STATES:")
    //  // console.log("  - isLoggedIn:", this.isLoggedIn)
    //  // console.log("  - isConnected:", this.isConnected)
    //  // console.log("  - isConnecting:", this.isConnecting)
    //  // console.log("  - initializationComplete:", this.initializationComplete)
    //  // console.log("  - autoConnectAttempted:", this.autoConnectAttempted)
    //  // console.log("CALL HISTORY:")
    //  // console.log("  - callHistory length:", this.callHistory.length)
    //  // console.log("  - callHistoryLoading:", this.callHistoryLoading)
    //  // console.log("  - callHistoryPage:", this.callHistoryPage)
    //  // console.log("  - hasMoreCallHistory:", this.hasMoreCallHistory)
    //  // console.log("  - callHistoryLastSync:", new Date(this.callHistoryLastSync))
    //  // console.log("OTHER:")
    //  // console.log("  - activeCalls:", this.activeCalls.length)
    //  // console.log("  - callerIds:", this.callerIds)
    //  // console.log("========================")
  }
}

export const ringCentralStore = new RingCentralStore();

if (typeof window !== "undefined") {
  (window as any).ringCentralStore = ringCentralStore;
  (window as any).debugRingCentral = () => ringCentralStore.debugState();
}
