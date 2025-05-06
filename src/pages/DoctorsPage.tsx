/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/DoctorsPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Import necessary Firestore functions for fetching, deleting, and updating data
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";

// Local imports
// Import the Firestore instance (db) from your firebaseConfig file
// Ensure this path is correct relative to this file's location
import { db } from "../firebaseConfig"; // Assuming DoctorsPage.tsx is in src/pages and firebaseConfig.ts is in src
// OR if your @/ alias points to src:
// import { db } from "@/firebaseConfig";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Icons
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  Eye,
  CheckCircle,
} from "lucide-react";

// Define the doctor type (ensure this matches your Firestore document structure)
type Doctor = {
  id: string; // Firestore document ID
  name: string;
  specialty?: string; // Made optional
  city?: string; // Made optional
  address?: string; // Made optional
  email?: string; // Made optional
  phone?: string; // Made optional
  rating?: number; // Made optional
  reviewCount?: number; // Made optional
  isAvailable?: boolean; // Made optional
  suspended?: boolean; // Made optional
  profilePicture?: string; // Made optional
  // Add other fields from your Firestore documents here if they exist
};

// Define the specialties
const specialties = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Practice",
  "Neurology",
  "Gynecology", // Corrected spelling
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Urology",
];

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Initialize filters with 'all' instead of empty string to match Select Item values
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [doctorToSuspend, setDoctorToSuspend] = useState<Doctor | null>(null);
  const [error, setError] = useState<string | null>(null); // State to hold fetch errors
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch doctors from Firestore
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

        // Use the imported 'db' instance and Firestore functions
        const doctorsCollectionRef = collection(db, "doctors");
        const snapshot = await getDocs(doctorsCollectionRef);

        if (!snapshot.empty) {
          const doctorsData = snapshot.docs.map(doc => ({
            id: doc.id, // *** THIS IS THE KEY: Extracting the actual Firestore document ID ***
            // Use default values for potentially missing fields
            name: doc.data().name || "N/A",
            specialty: doc.data().specialty || "Unspecified",
            city: doc.data().city || "Unspecified",
            address: doc.data().address || "N/A",
            email: doc.data().email || "N/A",
            phone: doc.data().phone || "N/A",
            rating: doc.data().rating || 0,
            reviewCount: doc.data().reviewCount || 0,
            isAvailable: doc.data().isAvailable ?? false,
            suspended: doc.data().suspended ?? false,
            profilePicture: doc.data().profilePicture || "",
          } as Doctor)); // Cast to Doctor type

          setDoctors(doctorsData);
          console.log("Doctors loaded:", doctorsData.length); // Debug log
           // Log the IDs being used for verification
           console.log("Fetched Doctor IDs:", doctorsData.map(d => d.id));
        } else {
          console.log("No doctors found in collection"); // Debug log
          setDoctors([]); // Set to empty array if no documents found
        }
      } catch (error: any) {
        console.error("Error fetching doctors:", error);
        // Set error state for display
        setError(`Failed to load doctors: ${error.message}`);
        // Show toast notification
        toast({
          title: "Error",
          description: "Failed to load doctors data: " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();

    // Effect dependencies: Re-run if 'toast' changes
    // If you add filtering/sorting directly in the query, add filter states to the dependency array
  }, [toast]); // Added toast as a dependency

  // Filter doctors based on search term, specialty, and availability (client-side filtering for now)
  const filteredDoctors = doctors.filter(doctor => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" ||
                          (doctor.name && doctor.name.toLowerCase().includes(lowerSearchTerm)) ||
                          (doctor.email && doctor.email.toLowerCase().includes(lowerSearchTerm)) ||
                          (doctor.city && doctor.city.toLowerCase().includes(lowerSearchTerm));


    // Update filtering logic to check for "all" value instead of empty string
    const matchesSpecialty = specialtyFilter === "all" || (doctor.specialty && doctor.specialty === specialtyFilter);

    // Update filtering logic to check for "all" value instead of empty string
    const matchesAvailability = availabilityFilter === "all" ||
                                (availabilityFilter === "available" && (doctor.isAvailable ?? false) && !(doctor.suspended ?? false)) ||
                                (availabilityFilter === "unavailable" && !(doctor.isAvailable ?? false) && !(doctor.suspended ?? false)) ||
                                (availabilityFilter === "suspended" && (doctor.suspended ?? false));

    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  // Handle delete doctor (Firestore interaction)
  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;

    try {
      // *** Actual implementation for deleting a document ***
      const doctorDocRef = doc(db, "doctors", doctorToDelete.id);
      await deleteDoc(doctorDocRef);

      console.log("Doctor deleted:", doctorToDelete.id); // Debug log

      // Update local state after successful delete
      setDoctors(doctors.filter(doctor => doctor.id !== doctorToDelete.id));

      toast({
        title: "Success",
        description: `${doctorToDelete.name || 'Doctor'} has been deleted`, // Use default name
      });
    } catch (error: any) {
      console.error("Error deleting doctor:", error);
      toast({
        title: "Error",
        description: "Failed to delete doctor: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDoctorToDelete(null);
    }
  };

  // Handle suspend/unsuspend doctor (Firestore interaction)
  const handleToggleSuspension = async () => {
    if (!doctorToSuspend) return;

    try {
      const newSuspendedStatus = !(doctorToSuspend.suspended ?? false); // Use default false

      // *** Actual implementation for updating a document ***
      const doctorDocRef = doc(db, "doctors", doctorToSuspend.id);
      await updateDoc(doctorDocRef, { suspended: newSuspendedStatus });

      console.log( // Debug log
        "Doctor suspension status updated:",
        doctorToSuspend.id,
        "New Status:",
        newSuspendedStatus
      );

      // Update local state after successful update
      setDoctors(doctors.map(doctor =>
        doctor.id === doctorToSuspend.id
          ? { ...doctor, suspended: newSuspendedStatus }
          : doctor
      ));

      toast({
        title: "Success",
        description: `${doctorToSuspend.name || 'Doctor'} has been ${newSuspendedStatus ? "suspended" : "unsuspended"}`, // Use default name
      });
    } catch (error: any) {
      console.error("Error updating doctor suspension status:", error);
      toast({
        title: "Error",
        description: "Failed to update doctor suspension status: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDoctorToSuspend(null);
    }
  };

   // Return early if there's a critical error preventing render
   if (error && !loading) { // Only show error screen if not loading and there's an error
     return (
       <div className="flex flex-col items-center justify-center min-h-screen p-6">
         <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Doctors</h1>
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
      {/* Debug info - remove in production */}
      {/* You can uncomment this section if you need to see debug states */}
      {/*
      <div className="bg-yellow-100 p-4 rounded mb-4">
        <p className="font-medium">Debug Info:</p>
        <p>Doctors loaded: {doctors.length}</p>
        <p>Filtered doctors: {filteredDoctors.length}</p>
        <p>Loading state: {loading ? "Still loading" : "Finished loading"}</p>
        {error && <p className="text-red-600">Fetch Error: {error}</p>}
      </div>
      */}


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Button
          onClick={() => navigate("/doctors/add")}
          className="mt-4 sm:mt-0 bg-careforme-cyan hover:bg-careforme-cyan/90" // Use theme color
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or city..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {/* Changed value from "" to "all" */}
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {/* Changed value from "" to "all" */}
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
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
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Conditional rendering for loading, no doctors, or displaying doctors */}
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                       <div className="flex justify-center items-center">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-careforme-cyan"></div> {/* Use theme color */}
                         <span className="ml-2 text-muted-foreground">Loading...</span> {/* Use muted-foreground for text */}
                       </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground"> {/* Use muted-foreground */}
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    // *** Using doctor.id (the Firestore document ID) as the key and in navigate calls ***
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name || "N/A"}</TableCell> {/* Use default "N/A" */}
                      <TableCell>{doctor.specialty || "N/A"}</TableCell> {/* Use default "N/A" */}
                      <TableCell>{doctor.city || "N/A"}</TableCell> {/* Use default "N/A" */}
                      <TableCell>
                        {doctor.suspended ? ( // Use default false
                          <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                            Suspended
                          </Badge>
                        ) : (doctor.isAvailable ?? false) ? ( // Use default false
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Unavailable
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-1">{doctor.rating !== undefined ? doctor.rating.toFixed(1) : "N/A"}</span> {/* Handle undefined rating */}
                          <span className="ml-1 text-yellow-400">★</span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({doctor.reviewCount !== undefined ? doctor.reviewCount : "N/A"}) {/* Handle undefined reviewCount */}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {/* View Doctor - Uses the actual Firestore document ID */}
                            <DropdownMenuItem onClick={() => navigate(`/doctors/view/${doctor.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {/* Edit Doctor - Uses the actual Firestore document ID */}
                            <DropdownMenuItem onClick={() => navigate(`/doctors/edit/${doctor.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {/* Suspend/Unsuspend Doctor */}
                            <DropdownMenuItem onClick={() => setDoctorToSuspend(doctor)}>
                              {(doctor.suspended ?? false) ? ( // Use default false
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Unsuspend
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* Delete Doctor */}
                            <DropdownMenuItem
                              onClick={() => setDoctorToDelete(doctor)}
                              className="text-red-600 focus:text-red-700 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!doctorToDelete} onOpenChange={() => setDoctorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {doctorToDelete?.name || 'this doctor'}'s profile and cannot be undone. {/* Use default name */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDoctor}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={!!doctorToSuspend} onOpenChange={() => setDoctorToSuspend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {(doctorToSuspend?.suspended ?? false) ? "Unsuspend Doctor" : "Suspend Doctor"} {/* Use default false */}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(doctorToSuspend?.suspended ?? false)
                ? `This will unsuspend ${doctorToSuspend?.name || 'this doctor'}'s account and make it visible to patients again.` // Use default name
                : `This will suspend ${doctorToSuspend?.name || 'this doctor'}'s account and hide it from patients.`} {/* Use default name */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleSuspension}
              className={(doctorToSuspend?.suspended ?? false)
                ? "bg-green-600 hover:bg-green-700"
                : "bg-yellow-600 hover:bg-yellow-700"}
            >
              {(doctorToSuspend?.suspended ?? false) ? "Unsuspend" : "Suspend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DoctorsPage;
