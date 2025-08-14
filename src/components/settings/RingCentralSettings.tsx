

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Eye, RefreshCw } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import {
  createOrGetRingCentralAPI,
  getRingCentralByProviderIdAPI,
} from "@/services/operations/auth";

interface RingCentralConfig {
  client_id: string;
  client_server: string;
  client_secret: string;
  phone_number: string;
  jwt_token: string;
  ring_cent_pass: string;
  auth_type: string;
  provider_id: string;
}

const RingCentralSettings: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [config, setConfig] = useState<RingCentralConfig>({
    client_id: "",
    client_server: "https://platform.ringcentral.com",
    client_secret: "",
    phone_number: "",
    jwt_token: "",
    ring_cent_pass: "",
    auth_type: "jwt",
    provider_id: user ? user.id : "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);

  const handleInputChange = (field: keyof RingCentralConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveConfig = async () => {
    // Validate required fields
    if (!config.client_id || !config.client_secret || !config.phone_number) {
      toast.error("Client ID, Client Secret, and Phone Number are required");
      return;
    }

    if (config.auth_type === "jwt" && !config.jwt_token) {
      toast.error("JWT Token is required when auth type is JWT");
      return;
    }

    if (config.auth_type === "password" && !config.ring_cent_pass) {
      toast.error("Password is required when auth type is Password");
      return;
    }

    setIsLoading(true);

    try {
      // API call to save configuration
      const response = await createOrGetRingCentralAPI(config);
    } catch (error) {
      toast.error("Error saving configuration");
      console.error("Save config error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowConfig = async () => {
    setIsShowLoading(true);
    // console.log(user)
    try {
      // API call to get configuration
      const response = await getRingCentralByProviderIdAPI(user?.id, token);

      if (response?.data) {
        setConfig(response.data);
      } else {
        toast.error("Failed to load configuration");
      }
    } catch (error) {
      toast.error("Error loading configuration");
      console.error("Load config error:", error);
    } finally {
      setIsShowLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RingCentral Configuration</CardTitle>
          <CardDescription>
            Configure your RingCentral integration settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="client_id">Client ID *</Label>
            <Input
              id="client_id"
              placeholder="Enter Client ID"
              value={config.client_id}
              onChange={(e) => handleInputChange("client_id", e.target.value)}
            />
          </div>

          {/* Client Server */}
          <div className="space-y-2">
            <Label htmlFor="client_server">Client Server</Label>
            <Input
              id="client_server"
              placeholder="Server URL"
              value={config.client_server}
              onChange={(e) =>
                handleInputChange("client_server", e.target.value)
              }
            />
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="client_secret">Client Secret *</Label>
            <Input
              id="client_secret"
              type="password"
              placeholder="Enter Client Secret"
              value={config.client_secret}
              onChange={(e) =>
                handleInputChange("client_secret", e.target.value)
              }
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number *</Label>
            <Input
              id="phone_number"
              placeholder="Enter Phone Number"
              value={config.phone_number}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
            />
          </div>

          {/* Auth Type */}
          <div className="space-y-2">
            <Label htmlFor="auth_type">Authentication Type</Label>
            <Select
              value={config.auth_type}
              onValueChange={(value) => handleInputChange("auth_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select authentication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jwt">JWT</SelectItem>
                <SelectItem value="password">Password</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields based on Auth Type */}
          {config.auth_type === "jwt" && (
            <div className="space-y-2">
              <Label htmlFor="jwt_token">JWT Token *</Label>
              <Input
                id="jwt_token"
                type="password"
                placeholder="Enter JWT Token"
                value={config.jwt_token}
                onChange={(e) => handleInputChange("jwt_token", e.target.value)}
              />
            </div>
          )}

          {config.auth_type === "password" && (
            <div className="space-y-2">
              <Label htmlFor="ring_cent_pass">RingCentral Password *</Label>
              <Input
                id="ring_cent_pass"
                type="password"
                placeholder="Enter RingCentral Password"
                value={config.ring_cent_pass}
                onChange={(e) =>
                  handleInputChange("ring_cent_pass", e.target.value)
                }
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveConfig}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Set Configuration
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleShowConfig}
              disabled={isShowLoading}
              className="flex-1 bg-transparent"
            >
              {isShowLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Configuration
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            * Required fields
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RingCentralSettings;
