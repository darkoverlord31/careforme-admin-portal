/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/AddEditDoctorPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// *** Import Firestore modular functions and the db instance ***
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  // You might need deleteDoc if you add delete functionality here
  // deleteDoc
} from "firebase/firestore";

// Local imports
// *** Import the Firestore instance (db) from your firebaseConfig file ***
// Ensure this path is correct relative to this file's location
import { db } from "../firebaseConfig"; // Assuming AddEditDoctorPage.tsx is in src/pages and firebaseConfig.ts is in src
// OR if your @/ alias points to src:
// import { db } from "@/firebaseConfig";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Define the doctor type (ensure this matches your Firestore document structure)
type Doctor = {
  id?: string; // ID is optional when adding
  name: string;
  specialty: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  latitude?: number; // Made optional
  longitude?: number; // Made optional
  profilePicture?: string; // Optional field
  bio?: string; // Optional field
  rating: number;
  reviewCount: number;
  availableDays?: string[]; // Optional field
  isAvailable: boolean;
  suspended: boolean;
  createdAt?: string; // Optional field, might be a Timestamp object in Firestore
};

// Define the specialties (ensure these match your mobile app and Firestore data)
const specialties = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Practice",
  "Neurology",
  "Gynecology", // Corrected spelling from original code
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Urology",
];

