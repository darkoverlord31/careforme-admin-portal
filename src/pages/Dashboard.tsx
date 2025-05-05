
import React, { useState, useEffect } from "react";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  UserRound, 
  MapPin, 
  Star, 
  Calendar, 
  Clock,
  Loader2
} from "lucide-react";

// Define the doctor type
type Doctor = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  suspended: boolean;
};

const Dashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialtyCounts, setSpecialtyCounts] = useState<Record<string, number>>({});
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const snapshot = await firestore.collection("doctors").get();
        
        if (!snapshot.empty) {
          const doctorsData = snapshot.docs.map(doc => doc.data() as Doctor);
          setDoctors(doctorsData);
          
          // Calculate specialty counts
          const specialtyData: Record<string, number> = {};
          doctorsData.forEach(doctor => {
            if (specialtyData[doctor.specialty]) {
              specialtyData[doctor.specialty]++;
            } else {
              specialtyData[doctor.specialty] = 1;
            }
          });
          setSpecialtyCounts(specialtyData);
          
          // Calculate city counts
          const cityData: Record<string, number> = {};
          doctorsData.forEach(doctor => {
            if (cityData[doctor.city]) {
              cityData[doctor.city]++;
            } else {
              cityData[doctor.city] = 1;
            }
          });
          setCityCounts(cityData);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Calculate active and suspended doctors count
  const activeDoctorsCount = doctors.filter(doctor => !doctor.suspended).length;
  const suspendedDoctorsCount = doctors.filter(doctor => doctor.suspended).length;
  
  // Find top rated doctor
  const topRatedDoctor = doctors.length > 0 
    ? doctors.reduce((prev, current) => (prev.rating > current.rating) ? prev : current) 
    : null;

  // Get specialties sorted by count
  const sortedSpecialties = Object.entries(specialtyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Get cities sorted by count
  const sortedCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-careforme-cyan" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            
            <Card className="card-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Specialties</CardTitle>
                <BarChart className="h-5 w-5 text-careforme-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Object.keys(specialtyCounts).length}</div>
                <p className="text-sm text-muted-foreground">
                  {sortedSpecialties[0]?.[0]} is most common
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Locations</CardTitle>
                <MapPin className="h-5 w-5 text-careforme-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Object.keys(cityCounts).length}</div>
                <p className="text-sm text-muted-foreground">
                  Across different cities
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Avg Rating</CardTitle>
                <Star className="h-5 w-5 text-careforme-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {doctors.length > 0 
                    ? (doctors.reduce((sum, doc) => sum + doc.rating, 0) / doctors.length).toFixed(1)
                    : "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {doctors.reduce((sum, doc) => sum + doc.reviewCount, 0)} reviews
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Stats */}
          <Tabs defaultValue="specialties">
            <TabsList className="mb-4">
              <TabsTrigger value="specialties">Specialties</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="specialties" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Doctors by Specialty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sortedSpecialties.map(([specialty, count]) => (
                    <div key={specialty} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{specialty}</span>
                        <span className="text-sm text-muted-foreground">{count} doctors</span>
                      </div>
                      <Progress value={(count / doctors.length) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="locations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Doctors by Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sortedCities.map(([city, count]) => (
                    <div key={city} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{city}</span>
                        <span className="text-sm text-muted-foreground">{count} doctors</span>
                      </div>
                      <Progress value={(count / doctors.length) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Top Doctors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Top Rated Doctor</CardTitle>
            </CardHeader>
            {topRatedDoctor && (
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-careforme-cyan flex items-center justify-center text-white text-lg font-bold">
                      {topRatedDoctor.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{topRatedDoctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{topRatedDoctor.specialty}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{topRatedDoctor.rating}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({topRatedDoctor.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
