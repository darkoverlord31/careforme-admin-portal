/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Dashboard.tsx

import React, { useState, useEffect } from "react";
// *** Import Firestore modular functions and the db instance ***
import { collection, getDocs } from "firebase/firestore";

// Local imports
// *** Import the Firestore instance (db) from your firebaseConfig file ***
// Ensure this path is correct relative to this file's location
import { db } from "../firebaseConfig"; // Assuming Dashboard.tsx is in src/pages and firebaseConfig.ts is in src
// OR if your @/ alias points to src:
// import { db } from "@/firebaseConfig";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  UserRound,
  MapPin,
  Star,
  Calendar, // Not used in this component, can be removed
  Clock, // Not used in this component, can be removed
  Loader2
} from "lucide-react";
import { Button } from "react-day-picker";

// Define the doctor type (ensure this matches your Firestore document structure)
type Doctor = {
  id: string; // Firestore document ID
  name: string;
  specialty?: string; // Made optional
  city?: string; // Made optional
  rating?: number; // Made optional
  reviewCount?: number; // Made optional
  isAvailable?: boolean; // Made optional
  suspended?: boolean; // Made optional
  // Add other fields from your Firestore documents here if they exist
};

const Dashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialtyCounts, setSpecialtyCounts] = useState<Record<string, number>>({});
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null); // State to hold fetch errors


  // Fetch doctors and process data for dashboard stats
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors

         // Check if db is initialized (basic check)
         if (!db) {
           console.error("Firestore is not initialized");
           setError("Database connection error: Firestore instance not available.");
           setLoading(false);
           return;
         }

        // *** Use the imported 'db' instance and Firestore functions ***
        const doctorsCollectionRef = collection(db, "doctors"); // Get collection reference
        const snapshot = await getDocs(doctorsCollectionRef); // Fetch documents

        if (!snapshot.empty) {
          const doctorsData = snapshot.docs.map(doc => ({
            id: doc.id, // Get the document ID
            // Use default values for potentially missing fields
            name: doc.data().name || "N/A",
            specialty: doc.data().specialty || "Unspecified", // Default to "Unspecified" for counts
            city: doc.data().city || "Unspecified", // Default to "Unspecified" for counts
            rating: doc.data().rating || 0, // Default to 0
            reviewCount: doc.data().reviewCount || 0, // Default to 0
            isAvailable: doc.data().isAvailable ?? false, // Default to false if undefined/null
            suspended: doc.data().suspended ?? false, // Default to false if undefined/null
          } as Doctor)); // Cast to Doctor type

          setDoctors(doctorsData); // Set the main doctors state

          // --- Data Processing for Stats ---

          // Calculate specialty counts
          const specialtyData: Record<string, number> = {};
          doctorsData.forEach(doctor => {
             // Use the potentially defaulted specialty
             specialtyData[doctor.specialty] = (specialtyData[doctor.specialty] || 0) + 1;
          });
          setSpecialtyCounts(specialtyData);
          console.log("Specialty Counts:", specialtyData); // Debug log

          // Calculate city counts
          const cityData: Record<string, number> = {};
          doctorsData.forEach(doctor => {
             // Use the potentially defaulted city
             cityData[doctor.city] = (cityData[doctor.city] || 0) + 1;
          });
          setCityCounts(cityData);
          console.log("City Counts:", cityData); // Debug log

          // --- End of Data Processing ---

        } else {
          console.log("No doctors found in collection"); // Debug log
          setDoctors([]); // Set to empty array if no documents found
          // Clear counts if no doctors
          setSpecialtyCounts({});
          setCityCounts({});
        }
      } catch (error: any) { // Keep 'any' for now or refine error type
        console.error("Error fetching doctors:", error);
        // Set error state for display
        setError(`Failed to load dashboard data: ${error.message}`);
        // Show toast notification (optional, as error screen is shown)
        // toast({
        //   title: "Error",
        //   description: "Failed to load dashboard data: " + error.message,
        //   variant: "destructive",
        // });
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };

    // Call the fetchDoctors function when the component mounts
    fetchDoctors();

    // Effect dependencies: Empty array means this runs once on mount
  }, []); // Empty dependency array

  // Calculate active and suspended doctors count
  // Use default false for isAvailable and suspended if they are missing
  const activeDoctorsCount = doctors.filter(doctor => (doctor.isAvailable ?? false) && !(doctor.suspended ?? false)).length;
  const suspendedDoctorsCount = doctors.filter(doctor => (doctor.suspended ?? false)).length;

  // Find top rated doctor
  // Use default 0 for rating if it's missing
  const topRatedDoctor = doctors.length > 0
    ? doctors.reduce((prev, current) => ((prev.rating || 0) > (current.rating || 0)) ? prev : current)
    : null;

  // Get specialties sorted by count
  const sortedSpecialties = Object.entries(specialtyCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .slice(0, 5); // Take top 5

  // Get cities sorted by count
  const sortedCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .slice(0, 5); // Take top 5

   // Render an error message if fetching failed critically
   if (error && !loading) { // Only show error screen if not loading and there's an error
     return (
       <div className="flex flex-col items-center justify-center min-h-screen p-6">
         <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
         <p className="text-gray-700 mb-6">{error}</p>
         <Button // Assuming Button component is available globally or imported
           onClick={() => window.location.reload()} // Simple page reload to retry
           className="bg-careforme-cyan hover:bg-careforme-cyan/90" // Use theme color
         >
           Retry
         </Button>
       </div>
     );
   }


  return (
    <div className="space-y-6 p-6"> {/* Added padding */}
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          {/* Loading spinner for dashboard */}
          <Loader2 className="h-12 w-12 animate-spin text-careforme-cyan" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Doctors Card */}
            <Card className="card-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Total Doctors</CardTitle>
                <UserRound className="h-5 w-5 text-careforme-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{doctors.length}</div>
                <p className="text-sm text-muted-foreground">
                  {activeDoctorsCount} active, {suspendedDoctorsCount} suspended
                </p>
              </CardContent>
            </Card>

            {/* Specialties Card */}
            <Card className="card-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Specialties</CardTitle>
                <BarChart className="h-5 w-5 text-careforme-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Object.keys(specialtyCounts).length}</div>
                <p className="text-sm text-muted-foreground">
                  {/* Display the most common specialty, or "N/A" if no doctors */}
                  {doctors.length > 0 && sortedSpecialties.length > 0 ? `${sortedSpecialties[0]?.[0]} is most common` : "No data"}
                </p>
              </CardContent>
            </Card>

            {/* Locations Card */}
            <Card className="card-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Locations</CardTitle>
                <MapPin className="h-5 w-5 text-careforme-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Object.keys(cityCounts).length}</div>
                <p className="text-sm text-muted-foreground">
                   {doctors.length > 0 && Object.keys(cityCounts).length > 0 ? "Across different cities" : "No data"}
                </p>
              </CardContent>
            </Card>

            {/* Average Rating Card */}
            <Card className="card-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Avg Rating</CardTitle>
                <Star className="h-5 w-5 text-careforme-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {doctors.length > 0
                    ? (doctors.reduce((sum, doc) => sum + (doc.rating || 0), 0) / doctors.length).toFixed(1) // Use default 0 for rating
                    : "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">
                   {doctors.length > 0
                     ? `Based on ${doctors.reduce((sum, doc) => sum + (doc.reviewCount || 0), 0)} reviews` // Use default 0 for reviewCount
                     : "No data"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats (Specialties and Locations) */}
          <Tabs defaultValue="specialties">
            <TabsList className="mb-4">
              <TabsTrigger value="specialties">Specialties</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>

            {/* Specialties Tab Content */}
            <TabsContent value="specialties" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Doctors by Specialty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {doctors.length === 0 ? (
                      <div className="text-center text-muted-foreground">No specialty data available.</div>
                   ) : (
                      sortedSpecialties.map(([specialty, count]) => (
                         <div key={specialty} className="space-y-1">
                           <div className="flex justify-between">
                             <span className="text-sm font-medium">{specialty}</span>
                             <span className="text-sm text-muted-foreground">{count} doctor{count !== 1 ? 's' : ''}</span> {/* Pluralize "doctors" */}
                           </div>
                           {/* Ensure doctors.length is not 0 before calculating percentage */}
                           <Progress value={doctors.length > 0 ? (count / doctors.length) * 100 : 0} className="h-2" />
                         </div>
                      ))
                   )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Locations Tab Content */}
            <TabsContent value="locations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Doctors by Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {doctors.length === 0 ? (
                      <div className="text-center text-muted-foreground">No location data available.</div>
                   ) : (
                      sortedCities.map(([city, count]) => (
                         <div key={city} className="space-y-1">
                           <div className="flex justify-between">
                             <span className="text-sm font-medium">{city}</span>
                             <span className="text-sm text-muted-foreground">{count} doctor{count !== 1 ? 's' : ''}</span> {/* Pluralize "doctors" */}
                           </div>
                           {/* Ensure doctors.length is not 0 before calculating percentage */}
                           <Progress value={doctors.length > 0 ? (count / doctors.length) * 100 : 0} className="h-2" />
                         </div>
                      ))
                   )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Top Doctors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Top Rated Doctor</CardTitle>
            </CardHeader>
            {/* Conditionally render content only if topRatedDoctor exists */}
            {topRatedDoctor ? (
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {/* Display initial if no profile picture */}
                    {/* Assuming you don't have profile pictures in this data for now */}
                    <div className="h-16 w-16 rounded-full bg-careforme-cyan flex items-center justify-center text-white text-lg font-bold">
                      {topRatedDoctor.name.charAt(0).toUpperCase()} {/* Display first initial */}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{topRatedDoctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{topRatedDoctor.specialty || "Unspecified"}</p> {/* Use default "Unspecified" */}
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{topRatedDoctor.rating !== undefined ? topRatedDoctor.rating.toFixed(1) : "N/A"}</span> {/* Handle undefined rating */}
                      <span className="text-sm text-muted-foreground ml-1">
                         {topRatedDoctor.reviewCount !== undefined ? `(${topRatedDoctor.reviewCount} reviews)` : "(N/A reviews)"} {/* Handle undefined reviewCount */}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            ) : (
               <CardContent>
                  <div className="text-center text-muted-foreground">No doctor data available to determine top rated doctor.</div>
               </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
