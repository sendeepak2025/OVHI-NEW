import React, { useEffect, useState } from 'react';
import { getSinglePatientAppintmentApi } from "@/services/operations/appointment";
import { CalendarDays, Clock, MapPin, User, Info } from "lucide-react";

const GetSinglePatientAppointment = ({ id, token }) => {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointment = async () => {
    const response = await getSinglePatientAppintmentApi(id, token);
    if (response && Array.isArray(response)) {
      setAppointments(response);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, []);

  const getDayAndTime = (datetime) => {
    if (!datetime || datetime === "0000-00-00 00:00:00")
      return { day: "N/A", time: "N/A", date: "N/A" };
    const dateObj = new Date(datetime);
    const day = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const time = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const date = dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY
    return { day, time, date };
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* <h2 className="text-2xl font-bold mb-6">Patient Appointments</h2> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointments.map((appointment) => {
          const { day, time, date } = getDayAndTime(appointment.date);
          return (
            <div key={appointment.id} className="bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition p-4 space-y-3">
              {/* Top Section */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 text-center px-3 py-1 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">{day}</p>
                    <p className="text-lg font-semibold text-blue-800">{time}</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-800 flex items-center">
                      {appointment.patient?.name}
                      <span className="ml-1 text-red-500 text-sm">●</span>
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        {appointment.type}
                      </span>
                      <div className="flex items-center text-xs text-gray-600 space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.duration} mins</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  {appointment.status}
                </span>
              </div>

              {/* Reason */}
              {appointment.reason && (
                <div className="flex items-center text-sm text-gray-700 space-x-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Reason:</span>
                  <span>{appointment.reason}</span>
                </div>
              )}

              {/* Bottom Section */}
              <div className="flex items-center text-sm text-gray-600 space-x-4 pt-2 border-t pt-3">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Provider ID: {appointment.providerId}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>Location ID: {appointment.locationId}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span>{date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GetSinglePatientAppointment;
