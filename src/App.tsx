import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import Layout from "./components/layout/Layout";
import PatientLayout from "./components/layout/PatientLayout";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import PatientDashboard from "./pages/PatientDashboard";
import PatientDashboardNew from "./pages/patient/PatientDashboard";
import PCMModule from "./pages/provider/PCMModule";
import PatientMedical from "./pages/patient/PatientMedical";
import PatientMedications from "./pages/patient/PatientMedications";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientVitals from "./pages/patient/PatientVitals";
import PatientInsurance from "./pages/patient/PatientInsurance";
import PatientTestResults from "./pages/patient/PatientTestResults";
import Appointments from "./pages/Appointments";
import Telehealth from "./pages/Telehealth";
import PatientPortal from "./pages/PatientPortal";
import Reports from "./pages/Reports";
import Medications from "./pages/Medications";
import DoctorSettings from "./pages/DoctorSettings";
import Monitoring from "./pages/Monitoring";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import PatientMonitoringDashboard from "./pages/PatientMonitoringDashboard";
import BillingAutomation from "./pages/BillingAutomation";
import LoginForm from "./components/auth/LoginForm";
import { SignupForm } from "./components/auth/SignupForm";
import OpenRoute from "./components/auth/OpenRoute";
import PrivateRoute from "./components/auth/PrivateRoute";
import { getRingCentralByProviderIdAPI } from "@/services/operations/auth";

// RINGCENTRAL
import { Layout as AntLayout, notification } from "antd";
import CallManager from "./ringcentral/components/calling/CallManager";
import ActiveCallsPanel from "./ringcentral/components/calling/ActiveCallsPanel";
import { RootState } from "./redux/store";
import { useSelector } from "react-redux";
import { ringCentralStore } from "./ringcentral/store/ringcentral";
import useSocket from "./socket_io/useSocket";
import PatientChat from "./pages/provider/TeamChats";
import InactivityLogout from "./components/LoggedOut";
import ForgotPassword from "./pages/ForgetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/MainLandingPage";
import Encounters from "./pages/Encounters";
import PatientIntake from "./components/PatientIntake";
import SubmiteIntake from "./pages/SubmiteIntake";
import PatientBeds from "./pages/provider/PatientBeds";
import PatientConsent from "./pages/provider/PatientConsent";
import TermsAndCondition from "./pages/TermsAndCondition";
import { VerifyEmailProvider } from "./components/auth/ProviderPassword";
import BillingAndCoding from "./pages/service/BillingAndCoding";
import EHRServicePage from "./pages/service/EHRServicePage";
import CredentialingPage from "./pages/service/CredentialingPage";
import ForClinicsPage from "./pages/solutions/ForClinicsPage";
import BlogPage from "./pages/resources/BlogPage";
import Rpm from "./pages/service/Rpm";
import TelehealthPage from "./pages/service/Telehealth";
import AiAutomation from "./pages/service/AiAutomation";
import PrivatePractices from "./pages/solutions/PrivatePractices";
import Pharmacies from "./pages/solutions/Pharmacies";
import MentalHealth from "./pages/solutions/MentalHealth";
import Specialists from "./pages/solutions/Specialists";
import LargePractices from "./pages/solutions/LargePractices";
import About from "./pages/About";
import Contact from "./pages/Contact";
import RCMManagement from "./pages/RCMManagement";

const queryClient = new QueryClient();

