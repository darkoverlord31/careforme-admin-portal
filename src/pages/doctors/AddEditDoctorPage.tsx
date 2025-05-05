
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { firestore } from "@/lib/firebase";
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

// Define the doctor type
type Doctor = {
  id?: string;
  name: string;
  specialty: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  profilePicture: string;
  bio: string;
  rating: number;
  reviewCount: number;
  availableDays: string[];
  isAvailable: boolean;
  suspended: boolean;
  createdAt?: string;
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
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  const [doctor, setDoctor] = useState<Doctor>({
    name: "",
    specialty: "",
    city: "",
    address: "",
    email: "",
    phone: "",
    latitude: 0,
    longitude: 0,
    profilePicture: "",
    bio: "",
    rating: 0,
    reviewCount: 0,
    availableDays: [],
    isAvailable: true,
    suspended: false,
  });

  // Fetch doctor details if in edit mode
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const docSnapshot = await firestore.collection("doctors").doc(id).get();
        
        if (docSnapshot.exists) {
          setDoctor(docSnapshot.data() as Doctor);
        } else {
          toast({
            title: "Error",
            description: "Doctor not found",
            variant: "destructive",
          });
          navigate("/doctors");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
        toast({
          title: "Error",
          description: "Failed to load doctor data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id, isEditMode, navigate, toast]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if (["rating", "reviewCount", "latitude", "longitude"].includes(name)) {
      setDoctor({
        ...doctor,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setDoctor({
        ...doctor,
        [name]: value,
      });
    }
  };

  // Handle specialty change
  const handleSpecialtyChange = (value: string) => {
    setDoctor({
      ...doctor,
      specialty: value,
    });
  };

  // Handle available days change
  const handleDayToggle = (day: string) => {
    const updatedDays = doctor.availableDays.includes(day)
      ? doctor.availableDays.filter(d => d !== day)
      : [...doctor.availableDays, day];
      
    setDoctor({
      ...doctor,
      availableDays: updatedDays,
    });
  };

  // Handle availability toggle
  const handleAvailabilityToggle = (checked: boolean) => {
    setDoctor({
      ...doctor,
      isAvailable: checked,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validate form
      if (!doctor.name || !doctor.specialty || !doctor.email || !doctor.phone) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Prepare doctor data
      const doctorData = {
        ...doctor,
        createdAt: doctor.createdAt || new Date().toISOString(),
      };
      
      // Save to Firestore
      if (isEditMode && id) {
        // Update existing doctor
        await firestore.collection("doctors").doc(id).update(doctorData);
        
        toast({
          title: "Success",
          description: "Doctor updated successfully",
        });
      } else {
        // Add new doctor
        await firestore.collection("doctors").add(doctorData);
        
        toast({
          title: "Success",
          description: "Doctor added successfully",
        });
      }
      
      // Navigate back to doctors list
      navigate("/doctors");
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast({
        title: "Error",
        description: "Failed to save doctor",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-careforme-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty <span className="text-red-500">*</span></Label>
                  <Select 
                    value={doctor.specialty} 
                    onValueChange={handleSpecialtyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
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
                    placeholder="doctor@example.com"
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
                    placeholder="+1 (555) 123-4567"
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
                    placeholder="New York"
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
                    placeholder="123 Medical St, Suite 456"
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
                    placeholder="40.7128"
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
                    placeholder="-74.0060"
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
                    placeholder="Brief professional biography..."
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
                    placeholder="https://example.com/doctor-image.jpg"
                  />
                </div>
                
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
                      placeholder="4.5"
                    />
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
                      placeholder="24"
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
                    checked={doctor.isAvailable}
                    onCheckedChange={handleAvailabilityToggle}
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
                          checked={doctor.availableDays.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
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
                disabled={saving}
                className="bg-careforme-cyan hover:bg-careforme-cyan/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
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
