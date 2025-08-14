

import type React from "react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import {
  getAllOrgAPI,
  getPdfAPI,
  getAllPractisAPI,
  updateSettingsApi,
  updatePdfSettingsApi,
} from "../../services/operations/settings";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

import { changePasswordAPI } from "@/services/operations/auth";
import { updateProviderSettingsApi,getAccountDetailsAPI } from "@/services/operations/settings";

const AccountSettings: React.FC = () => {
  const [organizations, setOrganizations] = useState([]);
  const [practices, setPractices] = useState([]);
  const [doctorData, setDoctorData] = useState(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    organizationId: "",
    practiceId: "",
    providerId: "",
    // PDF Header Configuration
    pdfHeaderConfig: {
      logo: {
        enabled: false,
        file: null as File | null,
        url: "", // for existing logo URL
      },
      organizationName: {
        enabled: true,
        value: "",
      },
      address: {
        enabled: true,
        value: "",
      },
      phone: {
        enabled: true,
        value: "",
      },
      email: {
        enabled: true,
        value: "",
      },
      website: {
        enabled: false,
        value: "",
      },
      fax: {
        enabled: false,
        value: "",
      },
      licenseNumber: {
        enabled: false,
        value: "",
      },
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

 const [patientForm, setPatientForm] = useState({
  firstName: "",
  lastName: "",
  npi: "",
  taxonomy: "",
  taxId: "",
  faxId: "",
});


  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({ ...prev, providerId: user.id }));

      const fetchPdfHeader = async () => {
        try {
          const response = await getPdfAPI(user.id, token);
          const config = response?.data;

          if (config) {
            setLogoPreview(config.logo_url);
            setFormData((prev) => ({
              ...prev,
              providerId: config.providerId,
              pdfHeaderConfig: {
                logo: {
                  enabled: !!config.logo_enabled,
                  file: null, // don't populate File, only URL
                  url: config.logo_url || "",
                },
                organizationName: {
                  enabled: !!config.organization_name_enabled,
                  value: config.organization_name_value || "",
                },
                address: {
                  enabled: !!config.address_enabled,
                  value: config.address_value || "",
                },
                phone: {
                  enabled: !!config.phone_enabled,
                  value: config.phone_value || "",
                },
                email: {
                  enabled: !!config.email_enabled,
                  value: config.email_value || "",
                },
                website: {
                  enabled: !!config.website_enabled,
                  value: config.website_value || "",
                },
                fax: {
                  enabled: !!config.fax_enabled,
                  value: config.fax_value || "",
                },
                licenseNumber: {
                  enabled: !!config.license_number_enabled,
                  value: config.license_number_value || "",
                },
              },
            }));
          }
        } catch (err) {
          console.error("❌ Failed to fetch PDF header config:", err);
        }
      };

      fetchPdfHeader();
    }
  }, [user]);

  const fetchOrganization = async () => {
    const response = await getAllOrgAPI(token);
    if (response.success) {
      setOrganizations(response.data);
    }
  };

  const fetchPractis = async () => {
    const response = await getAllPractisAPI(token);
    if (response.success) {
      setPractices(response.data);
    }
  };

  useEffect(() => {
    fetchOrganization();
    fetchPractis();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePdfHeaderChange = (
    field: string,
    type: "enabled" | "value",
    value: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      pdfHeaderConfig: {
        ...prev.pdfHeaderConfig,
        [field]: {
          ...prev.pdfHeaderConfig[field],
          [type]: value,
        },
      },
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Update form data
      setFormData((prev) => ({
        ...prev,
        pdfHeaderConfig: {
          ...prev.pdfHeaderConfig,
          logo: {
            ...prev.pdfHeaderConfig.logo,
            file: file,
            enabled: true,
          },
        },
      }));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData((prev) => ({
      ...prev,
      pdfHeaderConfig: {
        ...prev.pdfHeaderConfig,
        logo: {
          ...prev.pdfHeaderConfig.logo,
          file: null,
          enabled: false,
        },
      },
    }));
  };


  // Separate function for Organization & Practice settings
  const handleOrganizationSubmit = async () => {
    if (
      !formData.organizationId ||
      !formData.practiceId ||
      !formData.providerId
    ) {
      console.error("Please fill all fields.");
      return;
    }

    const orgData = {
      organizationId: formData.organizationId,
      practiceId: formData.practiceId,
      providerId: formData.providerId,
    };

    // console.log("Submitting Organization & Practice data:", orgData);
    const response = await updateSettingsApi(orgData, token);
    // console.log(response);
  };

  // Separate function for PDF Header Configuration
  const handlePdfHeaderSubmit = async () => {
    // Filter only enabled fields from PDF header config
    const enabledPdfHeaderConfig = {};

    Object.keys(formData.pdfHeaderConfig).forEach((key) => {
      const field = formData.pdfHeaderConfig[key];
      if (field.enabled) {
        if (key === "logo") {
          // For logo, only include if file exists and enabled
          if (field.file) {
            enabledPdfHeaderConfig[key] = {
              enabled: true,
              hasFile: true,
            };
          }
        } else {
          // For other fields, only include if they have a value and are enabled
          if (field.value && field.value.trim() !== "") {
            enabledPdfHeaderConfig[key] = {
              enabled: true,
              value: field.value,
            };
          }
        }
      }
    });

    // Check if at least one field is enabled and has data
    if (Object.keys(enabledPdfHeaderConfig).length === 0) {
      console.error("Please enable and fill at least one PDF header field.");
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append("providerId", formData.providerId);

    // Add logo file only if enabled and file exists
    if (
      formData.pdfHeaderConfig.logo.enabled &&
      formData.pdfHeaderConfig.logo.file
    ) {
      submitData.append("logo", formData.pdfHeaderConfig.logo.file);
    }

    // Add only enabled PDF header configuration
    submitData.append(
      "pdfHeaderConfig",
      JSON.stringify(enabledPdfHeaderConfig)
    );

    // console.log("Submitting PDF Header Configuration:", enabledPdfHeaderConfig);

    // You'll need to create a separate API function for PDF header settings
    // const response = await updatePdfHeaderSettingsApi(submitData)
    // For now, using the same API - you should create a separate one
    const response = await updatePdfSettingsApi(submitData, token);
    // console.log(response);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitPassword = async () => {
    const response = await changePasswordAPI(passwordForm, token);
    if (response?.success) {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const fetchSinglePatient = async () => {
    if (!user?.id) return;

    const response = await getAccountDetailsAPI(user?.id, token);
    console.log(response)
   setPatientForm({
  firstName: response?.firstname || "",
  lastName: response?.lastname || "",
  npi: response?.npi || "",
  taxonomy: response?.taxonomy || "",
  taxId: response?.taxId || "",
  faxId: response?.faxId || "",
});

   
  };

  useEffect(() => {
    fetchSinglePatient();
  }, [user]);

  const handlePatientChange = (field: string, value: string) => {
    setPatientForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Organization & Practice</CardTitle>
          <CardDescription>
            Update your Organization & Practice settings and PDF header
            configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization and Practice Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select
                onValueChange={(value) => handleChange("organizationId", value)}
                defaultValue={formData.organizationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem
                      key={org.organization_id}
                      value={String(org.organization_id)}
                    >
                      {org.organization_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="practice">Practice</Label>
              <Select
                onValueChange={(value) => handleChange("practiceId", value)}
                defaultValue={formData.practiceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Practice" />
                </SelectTrigger>
                <SelectContent>
                  {practices.map((practice) => (
                    <SelectItem
                      key={practice.practice_id}
                      value={String(practice.practice_id)}
                    >
                      {practice.practice_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PDF Header Configuration */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">
                PDF Header Configuration
              </h3>

              {/* Logo Upload Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="logo-toggle" className="text-sm font-medium">
                    Include Logo in PDF Header
                  </Label>
                  <Switch
                    id="logo-toggle"
                    checked={formData.pdfHeaderConfig.logo.enabled}
                    onCheckedChange={(checked) =>
                      handlePdfHeaderChange("logo", "enabled", checked)
                    }
                  />
                </div>

                {formData.pdfHeaderConfig.logo.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="logo-upload" className="text-sm">
                          Upload Logo
                        </Label>
                        <div className="mt-2">
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("logo-upload")?.click()
                            }
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Logo File
                          </Button>
                        </div>
                      </div>

                      {logoPreview && (
                        <div className="relative">
                          <div className="w-20 h-20 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={removeLogo}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {logoFile && (
                      <p className="text-sm text-gray-600">
                        Selected: {logoFile.name} (
                        {(logoFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Other PDF Header Fields */}
              <div className="grid grid-cols-1 gap-4 mt-4">
                {/* Organization Name */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Organization Name
                      </Label>
                      <Switch
                        checked={
                          formData.pdfHeaderConfig.organizationName.enabled
                        }
                        onCheckedChange={(checked) =>
                          handlePdfHeaderChange(
                            "organizationName",
                            "enabled",
                            checked
                          )
                        }
                      />
                    </div>
                    {formData.pdfHeaderConfig.organizationName.enabled && (
                      <Input
                        placeholder="Enter organization name"
                        value={formData.pdfHeaderConfig.organizationName.value}
                        onChange={(e) =>
                          handlePdfHeaderChange(
                            "organizationName",
                            "value",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Address</Label>
                      <Switch
                        checked={formData.pdfHeaderConfig.address.enabled}
                        onCheckedChange={(checked) =>
                          handlePdfHeaderChange("address", "enabled", checked)
                        }
                      />
                    </div>
                    {formData.pdfHeaderConfig.address.enabled && (
                      <Textarea
                        placeholder="Enter complete address"
                        value={formData.pdfHeaderConfig.address.value}
                        onChange={(e) =>
                          handlePdfHeaderChange(
                            "address",
                            "value",
                            e.target.value
                          )
                        }
                        rows={3}
                      />
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Switch
                        checked={formData.pdfHeaderConfig.phone.enabled}
                        onCheckedChange={(checked) =>
                          handlePdfHeaderChange("phone", "enabled", checked)
                        }
                      />
                    </div>
                    {formData.pdfHeaderConfig.phone.enabled && (
                      <Input
                        placeholder="Enter phone number"
                        value={formData.pdfHeaderConfig.phone.value}
                        onChange={(e) =>
                          handlePdfHeaderChange(
                            "phone",
                            "value",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Switch
                        checked={formData.pdfHeaderConfig.email.enabled}
                        onCheckedChange={(checked) =>
                          handlePdfHeaderChange("email", "enabled", checked)
                        }
                      />
                    </div>
                    {formData.pdfHeaderConfig.email.enabled && (
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={formData.pdfHeaderConfig.email.value}
                        onChange={(e) =>
                          handlePdfHeaderChange(
                            "email",
                            "value",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Website</Label>
                      <Switch
                        checked={formData.pdfHeaderConfig.website.enabled}
                        onCheckedChange={(checked) =>
                          handlePdfHeaderChange("website", "enabled", checked)
                        }
                      />
                    </div>
                    {formData.pdfHeaderConfig.website.enabled && (
                      <Input
                        placeholder="Enter website URL"
                        value={formData.pdfHeaderConfig.website.value}
                        onChange={(e) =>
                          handlePdfHeaderChange(
                            "website",
                            "value",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                </div>

                {/* Fax */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Fax Number</Label>
                      <Switch
                        checked={formData.pdfHeaderConfig.fax.enabled}
                        onCheckedChange={(checked) =>
                          handlePdfHeaderChange("fax", "enabled", checked)
                        }
                      />
                    </div>
                    {formData.pdfHeaderConfig.fax.enabled && (
                      <Input
                        placeholder="Enter fax number"
                        value={formData.pdfHeaderConfig.fax.value}
                        onChange={(e) =>
                          handlePdfHeaderChange("fax", "value", e.target.value)
                        }
                      />
                    )}
                  </div>
                </div>

                {/* License Number */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        License Number
                      </Label>
                      <Switch
                        checked={formData.pdfHeaderConfig.licenseNumber.enabled}
                        onCheckedChange={(checked) =>
                          handlePdfHeaderChange(
                            "licenseNumber",
                            "enabled",
                            checked
                          )
                        }
                      />
                    </div>
                    {formData.pdfHeaderConfig.licenseNumber.enabled && (
                      <Input
                        placeholder="Enter license number"
                        value={formData.pdfHeaderConfig.licenseNumber.value}
                        onChange={(e) =>
                          handlePdfHeaderChange(
                            "licenseNumber",
                            "value",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* PDF Header Configuration Save Section */}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">PDF Header Settings</h4>
                <p className="text-sm text-gray-500">
                  Save your PDF header configuration separately
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Reset PDF Settings
                </Button>
                <Button type="button" onClick={handlePdfHeaderSubmit} size="sm">
                  Save PDF Header
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleOrganizationSubmit}>
            Save Organization & Practice
          </Button>
        </CardFooter>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Update your account settings and preferences
          </CardDescription>
        </CardHeader>
   <CardContent className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="firstName">First Name</Label>
      <Input
        id="firstName"
        value={patientForm.firstName}
        onChange={(e) => handlePatientChange("firstName", e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="lastName">Last Name</Label>
      <Input
        id="lastName"
        value={patientForm.lastName}
        onChange={(e) => handlePatientChange("lastName", e.target.value)}
      />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="npi">NPI</Label>
      <Input
        id="npi"
        value={patientForm.npi}
        onChange={(e) => handlePatientChange("npi", e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="taxonomy">Taxonomy</Label>
      <Input
        id="taxonomy"
        value={patientForm.taxonomy}
        onChange={(e) => handlePatientChange("taxonomy", e.target.value)}
      />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="taxId">Tax ID</Label>
      <Input
        id="taxId"
        value={patientForm.taxId}
        onChange={(e) => handlePatientChange("taxId", e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="faxId">Fax ID</Label>
      <Input
        id="faxId"
        value={patientForm.faxId}
        onChange={(e) => handlePatientChange("faxId", e.target.value)}
      />
    </div>
  </div>
</CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={async () => {
              const response = await updateProviderSettingsApi(
                { ...patientForm, patientId: user?.id},token 
               
              );
              // console.log(response);
            }}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto" onClick={handleSubmitPassword}>
            Update Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSettings;