// Define the days of the week
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AddEditDoctorPage = () => {
  const { id } = useParams<{ id: string }>(); // Get the doctor ID from the URL
  const isEditMode = !!id; // Determine if we are in edit mode based on the ID
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set initial loading state based on mode
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false); // State for save/update operation

  // Initialize doctor state with default values for add mode
  const [doctor, setDoctor] = useState<Doctor>({
    name: "",
    specialty: "",
    city: "",
    address: "",
    email: "",
    phone: "",
    latitude: 0, // Default numeric values
    longitude: 0, // Default numeric values
    profilePicture: "",
    bio: "",
    rating: 0, // Default numeric values
    reviewCount: 0, // Default numeric values
    availableDays: [], // Default empty array
    isAvailable: true, // Default boolean
    suspended: false, // Default boolean
  });

  // Fetch doctor details if in edit mode
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!isEditMode || !id) {
        // If not in edit mode or no ID, no need to fetch
        setLoading(false);
        return;
      }

      // *** Add console log to see the ID being used ***
      console.log("Attempting to fetch doctor with ID:", id);

      try {
        setLoading(true);
        // *** Use the imported 'db' instance and Firestore functions to get a single document ***
        const doctorDocRef = doc(db, "doctors", id); // Get document reference
        const docSnapshot = await getDoc(doctorDocRef); // Fetch document snapshot

        // *** Add console log to see if the document exists ***
        console.log("Doc snapshot exists:", docSnapshot.exists());
        if (!docSnapshot.exists()) {
             console.error("Doctor document not found for ID:", id); // Log if not found
        }


        if (docSnapshot.exists()) {
          // If document exists, set the doctor state with fetched data
          // Ensure numeric fields are treated as numbers
          const data = docSnapshot.data();
          setDoctor({
            id: docSnapshot.id, // Include the ID
            name: data.name || "",
            specialty: data.specialty || "",
            city: data.city || "",
            address: data.address || "",
            email: data.email || "",
            phone: data.phone || "",
            latitude: data.latitude || 0, // Default to 0 if missing
            longitude: data.longitude || 0, // Default to 0 if missing
            profilePicture: data.profilePicture || "",
            bio: data.bio || "",
            rating: data.rating || 0, // Default to 0 if missing
            reviewCount: data.reviewCount || 0, // Default to 0 if missing
            availableDays: data.availableDays || [], // Default to empty array if missing
            isAvailable: data.isAvailable ?? true, // Default to true if missing
            suspended: data.suspended ?? false, // Default to false if missing
            createdAt: data.createdAt || undefined, // Keep as string or handle Timestamp if needed
          } as Doctor); // Cast to Doctor type
           console.log("Successfully fetched doctor data for ID:", id, data); // Log fetched data
        } else {
          // If document not found, show error and navigate back
          toast({
            title: "Error",
            description: "Doctor not found",
            variant: "destructive",
          });
          navigate("/doctors");
        }
      } catch (error: any) { // Keep 'any' for now or refine error type
        console.error("Error fetching doctor:", error);
        toast({
          title: "Error",
          description: "Failed to load doctor data: " + error.message, // Display error message
          variant: "destructive",
        });
        // Optionally navigate back or set doctor to null on error
        // setDoctor(null);
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };

    // Call the fetchDoctor function if in edit mode
    if (isEditMode) {
      fetchDoctor();
    }

    // Effect dependencies: Re-run if 'id', 'isEditMode', 'navigate', or 'toast' changes
  }, [id, isEditMode, navigate, toast]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; // Cast to HTMLInputElement for type and checked

    // Handle checkbox and switch separately
    if (type === 'checkbox') {
        // This is handled by handleDayToggle
        return;
    }
    if (type === 'checkbox' || type === 'radio') {
      // Handle boolean values from checkboxes/radios if you had them
      setDoctor({
        ...doctor,
        [name]: checked,
      });
    } else if (["rating", "reviewCount", "latitude", "longitude"].includes(name)) {
      // Convert numeric fields to numbers
      setDoctor({
        ...doctor,
        [name]: parseFloat(value) || 0, // Use parseFloat for potential decimals
      });
    } else {
      // Handle text inputs
      setDoctor({
        ...doctor,
        [name]: value,
      });
    }
  };


  // Handle specialty change (from Select component)
  const handleSpecialtyChange = (value: string) => {
    setDoctor({
      ...doctor,
      specialty: value,
    });
  };

  // Handle available days change (from Checkbox components)
  const handleDayToggle = (day: string) => {
    const updatedDays = doctor.availableDays.includes(day)
      ? doctor.availableDays.filter(d => d !== day)
      : [...doctor.availableDays, day];

    setDoctor({
      ...doctor,
      availableDays: updatedDays,
    });
  };

  // Handle availability toggle (from Switch component)
  const handleAvailabilityToggle = (checked: boolean) => {
    setDoctor({
      ...doctor,
      isAvailable: checked,
    });
  };

  // Handle form submission (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Validate form (basic validation)
      if (!doctor.name || !doctor.specialty || !doctor.email || !doctor.phone || !doctor.city || !doctor.address) {
        toast({
          title: "Error",
          description: "Please fill in all required fields (Name, Specialty, Email, Phone, City, Address)",
          variant: "destructive",
        });
        setSaving(false); // Stop saving state if validation fails
        return;
      }

      // Prepare doctor data for saving
      const doctorDataToSave: Omit<Doctor, 'id'> = { // Omit ID when saving to Firestore
        name: doctor.name,
        specialty: doctor.specialty,
        city: doctor.city,
        address: doctor.address,
        email: doctor.email,
        phone: doctor.phone,
        latitude: doctor.latitude || 0, // Ensure numeric default
        longitude: doctor.longitude || 0, // Ensure numeric default
        profilePicture: doctor.profilePicture || "", // Ensure string default
        bio: doctor.bio || "", // Ensure string default
        rating: doctor.rating || 0, // Ensure numeric default
        reviewCount: doctor.reviewCount || 0, // Ensure numeric default
        availableDays: doctor.availableDays || [], // Ensure array default
        isAvailable: doctor.isAvailable ?? true, // Ensure boolean default
        suspended: doctor.suspended ?? false, // Ensure boolean default
        // createdAt will be set on add or kept on edit
        createdAt: doctor.createdAt || new Date().toISOString(), // Set createdAt if adding
      };


      // Save to Firestore
      if (isEditMode && id) {
        // *** Update existing doctor using modular functions ***
        const doctorDocRef = doc(db, "doctors", id); // Get document reference
        await updateDoc(doctorDocRef, doctorDataToSave); // Update the document

        toast({
          title: "Success",
          description: "Doctor updated successfully",
        });
      } else {
        // *** Add new doctor using modular functions ***
        const doctorsCollectionRef = collection(db, "doctors"); // Get collection reference
        await addDoc(doctorsCollectionRef, doctorDataToSave); // Add a new document

        toast({
          title: "Success",
          description: "Doctor added successfully",
        });
      }

      // Navigate back to doctors list after successful save
      navigate("/doctors");
    } catch (error: any) { // Keep 'any' for now or refine error type
      console.error("Error saving doctor:", error);
      toast({
        title: "Error",
        description: "Failed to save doctor: " + error.message, // Display error message
        variant: "destructive",
      });
    } finally {
      setSaving(false); // Stop saving state
    }
  };

  // Display loading spinner in edit mode while fetching data
  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-careforme-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6"> {/* Added padding */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/doctors")}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Doctor" : "Add New Doctor"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Doctor Information" : "Doctor Information"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={doctor.name}
                    onChange={handleChange}
                    // *** Localized/Generic Placeholder ***
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty <span className="text-red-500">*</span></Label>
                  <Select
                    value={doctor.specialty}
                    onValueChange={handleSpecialtyChange}
                    required // Added required for Select
                  >
                    <SelectTrigger>
                      {/* *** Localized/Generic Placeholder *** */}
                      <SelectValue placeholder="Select a specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                         {/* Optional: Add a default empty option if needed, but SelectValue handles placeholder */}
                         {/* <SelectItem value="">Select a specialty</SelectItem> */}
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={doctor.email}
                    onChange={handleChange}
                    // *** Localized/Generic Placeholder ***
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={doctor.phone}
                    onChange={handleChange}
                    // *** Localized/Generic Placeholder ***
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Information</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                  <Input
                    id="city"
                    name="city"
                    value={doctor.city}
                    onChange={handleChange}
                    // *** Localized/Generic Placeholder ***
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    name="address"
                    value={doctor.address}
                    onChange={handleChange}
                    // *** Localized/Generic Placeholder ***
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    value={doctor.latitude}
                    onChange={handleChange}
                    // *** Localized/Generic Placeholder ***
                    placeholder="e.g., 40.7128"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    value={doctor.longitude}
                    onChange={handleChange}
                    // *** Localized/Generic Placeholder ***
                    placeholder="e.g., -74.0060"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Information</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={doctor.bio}
                    onChange={handleChange}
                    // *** Localized/Generic Placeholder ***
                    placeholder="Write a brief professional biography..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <Input
                    id="profilePicture"
                    name="profilePicture"
                    value={doctor.profilePicture}
                    onChange={handleChange}
                    // *** Localized/Generic Placeholder ***
                    placeholder="Enter image URL (optional)"
                  />
                </div>

                {/* Rating and Review Count */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={doctor.rating}
                      onChange={handleChange}
                      // *** Localized/Generic Placeholder ***
                      placeholder="e.g., 4.5"
                    />
                    {/* *** Disclaimer Text *** */}
                    <p className="text-sm text-muted-foreground italic">
                      So they can pay me extra for better ratings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewCount">Review Count</Label>
                    <Input
                      id="reviewCount"
                      name="reviewCount"
                      type="number"
                      min="0"
                      value={doctor.reviewCount}
                      onChange={handleChange}
                      // *** Localized/Generic Placeholder ***
                      placeholder="e.g., 24"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Availability</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    name="isAvailable" // Added name prop for consistency
                    checked={doctor.isAvailable}
                    onCheckedChange={handleAvailabilityToggle} // Use onCheckedChange for Switch
                  />
                  <Label htmlFor="isAvailable">Available for Appointments</Label>
                </div>

                <div className="space-y-2">
                  <Label>Available Days</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          // No name needed for checkbox in this case as we use handleDayToggle
                          checked={doctor.availableDays.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)} // Use onCheckedChange for Checkbox
                        />
                        <Label htmlFor={`day-${day}`}>{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/doctors")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving} // Disable button while saving
                className="bg-careforme-cyan hover:bg-careforme-cyan/90" // Use theme color
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Adding..."} {/* Updated text */}
                  </>
                ) : (
                  isEditMode ? "Update Doctor" : "Add Doctor"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEditDoctorPage;