const App = () => {
  const [api] = notification.useNotification();
  const { user, token } = useSelector((state: RootState) => state.auth);
  useSocket();
  console.log(user);
  useEffect(() => {
    globalThis.notifier = api;
  }, [api]);

  useEffect(() => {
    const handleShowConfig = async () => {
      try {
        if (!token || !user) {
          return;
        }
        const response = await getRingCentralByProviderIdAPI(user?.id, token);

        if (response?.data) {
          ringCentralStore.setConfigFromBackend(response.data);
        }
      } catch (error) {
        console.error("Load config error:", error);
      }
    };

    handleShowConfig();
  }, [user, token]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DataProvider>
            <Routes>
              <Route
                path="/login"
                element={
                  <OpenRoute>
                    <LoginForm />
                  </OpenRoute>
                }
              />
              <Route path="/terms-conditions" element={<TermsAndCondition />} />
              <Route path="/services/billing-coding" element={<BillingAndCoding />} />
              <Route path="/services/ehr" element={<EHRServicePage />} />
              <Route path="/services/credentialing" element={<CredentialingPage />} />
              <Route path="/solutions/clinics" element={<ForClinicsPage />} />
              <Route path="/resources/blog" element={<BlogPage />} />
              <Route path="/" element={<Home />} />
              <Route path="/services/rpm" element={<Rpm />} />
              <Route path="/services/telehealth" element={<TelehealthPage />} />
              <Route path="/services/ai-automation" element={<AiAutomation />} />
              <Route path="/solutions/private-practices" element={<PrivatePractices />} />
              <Route path="/solutions/pharmacies" element={<Pharmacies />} />
              <Route path="/solutions/mental-health" element={<MentalHealth />} />
              <Route path="/solutions/specialists" element={<Specialists />} />
              <Route path="/solutions/large-practices" element={<LargePractices />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/register"
                element={
                  <OpenRoute>
                    <SignupForm />
                  </OpenRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <OpenRoute>
                    <SignupForm />
                  </OpenRoute>
                }
              />
              <Route
                path="/provider-verfy"
                element={
                  <OpenRoute>
                    <VerifyEmailProvider />
                  </OpenRoute>
                }
              />

              <Route
                path="/verify-email"
                element={
                  <OpenRoute>
                    <VerifyEmail />
                  </OpenRoute>
                }
              />

              <Route
                path="/forgot-password"
                element={
                  <OpenRoute>
                    <ForgotPassword />
                  </OpenRoute>
                }
              />
              <Route
                path="update-password/:id"
                element={
                  <OpenRoute>
                    <UpdatePassword />
                  </OpenRoute>
                }
              />
              <Route path="patient-intake/:id" element={<SubmiteIntake />} />

              {/* Provider Routes */}
              {user && user.role === 6 && (
                <>
                  <Route
                    path="/provider"
                    element={
                      <PrivateRoute>
                        <Layout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<Index />} />
                    <Route
                      path="dashboard"
                      element={
                        // <PrivateRoute>
                        <Dashboard />
                        // </PrivateRoute>
                      }
                    />
                    <Route path="patients" element={<Patients />} />
                    <Route path="patients/:id" element={<PatientDetails />} />
                    <Route
                      path="patients/:id/dashboard"
                      element={<PatientDashboard />}
                    />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="telehealth" element={<Telehealth />} />
                    <Route path="portal" element={<PatientPortal />} />
                    <Route path="messages" element={<Messages />} />
                    {/* <Route path="monitoring" element={<Monitoring />} /> */}
                    <Route
                      path="patient-monitoring"
                      element={<PatientMonitoringDashboard />}
                    />
                    <Route path="reports" element={<Reports />} />
                    <Route path="medications" element={<Medications />} />
                    <Route path="encounters" element={<Encounters />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="rcm" element={<RCMManagement />} />
                    <Route path="intake" element={<PatientIntake />} />
                    <Route path="patient-beds" element={<PatientBeds />} />
                    <Route
                      path="patient-consent"
                      element={<PatientConsent />}
                    />
                    <Route
                      path="billing-automation"
                      element={<BillingAutomation />}
                    />
                    <Route path="payment/:invoiceId" element={<Payment />} />
                    <Route
                      path="doctor-/provider/settings"
                      element={<DoctorSettings />}
                    />
                    <Route path="/provider/settings" element={<Settings />} />
                    {/* <Route path="ccm" element={<ChronicCareManagement />} /> */}
                    {/* <Route path="pcm" element={<PCMModule />} /> */}
                  </Route>
                </>
              )}

              {/* Patient Routes */}
              <Route path="/patient" element={<PatientLayout />}>
                <Route path="dashboard" element={<PatientDashboardNew />} />
                <Route path="medical" element={<PatientMedical />} />
                <Route path="medications" element={<PatientMedications />} />
                <Route path="appointments" element={<PatientAppointments />} />
                <Route path="vitals" element={<PatientVitals />} />
                <Route path="insurance" element={<PatientInsurance />} />
                <Route path="tests" element={<PatientTestResults />} />
              </Route>
              <Route path="/demo" element={<PatientChat />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </TooltipProvider>
        {user && false && <InactivityLogout />}
      </BrowserRouter>

      <CallManager />
      <ActiveCallsPanel />
    </QueryClientProvider>
  );
};

export default App;
