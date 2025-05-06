/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ViewDoctorPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// *** Import the Firestore instance (db) from your firebaseConfig file ***
// Ensure this path is correct relative to this file's location
import { db } from "../firebaseConfig"; // Assuming ViewDoctorPage.tsx is in src/pages and firebaseConfig.ts is in src
// OR if your @/ alias points to src:
// import { db } from "@/firebaseConfig";

// *** Import necessary Firestore functions for fetching a single document ***
import { doc, getDoc } from "firebase/firestore";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Mail,
  Phone,
  CalendarDays,
  Star,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Define the doctor type (ensure this matches your Firestore document structure)
type Doctor = {
  id: string; // Firestore document ID
  name: string;
  specialty: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  latitude?: number; // Made optional, as it might not be required or always present
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

const ViewDoctorPage = () => {
  const { id } = useParams<{ id: string }>(); // Get the doctor ID from the URL
  const navigate = useNavigate();
  const { toast } = useToast();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch doctor details from Firestore
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) {
        // If there's no ID in the URL, navigate back to the doctors list
        setLoading(false);
        navigate("/doctors");
        return;
      }

      try {
        setLoading(true);
        // *** Use the imported 'db' instance and Firestore functions to get a single document ***
        // Get a reference to the specific doctor document using the ID from the URL
        const doctorDocRef = doc(db, "doctors", id);
        // Fetch the document snapshot
        const docSnapshot = await getDoc(doctorDocRef);

        if (docSnapshot.exists()) {
          // If the document exists, set the doctor state
          setDoctor({ id: docSnapshot.id, ...docSnapshot.data() } as Doctor);
        } else {
          // If the document does not exist, show an error and navigate back
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

    // Call the fetchDoctor function when the component mounts or the 'id' changes
    fetchDoctor();

    // Effect dependencies: Re-run if 'id', 'navigate', or 'toast' changes
  }, [id, navigate, toast]);

  // Display a loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-careforme-cyan" />
      </div>
    );
  }

  // Display a "Doctor not found" message if no doctor data was loaded
  if (!doctor) {
    return (
      <div className="text-center p-6"> {/* Added padding */}
        <h2 className="text-xl font-semibold">Doctor not found</h2>
        <Button
          onClick={() => navigate("/doctors")}
          className="mt-4 bg-careforme-cyan hover:bg-careforme-cyan/90"
        >
          Back to Doctors
        </Button>
      </div>
    );
  }

  // Format the creation date if it exists
  const formattedDate = doctor.createdAt
    ? new Date(doctor.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"; // Display N/A if createdAt is missing

  return (
    <div className="space-y-6 p-6"> {/* Added padding */}
      <div className="flex items-center justify-between">
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
          <h1 className="text-2xl font-bold">{doctor.name}</h1>
        </div>
        {/* Edit Profile Button */}
        <Button
          onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
          className="bg-careforme-cyan hover:bg-careforme-cyan/90"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Profile and Contact */}
        <div className="space-y-6">
          <Card className="card-shadow overflow-hidden">
            {/* Profile Header Background */}
            <div className="bg-careforme-cyan h-24 w-full"></div>
            <div className="flex flex-col items-center -mt-12 px-6 pb-6">
              {/* Profile Picture or Initial */}
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
                {doctor.profilePicture ? (
                  <img
                    src={doctor.profilePicture}
                    alt={doctor.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-careforme-cyan text-2xl font-bold text-white">
                    {doctor.name.charAt(0).toUpperCase()} {/* Display first initial */}
                  </div>
                )}
              </div>
              {/* Doctor Name and Specialty */}
              <h2 className="mt-4 text-xl font-semibold">{doctor.name}</h2>
              <p className="text-muted-foreground">{doctor.specialty}</p>

              {/* Rating and Review Count */}
              <div className="mt-2 flex items-center">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="ml-1 font-medium">{doctor.rating.toFixed(1)}</span>
                <span className="ml-1 text-sm text-muted-foreground">
                  ({doctor.reviewCount} reviews)
                </span>
              </div>

              {/* Availability/Suspended Status Badge */}
              <div className="mt-4 w-full">
                {doctor.suspended ? (
                  <Badge variant="destructive" className="w-full bg-red-500 py-1 text-center">Suspended</Badge>
                ) : doctor.isAvailable ? (
                  <Badge variant="outline" className="w-full bg-green-100 text-green-800 border-green-200 py-1 text-center">Available</Badge>
                ) : (
                  <Badge variant="outline" className="w-full bg-yellow-100 text-yellow-800 border-yellow-200 py-1 text-center">Unavailable</Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Contact Information Card */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="flex items-start">
                <Mail className="mr-3 h-5 w-5 text-careforme-cyan" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{doctor.email || "N/A"}</p> {/* Display N/A if missing */}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start">
                <Phone className="mr-3 h-5 w-5 text-careforme-cyan" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{doctor.phone || "N/A"}</p> {/* Display N/A if missing */}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-careforme-cyan" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{doctor.address || "N/A"}</p> {/* Display N/A if missing */}
                  <p className="text-sm text-muted-foreground">{doctor.city || "N/A"}</p> {/* Display N/A if missing */}
                </div>
              </div>

              {/* Coordinates (Optional) */}
              {(doctor.latitude !== undefined && doctor.longitude !== undefined) && (
                 <div className="pt-2">
                   <p className="text-sm font-medium">Coordinates</p>
                   <p className="text-sm text-muted-foreground">
                     Lat: {doctor.latitude || "N/A"}, Long: {doctor.longitude || "N/A"} {/* Display N/A if missing */}
                   </p>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details and Schedule */}
        <div className="space-y-6 md:col-span-2">
          {/* Doctor Information Card */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Biography */}
              <div>
                <h3 className="font-medium">Biography</h3>
                <p className="mt-1 text-muted-foreground">
                  {doctor.bio || "No biography provided."} {/* Display placeholder if missing */}
                </p>
              </div>

              <Separator />

              {/* Specialty */}
              <div>
                <h3 className="font-medium">Specialty</h3>
                <p className="mt-1 text-muted-foreground">{doctor.specialty || "N/A"}</p> {/* Display N/A if missing */}
              </div>

              <Separator />

              {/* Member Since */}
              <div>
                <h3 className="font-medium">Member Since</h3>
                <p className="mt-1 text-muted-foreground">{formattedDate}</p>
              </div>
            </CardContent>
          </Card>

          {/* Availability Card */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Available Days */}
                <div>
                  <h3 className="font-medium">Available Days</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {doctor.availableDays && doctor.availableDays.length > 0 ? (
                      doctor.availableDays.map((day) => (
                        <Badge key={day} variant="secondary" className="bg-careforme-cyan/10">
                          <CalendarDays className="mr-1 h-3 w-3" />
                          {day}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No available days specified.</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Status */}
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p className="mt-1 flex items-center text-muted-foreground">
                    {doctor.suspended ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                        This doctor is currently suspended and not visible to patients
                      </>
                    ) : doctor.isAvailable ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Available for new appointments
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                        Currently not accepting new appointments
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Card */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-2xl font-bold">{doctor.rating !== undefined ? doctor.rating.toFixed(1) : "N/A"}</span> {/* Handle undefined rating */}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Based on {doctor.reviewCount !== undefined ? doctor.reviewCount : "N/A"} reviews {/* Handle undefined reviewCount */}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-md bg-muted p-4 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Detailed reviews are available in the mobile app
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewDoctorPage;
