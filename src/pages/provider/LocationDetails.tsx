import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus, XCircle } from "lucide-react"; // Added XCircle for close button
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  createProviderLocation,
  getLocationsByProviderId,
  updateProviderLocation,
  deleteProviderLocation,
} from "@/services/operations/location";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Define the Location interface
interface Location {
  location_id: number;
  provider_id: string;
  location_name: string;
  location_address_line1: string;
  location_address_line2?: string;
  location_state: string;
  location_country: string;
  location_phone: string;
  location_zip_code?: string;
  created: string;
}

// Main LocationManager functional component
const LocationManager: React.FC = () => {
  // Redux state for user and token
  const { user, token } = useSelector((state: RootState) => state.auth);

  // State for controlling the visibility of the create/edit form dialog
  const [showForm, setShowForm] = useState(false);
  // State for controlling the visibility of the delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // State to store the ID of the location to be deleted
  const [locationToDeleteId, setLocationToDeleteId] = useState<number | null>(
    null
  );

  // Initial state for the form data
  const initialState = {
    provider_id: user?.id || "", // Provider ID is derived from user and not user-editable
    location_name: "",
    location_address_line1: "",
    location_address_line2: "",
    location_state: "",
    location_country: "",
    location_phone: "",
    location_zip_code: "",
  };

  // State for managing form input values
  const [formData, setFormData] = useState(initialState);
  // State for storing the list of locations fetched from the API
  const [locations, setLocations] = useState<Location[]>([]);
  // State to store the ID of the location being edited (null for new location)
  const [editId, setEditId] = useState<number | null>(null);

  /**
   * Handles changes to the form input fields.
   * @param e The change event from the input element.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Fetches the list of locations associated with the current provider.
   */
  const fetchLocations = async () => {
    if (!user?.id || !token) {
      console.error("User ID or token is missing. Cannot fetch locations.");
      return;
    }
    const data = await getLocationsByProviderId(user.id, token);
    if (data) {
      setLocations(data);
    } else {
      console.error("Failed to fetch locations.");
    }
  };

  /**
   * Handles the submission of the create/edit form.
   * Calls either createProviderLocation or updateProviderLocation based on `editId`.
   */
  const handleSubmit = async () => {
    if (!token) {
      console.error("Authentication token is missing. Cannot submit form.");
      return;
    }

    let success = false;
    if (editId) {
      // Update existing location
      success = await updateProviderLocation(
        { ...formData, location_id: editId },
        token
      );
    } else {
      // Create new location
      success = await createProviderLocation(formData, token);
    }

    if (success) {
      fetchLocations(); // Refresh the list of locations
      setFormData({ ...initialState, provider_id: user?.id || "" }); // Reset form
      setEditId(null); // Clear edit ID
      setShowForm(false); // Close the form dialog
    } else {
      console.error(`Failed to ${editId ? "update" : "create"} location.`);
    }
  };

  /**
   * Sets up the form for editing an existing location.
   * @param loc The location object to be edited.
   */
  const handleEdit = (loc: Location) => {
    setFormData({
      provider_id: loc.provider_id,
      location_name: loc.location_name,
      location_address_line1: loc.location_address_line1,
      location_address_line2: loc.location_address_line2 || "",
      location_state: loc.location_state,
      location_country: loc.location_country,
      location_phone: loc.location_phone,
      location_zip_code: loc.location_zip_code || "",
    });
    setEditId(loc.location_id); // Set the ID of the location being edited
    setShowForm(true); // Open the form dialog
  };

  /**
   * Initiates the delete process by opening the confirmation dialog.
   * @param id The ID of the location to be deleted.
   */
  const handleDeleteInitiate = (id: number) => {
    setLocationToDeleteId(id); // Store the ID of the location to be deleted
    setShowDeleteConfirm(true); // Show the confirmation dialog
  };

  /**
   * Executes the deletion of a location after user confirmation.
   */
  const handleDeleteConfirm = async () => {
    if (!token || locationToDeleteId === null) {
      console.error(
        "Authentication token or location ID missing. Cannot delete."
      );
      return;
    }

    const success = await deleteProviderLocation(locationToDeleteId, token);
    if (success) {
      fetchLocations(); // Refresh the list of locations
    } else {
      console.error("Failed to delete location.");
    }
    setShowDeleteConfirm(false); // Close the confirmation dialog
    setLocationToDeleteId(null); // Clear the stored location ID
  };

  // Effect hook to fetch locations when the component mounts or user/token changes
  useEffect(() => {
    fetchLocations();
  }, [user?.id, token]); // Depend on user.id and token to refetch if they change

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 font-inter">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        {/* Header and Create New Location Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Locations</h1>
          <Button
            onClick={() => {
              setEditId(null); // Ensure no edit ID is set for new creation
              setFormData({ ...initialState, provider_id: user?.id || "" }); // Reset form data
              setShowForm(true); // Open the form dialog
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md px-6 py-3 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Location</span>
          </Button>
        </div>

        {/* Create/Edit Location Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl bg-white p-6 rounded-xl shadow-xl border border-gray-200">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                {editId ? (
                  <>
                    <Pencil className="w-6 h-6 text-blue-600" />
                    Edit Location
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-green-600" />
                    Create New Location
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Please fill in the required fields to{" "}
                {editId ? "update" : "create"} a provider location.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">
              {/* Map over formData, but exclude provider_id from rendering */}
              {Object.entries(formData).map(
                ([key, value]) =>
                  key !== "provider_id" && (
                    <div key={key} className="flex flex-col space-y-1">
                      <label
                        htmlFor={key}
                        className="text-sm font-medium text-gray-700 capitalize"
                      >
                        {key.replace(/_/g, " ")}:
                      </label>
                      <Input
                        id={key}
                        name={key}
                        value={value}
                        onChange={handleChange}
                        placeholder={key
                          .replace(/_/g, " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                      />
                    </div>
                  )
              )}
            </div>

            <DialogFooter className="mt-6 flex justify-end">
              <Button
                onClick={handleSubmit}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md px-6 py-3 transition duration-300 ease-in-out transform hover:scale-105"
              >
                {editId ? "Update Location" : "Create Location"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* All Locations Card */}
        <Card className="bg-white rounded-xl shadow-lg border border-gray-200">
          <CardHeader className="border-b border-gray-200 p-6">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              All Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-6">
            {locations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No locations found. Click "Create New Location" to add one.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map((loc, i) => (
                    <tr
                      key={loc.location_id}
                      className="hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {i + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {loc.location_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {loc.location_address_line1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {loc.location_state}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {loc.location_phone}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(loc)}
                          className="text-blue-600 hover:text-blue-800 border-blue-600 hover:border-blue-800 rounded-full p-2 transition duration-200 ease-in-out transform hover:scale-110"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteInitiate(loc.location_id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition duration-200 ease-in-out transform hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md bg-white p-6 rounded-xl shadow-xl border border-gray-200">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete this location? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md px-5 py-2 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LocationManager;
