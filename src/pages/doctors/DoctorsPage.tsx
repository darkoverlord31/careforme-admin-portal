
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
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

// Define the doctor type
type Doctor = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  suspended: boolean;
  profilePicture?: string;
};

// Define the specialties
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

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [doctorToSuspend, setDoctorToSuspend] = useState<Doctor | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch doctors from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const snapshot = await firestore.collection("doctors").get();
        
        if (!snapshot.empty) {
          const doctorsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Doctor));
          
          setDoctors(doctorsData);
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast({
          title: "Error",
          description: "Failed to load doctors data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  // Filter doctors based on search term, specialty, and availability
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = specialtyFilter === "" || doctor.specialty === specialtyFilter;
    
    const matchesAvailability = availabilityFilter === "" || 
                              (availabilityFilter === "available" && doctor.isAvailable && !doctor.suspended) ||
                              (availabilityFilter === "unavailable" && !doctor.isAvailable && !doctor.suspended) ||
                              (availabilityFilter === "suspended" && doctor.suspended);
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  // Handle delete doctor
  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    
    try {
      await firestore.collection("doctors").doc(doctorToDelete.id).delete();
      
      setDoctors(doctors.filter(doctor => doctor.id !== doctorToDelete.id));
      
      toast({
        title: "Success",
        description: `${doctorToDelete.name} has been deleted`,
      });
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    } finally {
      setDoctorToDelete(null);
    }
  };

  // Handle suspend/unsuspend doctor
  const handleToggleSuspension = async () => {
    if (!doctorToSuspend) return;
    
    try {
      const newSuspendedStatus = !doctorToSuspend.suspended;
      
      await firestore.collection("doctors").doc(doctorToSuspend.id).update({
        suspended: newSuspendedStatus
      });
      
      setDoctors(doctors.map(doctor => 
        doctor.id === doctorToSuspend.id 
          ? { ...doctor, suspended: newSuspendedStatus } 
          : doctor
      ));
      
      toast({
        title: "Success",
        description: `${doctorToSuspend.name} has been ${newSuspendedStatus ? "suspended" : "unsuspended"}`,
      });
    } catch (error) {
      console.error("Error updating doctor suspension status:", error);
      toast({
        title: "Error",
        description: "Failed to update doctor suspension status",
        variant: "destructive",
      });
    } finally {
      setDoctorToSuspend(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Button 
          onClick={() => navigate("/doctors/add")}
          className="mt-4 sm:mt-0 bg-careforme-cyan hover:bg-careforme-cyan/90"
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
                    <SelectItem value="">All Specialties</SelectItem>
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
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.city}</TableCell>
                      <TableCell>
                        {doctor.suspended ? (
                          <Badge variant="destructive" className="bg-red-500">Suspended</Badge>
                        ) : doctor.isAvailable ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Unavailable</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-1">{doctor.rating.toFixed(1)}</span>
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({doctor.reviewCount})
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
                            <DropdownMenuItem onClick={() => navigate(`/doctors/view/${doctor.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/doctors/edit/${doctor.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDoctorToSuspend(doctor)}>
                              {doctor.suspended ? (
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
                            <DropdownMenuItem 
                              onClick={() => setDoctorToDelete(doctor)}
                              className="text-red-600"
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
              This will permanently delete {doctorToDelete?.name}'s profile and cannot be undone.
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
              {doctorToSuspend?.suspended ? "Unsuspend Doctor" : "Suspend Doctor"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {doctorToSuspend?.suspended
                ? `This will unsuspend ${doctorToSuspend?.name}'s account and make it visible to patients again.`
                : `This will suspend ${doctorToSuspend?.name}'s account and hide it from patients.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleSuspension}
              className={doctorToSuspend?.suspended ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}
            >
              {doctorToSuspend?.suspended ? "Unsuspend" : "Suspend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DoctorsPage;
