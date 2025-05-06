/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ReportsPage.tsx

import React, { useState, useEffect } from "react";
// *** Import Firestore modular functions and the db instance ***
import { collection, getDocs } from "firebase/firestore";

// Local imports
// *** Import the Firestore instance (db) from your firebaseConfig file ***
// Ensure this path is correct relative to this file's location
import { db } from "../firebaseConfig"; // Assuming ReportsPage.tsx is in src/pages and firebaseConfig.ts is in src
// OR if your @/ alias points to src:
// import { db } from "@/firebaseConfig";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Download, BarChart4 } from "lucide-react";
// Import Recharts components
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Define the doctor type (ensure this matches your Firestore document structure)
type Doctor = {
  id: string; // Firestore document ID
  name: string;
  specialty?: string; // Made optional
  city?: string; // Made optional
  reviewCount?: number; // Made optional
  rating?: number; // Made optional
  isAvailable?: boolean; // Made optional
  suspended?: boolean; // Made optional
  createdAt?: string; // Made optional, might be a Timestamp object
};

// Define the specialties (ensure these match your mobile app and Firestore data)
const specialties = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Practice",
  "Neurology",
  "Obstetrics & Gynecology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Urology",
];

// COLORS for charts (ensure enough colors for your data)
const COLORS = [
  "#00bcd4", // careforme-cyan
  "#26c6da",
  "#4dd0e1",
  "#80deea",
  "#b2ebf2",
  "#e0f7fa",
  "#e91e63", // Accent pink
  "#ec407a",
  "#f06292",
  "#f48fb1",
  "#f8bbd0",
  "#fce4ec",
  "#a5d6a7", // Light green
  "#ffcc80", // Light orange
  "#ef9a9a", // Light red
  "#c5e1a5", // Lighter green
  "#ffe0b2", // Lighter orange
  "#ffcdd2", // Lighter red
];

const ReportsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // *** Filters are initialized to "all" to match the Select Item values in Tabular data ***
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [specialtyData, setSpecialtyData] = useState<any[]>([]); // Data for specialty distribution chart
  const [cityData, setCityData] = useState<any[]>([]); // Data for city distribution chart
  const [locations, setLocations] = useState<string[]>([]); // List of unique cities for location filter
  const [statusData, setStatusData] = useState<any[]>([]); // Data for doctor status chart
  const [monthlyData, setMonthlyData] = useState<any[]>([]); // Data for monthly registrations chart
  const [error, setError] = useState<string | null>(null); // State to hold fetch errors


  // Fetch doctors and process data for charts
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
            specialty: doc.data().specialty || "N/A",
            city: doc.data().city || "N/A",
            reviewCount: doc.data().reviewCount || 0, // Default to 0
            rating: doc.data().rating || 0, // Default to 0
            isAvailable: doc.data().isAvailable ?? false, // Default to false if undefined/null
            suspended: doc.data().suspended ?? false, // Default to false if undefined/null
            createdAt: doc.data().createdAt || undefined, // Keep as undefined if missing
          } as Doctor)); // Cast to Doctor type

          setDoctors(doctorsData); // Set the main doctors state

          // --- Data Processing for Charts and Filters ---

          // Extract unique locations for the filter
          const uniqueLocations = Array.from(new Set(doctorsData.map(doc => doc.city).filter(city => city && city !== "N/A"))); // Filter out empty strings and "N/A"
          setLocations(uniqueLocations);

          // Calculate specialty data for charts
          const specialtyCounts: Record<string, number> = {};
          doctorsData.forEach(doctor => {
             if (doctor.specialty && doctor.specialty !== "N/A") { // Ensure specialty exists and is not "N/A"
                specialtyCounts[doctor.specialty] = (specialtyCounts[doctor.specialty] || 0) + 1;
             } else {
                 // Count doctors with no specialty for the chart if needed
                 specialtyCounts["Unspecified"] = (specialtyCounts["Unspecified"] || 0) + 1;
             }
          });

          const specialtyChartData = Object.entries(specialtyCounts).map(([name, value]) => ({
            name,
            value,
          }));
          setSpecialtyData(specialtyChartData);
          console.log("Specialty Chart Data:", specialtyChartData); // Debug log

          // Calculate city data for charts
          const cityCounts: Record<string, number> = {};
          doctorsData.forEach(doctor => {
             if (doctor.city && doctor.city !== "N/A") { // Ensure city exists and is not "N/A"
                cityCounts[doctor.city] = (cityCounts[doctor.city] || 0) + 1;
             } else {
                 // Count doctors with no city for the chart if needed
                 cityCounts["Unspecified"] = (cityCounts["Unspecified"] || 0) + 1;
             }
          });

          const cityChartData = Object.entries(cityCounts).map(([name, value]) => ({
            name,
            value,
          }));
          setCityData(cityChartData);
          console.log("City Chart Data:", cityChartData); // Debug log


          // Calculate status data for charts
          const active = doctorsData.filter(d => d.isAvailable && !d.suspended).length; // Use default false if missing
          const unavailable = doctorsData.filter(d => !d.isAvailable && !d.suspended).length; // Use default false if missing
          const suspended = doctorsData.filter(d => d.suspended).length; // Use default false if missing


          setStatusData([
            { name: "Active", value: active },
            { name: "Unavailable", value: unavailable },
            { name: "Suspended", value: suspended },
          ]);
          console.log("Status Chart Data:", statusData); // Debug log

          // Calculate monthly registration data for charts (for the current year)
          const monthlyRegistrations: Record<string, number> = {};
          const now = new Date();
          const currentYear = now.getFullYear();
          const monthNames = [
             'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];

          // Initialize counts for all months of the current year
          monthNames.forEach(month => {
              monthlyRegistrations[month] = 0;
          });

          // Count registrations by month for the current year
          doctorsData.forEach(doctor => {
             // Check if createdAt exists and is a valid date string
             if (doctor.createdAt) {
                try {
                   const createdDate = new Date(doctor.createdAt);
                    // Check if the date is valid and in the current year
                   if (!isNaN(createdDate.getTime()) && createdDate.getFullYear() === currentYear) {
                      const monthIndex = createdDate.getMonth(); // 0 for January, 11 for December
                      const monthName = monthNames[monthIndex];
                      monthlyRegistrations[monthName]++;
                   }
                } catch (e) {
                   console.error("Invalid createdAt date for doctor:", doctor.id, doctor.createdAt, e);
                }
             }
          });

          // Convert monthly counts to chart data format, ensuring all months are included
          const monthlyChartData = monthNames.map(month => ({
              name: month,
              value: monthlyRegistrations[month] || 0 // Use 0 if no registrations in a month
          }));

          setMonthlyData(monthlyChartData);
          console.log("Monthly Chart Data:", monthlyChartData); // Debug log


          // --- End of Data Processing ---

        } else {
          console.log("No doctors found in collection"); // Debug log
          setDoctors([]); // Set to empty array if no documents found
          // Clear chart data if no doctors
          setSpecialtyData([]);
          setCityData([]);
          setLocations([]);
          setStatusData([]);
          setMonthlyData([]);
        }
      } catch (error: any) { // Keep 'any' for now or refine error type
        console.error("Error fetching doctors:", error);
        // Set error state for display
        setError(`Failed to load reports: ${error.message}`);
        // Show toast notification (optional, as error screen is shown)
        // toast({
        //   title: "Error",
        //   description: "Failed to load reports data: " + error.message,
        //   variant: "destructive",
        // });
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };

    // Call the fetchDoctors function when the component mounts
    fetchDoctors();

    // Effect dependencies: Empty array means this runs once on mount
    // If you add filtering/sorting directly in the query, add filter states to the dependency array
  }, []); // Empty dependency array

  // Filter doctors based on search term, specialty, and location (client-side filtering)
  const filteredDoctors = doctors.filter(doctor => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    // Check if name or specialty includes the search term
    const matchesSearch = searchTerm === "" ||
                          (doctor.name && doctor.name.toLowerCase().includes(lowerSearchTerm)) || // Check if name exists
                          (doctor.specialty && doctor.specialty.toLowerCase().includes(lowerSearchTerm)); // Check if specialty exists


    // *** Update filtering logic to check for "all" value instead of empty string ***
    const matchesSpecialty = specialtyFilter === "all" || (doctor.specialty && doctor.specialty === specialtyFilter); // Check if specialty exists

    // *** Update filtering logic to check for "all" value instead of empty string ***
    const matchesLocation = locationFilter === "all" || (doctor.city && doctor.city === locationFilter); // Check if city exists


    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  // Handle exporting filtered data to CSV
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Name", "Specialty", "City", "Rating", "Reviews", "Available", "Suspended"];
    const rows = filteredDoctors.map(doctor => [
      // Ensure values are strings and handle potential commas in data by quoting
      `"${(doctor.name || '').replace(/"/g, '""')}"`, // Quote and escape quotes in name, default to empty string
      `"${(doctor.specialty || '').replace(/"/g, '""')}"`, // Quote and escape quotes in specialty, default to empty string
      `"${(doctor.city || '').replace(/"/g, '""')}"`, // Quote and escape quotes in city, default to empty string
      doctor.rating !== undefined ? doctor.rating.toFixed(1) : "N/A", // Handle undefined rating
      doctor.reviewCount !== undefined ? doctor.reviewCount : "N/A", // Handle undefined reviewCount
      doctor.isAvailable ? "Yes" : "No", // Handle undefined with default false
      doctor.suspended ? "Yes" : "No" // Handle undefined with default false
    ]);

    const csvContent = [
      headers.join(","), // Join headers with comma
      ...rows.map(row => row.join(",")) // Join each row's values with comma
    ].join("\n"); // Join rows with newline character

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "doctors_report.csv"; // File name
    link.style.display = "none"; // Hide the link
    document.body.appendChild(link); // Append to body
    link.click(); // Simulate click to trigger download
    document.body.removeChild(link); // Clean up
  };

  // Render an error message if fetching failed critically
  if (error && !loading) { // Only show error screen if not loading and there's an error
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Reports</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button
          onClick={handleExportCSV}
          className="mt-4 sm:mt-0 bg-careforme-cyan hover:bg-careforme-cyan/90" // Use theme color
          disabled={filteredDoctors.length === 0 || loading} // Disable if no filtered data or still loading
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="charts">
        <TabsList className="mb-4">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="tabular">Tabular Data</TabsTrigger>
        </TabsList>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          {loading ? (
            <div className="flex h-64 w-full items-center justify-center">
              {/* Loading spinner for charts */}
              <Loader2 className="h-12 w-12 animate-spin text-careforme-cyan" />
            </div>
          ) : (
            <>
              {/* Display a message if no data is available for charts */}
              {doctors.length === 0 ? (
                 <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
                    No doctor data available to generate charts.
                 </div>
              ) : (
                 <div className="grid gap-6 md:grid-cols-2">
                   {/* Doctors by Specialty Chart */}
                   <Card className="card-shadow">
                     <CardHeader>
                       <CardTitle className="text-lg">Doctors by Specialty</CardTitle>
                     </CardHeader>
                     <CardContent className="h-80">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={specialtyData}
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={2}
                             dataKey="value"
                             nameKey="name"
                             label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                             labelLine={false}
                           >
                             {/* Ensure specialtyData has entries before mapping */}
                             {specialtyData.map((entry, index) => (
                               <Cell key={`cell-specialty-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <Tooltip formatter={(value) => [`${value} doctors`, 'Count']} />
                           <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                         </PieChart>
                       </ResponsiveContainer>
                     </CardContent>
                   </Card>

                   {/* Doctors by Location Chart */}
                   <Card className="card-shadow">
                     <CardHeader>
                       <CardTitle className="text-lg">Doctors by Location</CardTitle>
                     </CardHeader>
                     <CardContent className="h-80">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={cityData}
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={2}
                             dataKey="value"
                             nameKey="name"
                             label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                             labelLine={false}
                           >
                             {/* Ensure cityData has entries before mapping */}
                             {cityData.map((entry, index) => (
                               <Cell key={`cell-city-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <Tooltip formatter={(value) => [`${value} doctors`, 'Count']} />
                           <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                         </PieChart>
                       </ResponsiveContainer>
                     </CardContent>
                   </Card>

                   {/* Doctor Status Chart */}
                   <Card className="card-shadow">
                     <CardHeader>
                       <CardTitle className="text-lg">Doctor Status</CardTitle>
                     </CardHeader>
                     <CardContent className="h-80">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={statusData}
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={2}
                             dataKey="value"
                             nameKey="name"
                             label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                             labelLine={false}
                           >
                             {/* Assign specific colors to status segments */}
                             {/* Ensure statusData has entries before mapping */}
                             {statusData.map((entry, index) => {
                                let color = COLORS[index % COLORS.length]; // Default color
                                if (entry.name === "Active") color = "#4caf50";
                                else if (entry.name === "Unavailable") color = "#ff9800";
                                else if (entry.name === "Suspended") color = "#f44336";
                                return <Cell key={`cell-status-${index}`} fill={color} />;
                             })}
                           </Pie>
                           <Tooltip formatter={(value) => [`${value} doctors`, 'Count']} />
                           <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                         </PieChart>
                       </ResponsiveContainer>
                     </CardContent>
                   </Card>

                   {/* Monthly Registrations Chart */}
                   <Card className="card-shadow">
                     <CardHeader>
                       <CardTitle className="text-lg">Monthly Doctor Registrations ({new Date().getFullYear()})</CardTitle> {/* Added current year */}
                     </CardHeader>
                     <CardContent className="h-80">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart
                           data={monthlyData}
                           margin={{
                             top: 20,
                             right: 30,
                             left: 20,
                             bottom: 5, // Adjusted bottom margin
                           }}
                         >
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis dataKey="name" />
                           <YAxis allowDecimals={false} label={{ value: 'Number of Doctors', angle: -90, position: 'insideLeft' }} /> {/* Added YAxis label */}
                           <Tooltip formatter={(value) => [`${value} doctors`, 'Registrations']} />
                           {/* <Legend /> // Legend is optional for a single bar series */}
                           <Bar dataKey="value" name="Registrations" fill="#00bcd4" /> {/* Use theme color */}
                         </BarChart>
                       </ResponsiveContainer>
                     </CardContent>
                   </Card>
                 </div>
              )}


               {/* Summary Statistics Card */}
               <Card className="card-shadow">
                 <CardHeader>
                   <CardTitle className="text-lg">Summary Statistics</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="grid gap-4 md:grid-cols-3">
                     {/* Total Doctors */}
                     <div className="rounded-md bg-muted p-4 text-center">
                       <p className="text-sm font-medium text-muted-foreground">Total Doctors</p>
                       <p className="mt-2 text-3xl font-bold text-careforme-cyan">{doctors.length}</p>
                     </div>

                     {/* Available Doctors */}
                     <div className="rounded-md bg-muted p-4 text-center">
                       <p className="text-sm font-medium text-muted-foreground">Available Doctors</p>
                       <p className="mt-2 text-3xl font-bold text-careforme-cyan">
                         {doctors.filter(d => d.isAvailable && !d.suspended).length} {/* Use default false */}
                       </p>
                     </div>

                     {/* Average Rating */}
                     <div className="rounded-md bg-muted p-4 text-center">
                       <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                       <p className="mt-2 text-3xl font-bold text-careforme-cyan">
                         {doctors.length > 0
                           ? (doctors.reduce((sum, doc) => sum + (doc.rating || 0), 0) / doctors.length).toFixed(1) // Use default 0 for rating
                           : "N/A"}
                       </p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
            </>
          )}
        </TabsContent>

        {/* Tabular Data Tab */}
        <TabsContent value="tabular">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Doctor Data Table</CardTitle> {/* Updated title */}
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or specialty..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  {/* Specialty Filter */}
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {/* *** Changed value from "" to "all" *** */}
                        <SelectItem value="all">All Specialties</SelectItem>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {/* Location Filter */}
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                         {/* *** Changed value from "" to "all" *** */}
                        <SelectItem value="all">All Locations</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto for responsiveness */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                           {/* Loading spinner for table */}
                           <div className="flex justify-center items-center">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-careforme-cyan"></div> {/* Use theme color */}
                             <span className="ml-2 text-muted-foreground">Loading...</span> {/* Use muted-foreground */}
                           </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredDoctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground"> {/* Use muted-foreground */}
                          No doctors found matching the criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell className="font-medium">{doctor.name || "N/A"}</TableCell> {/* Use default "N/A" */}
                          <TableCell>{doctor.specialty || "N/A"}</TableCell> {/* Use default "N/A" */}
                          <TableCell>{doctor.city || "N/A"}</TableCell> {/* Use default "N/A" */}
                          <TableCell>
                            <div className="flex items-center">
                              <span>{doctor.rating !== undefined ? doctor.rating.toFixed(1) : "N/A"}</span> {/* Handle undefined rating */}
                              <span className="ml-1 text-yellow-400">★</span>
                            </div>
                          </TableCell>
                          <TableCell>{doctor.reviewCount !== undefined ? doctor.reviewCount : "N/A"}</TableCell> {/* Handle undefined reviewCount */}
                          <TableCell>
                            {doctor.suspended ? ( // Use default false
                              <span className="text-red-500">Suspended</span>
                            ) : doctor.isAvailable ? ( // Use default false
                              <span className="text-green-500">Available</span>
                            ) : (
                              <span className="text-yellow-500">Unavailable</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Showing {filteredDoctors.length} of {doctors.length} doctors
                </div>
                <div className="flex items-center">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  <span>
                    {specialtyFilter !== "all" || locationFilter !== "all" // Check for "all"
                      ? "Filtered report"
                      : "Full report"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
