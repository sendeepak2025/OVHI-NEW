import { RootState } from "@/redux/store";
import { getCarePlanApi } from "@/services/operations/careplan";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GetCarePlan = ({ patientId }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [carePlans, setCarePlans] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCarePlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCarePlanApi(patientId, token);
      if (response.success) {
        setCarePlans(
          Array.isArray(response.data) ? response.data : [response.data]
        );
      } else {
        setError("Failed to fetch care plans. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching care plans:", err);
      setError("An unexpected error occurred while fetching care plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarePlans();
  }, [patientId, token]);

  const sortedPlans = [...carePlans].sort((a, b) => {
    const aDate = new Date(a.created);
    const bDate = new Date(b.created);
    return sortOrder === "newest"
      ? bDate.getTime() - aDate.getTime()
      : aDate.getTime() - bDate.getTime();
  });

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatAddress = (plan) => {
    const addressParts = [
      plan.address_line1,
      plan.address_line2,
      plan.city,
      plan.state,
      plan.country,
      plan.zip_code,
    ].filter(Boolean);
    return addressParts.join(", ");
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Patient Care Plans
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-gray-700 font-medium">Sort By:</span>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[190px] text-gray-800">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <p className="text-xl text-blue-600 animate-pulse">
            Loading care plans...
          </p>
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center h-48">
          <p className="text-xl text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && sortedPlans.length === 0 ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-xl text-gray-600">
            No care plans found for this patient.
          </p>
        </div>
      ) : (
        !loading &&
        sortedPlans.map((plan) => (
          <Card
            key={plan.id}
            className="mb-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200 ease-in-out rounded-lg overflow-hidden"
          >
            <CardHeader className="bg-white p-5 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Care Plan <span className="text-blue-600">#{plan.id}</span>
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">
                  Created:{" "}
                  {new Date(plan.created).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleExpand(plan.id)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                {expandedId === plan.id ? "Hide Details" : "View Details"}
              </Button>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {/* Always visible summary details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 mt-4 text-gray-700 text-sm">
                <div>
                  <p>
                    <strong className="font-medium text-gray-800">
                      Patient Name:
                    </strong>{" "}
                    {plan.patient_name}
                  </p>
                </div>
                <div>
                  <p>
                    <strong className="font-medium text-gray-800">
                      Risk Level:
                    </strong>{" "}
                    <span
                      className={`font-bold ${
                        plan.risk_level === "High"
                          ? "text-red-600"
                          : plan.risk_level === "Medium"
                          ? "text-yellow-700"
                          : "text-green-600"
                      }`}
                    >
                      {plan.risk_level || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Expanded details appear here in a distinct, inner card */}
              {expandedId === plan.id && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="bg-blue-50 p-6 rounded-lg shadow-inner">
                    {" "}
                    {/* Main inner card for details */}
                    <h3 className="text-xl font-bold text-blue-800 mb-5">
                      Detailed Care Plan Information
                    </h3>
                    {/* Grid for "rooms" (sub-cards/panels) - Now one column */}
                    <div className="grid grid-cols-1 gap-5">
                      {/* Patient Details Room */}
                      <Card className="p-4 bg-white shadow-sm rounded-md border border-gray-100">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-3">
                          Patient Details
                        </CardTitle>
                        <ul className="space-y-1 text-sm text-gray-800">
                          <li>
                            <strong className="text-gray-700">Email:</strong>{" "}
                            {plan.email}
                          </li>
                          <li>
                            <strong className="text-gray-700">Phone:</strong>{" "}
                            {plan.phone}
                          </li>
                          <li>
                            <strong className="text-gray-700">Gender:</strong>{" "}
                            {plan.gender}
                          </li>
                          <li>
                            <strong className="text-gray-700">Height:</strong>{" "}
                            {plan.height} cm
                          </li>
                          <li>
                            <strong className="text-gray-700">Weight:</strong>{" "}
                            {plan.weight} kg
                          </li>
                          <li>
                            <strong className="text-gray-700">BMI:</strong>{" "}
                            {plan.bmi}
                          </li>
                          <li>
                            <strong className="text-gray-700">
                              Emergency Contact:
                            </strong>{" "}
                            {plan.emergency_contact}
                          </li>
                          <li>
                            <strong className="text-gray-700">Address:</strong>{" "}
                            {formatAddress(plan)}
                          </li>
                        </ul>
                      </Card>

                      {/* Vital Signs Room */}
                      {plan.vital_signs && (
                        <Card className="p-4 bg-white shadow-sm rounded-md border border-gray-100">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-3">
                            Vital Signs
                          </CardTitle>
                          <ul className="space-y-1 text-sm text-gray-800">
                            <li>
                              <strong className="text-gray-700">
                                Heart Rate:
                              </strong>{" "}
                              {plan.vital_signs.heartRate} bpm
                            </li>
                            <li>
                              <strong className="text-gray-700">
                                Temperature:
                              </strong>{" "}
                              {plan.vital_signs.temperature} °C
                            </li>
                            <li>
                              <strong className="text-gray-700">
                                Blood Pressure:
                              </strong>{" "}
                              {plan.vital_signs.bloodPressure} mmHg
                            </li>
                            <li>
                              <strong className="text-gray-700">
                                Weight (Vitals):
                              </strong>{" "}
                              {plan.vital_signs.weight} kg
                            </li>
                          </ul>
                        </Card>
                      )}

                      {/* Diagnosis Room */}
                      {plan.diagnosis?.length > 0 && (
                        <Card className="p-4 bg-white shadow-sm rounded-md border border-gray-100">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-3">
                            Diagnosis
                          </CardTitle>
                          <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                            {plan.diagnosis.map((d) => (
                              <li key={d.id}>
                                {d.diagnosis} (
                                <span className="font-medium text-gray-600">
                                  {d.status}
                                </span>
                                ) -{" "}
                                <span className="text-gray-500">{d.icd10}</span>
                              </li>
                            ))}
                          </ul>
                        </Card>
                      )}

                      {/* Medications Room */}
                      {plan.medications?.length > 0 && (
                        <Card className="p-4 bg-white shadow-sm rounded-md border border-gray-100">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-3">
                            Medications
                          </CardTitle>
                          <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                            {plan.medications.map((m) => (
                              <li key={m.id}>
                                {m.name} -{" "}
                                <span className="font-medium text-gray-600">
                                  {m.dosage}
                                </span>{" "}
                                -{" "}
                                <span className="text-gray-500">
                                  {m.frequency}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </Card>
                      )}

                      {/* Goals Room */}
                      {plan.care_goals?.length > 0 && (
                        <Card className="p-4 bg-white shadow-sm rounded-md border border-gray-100">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-3">
                            Care Goals
                          </CardTitle>
                          <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                            {plan.care_goals.map((g) => (
                              <li key={g.id}>
                                {g.goal} - Priority:{" "}
                                <span className="font-medium text-gray-600">
                                  {g.priority}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </Card>
                      )}

                      {/* Treatment Plan & Next Appointment Room */}
                      <Card className="p-4 bg-white shadow-sm rounded-md border border-gray-100">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-3">
                          Plan Overview
                        </CardTitle>
                        <ul className="space-y-1 text-sm text-gray-800">
                          <li>
                            <strong className="text-gray-700">
                              Treatment Plan:
                            </strong>{" "}
                            {plan.treatment_plan}
                          </li>
                          <li>
                            <strong className="text-gray-700">
                              Next Appointment:
                            </strong>{" "}
                            {new Date(plan.next_appointment).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default GetCarePlan;
