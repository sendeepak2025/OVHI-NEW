import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Video,
  HeartPulse,
  Clock,
  CheckCheck,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentPatients from "@/components/dashboard/RecentPatients";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import PatientMonitoring from "@/components/dashboard/PatientMonitoring";
import OfficeLobby from "@/components/dashboard/OfficeLobby";
import QuickEncounterActions from "@/components/dashboard/QuickEncounterActions";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getDashboardDataApi } from "@/services/operations/settings";
const Dashboard: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentPatients] = useState([
    { id: '1', name: 'John Smith', age: 45, lastVisit: '2024-01-15', condition: 'Hypertension' },
    { id: '2', name: 'Sarah Johnson', age: 32, lastVisit: '2024-01-14', condition: 'Diabetes' },
    { id: '3', name: 'Michael Brown', age: 58, lastVisit: '2024-01-13', condition: 'Cardiology' },
    { id: '4', name: 'Emily Davis', age: 28, lastVisit: '2024-01-12', condition: 'Mental Health' }
  ]);

  const fetchDashboardData = async () => {
    const response = await getDashboardDataApi(token);
    console.log(response);
    setDashboardData(response.data);
  };

  const handleEncounterComplete = (encounterData: any) => {
    console.log('Encounter completed:', encounterData);
    // Refresh dashboard data
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6">
      <div className="flex flex-col">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs xs:text-sm sm:text-base text-muted-foreground">
          Welcome back, here's an overview of your clinic.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
        <StatsCard
          title="Total Patients"
          value={dashboardData?.total_patients}
          icon={<Users className="h-4 w-4 xs:h-5 xs:w-5" />}
          // change={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Appointments Today"
          value={dashboardData?.todays_appointments}
          icon={<Calendar className="h-4 w-4 xs:h-5 xs:w-5" />}
          // change={{ value: 8, positive: true }}
        />
        <StatsCard
          title="Telehealth Sessions"
          value={dashboardData?.teleCount}
          icon={<Video className="h-4 w-4 xs:h-5 xs:w-5" />}
          // change={{ value: 5, positive: true }}
        />
        <StatsCard
          title="Pending Appointments"
          value={dashboardData?.pendingCount}
          icon={<HeartPulse className="h-4 w-4 xs:h-5 xs:w-5" />}
          // change={{ value: 2, positive: false }}
          className="border-health-red/50"
        />
      </div>

      {/* Quick Encounter Actions */}
      <QuickEncounterActions 
        recentPatients={recentPatients}
        onEncounterComplete={handleEncounterComplete}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-3 xs:space-y-4 sm:space-y-6">
          <PatientMonitoring />
          <RecentPatients />
        </div>
        <div className="space-y-3 xs:space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:gap-6">
            <OfficeLobby />
            <UpcomingAppointments />
          </div>
          {/*
          <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
            <StatsCard
              title="Avg. Wait Time"
              value="12 min"
              icon={<Clock className="h-4 w-4 xs:h-5 xs:w-5" />}
              change={{ value: 8, positive: true }}
            />
            <StatsCard
              title="Completed Tasks"
              value="45"
              icon={<CheckCheck className="h-4 w-4 xs:h-5 xs:w-5" />}
              change={{ value: 15, positive: true }}
            />
          </div>
           */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
