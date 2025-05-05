
import React, { useState, useEffect } from "react";
import { firestore } from "@/lib/firebase";
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Define the doctor type
type Doctor = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  reviewCount: number;
  rating: number;
  isAvailable: boolean;
  suspended: boolean;
  createdAt: string;
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

// COLORS for charts
const COLORS = [
  "#00bcd4", // Primary cyan
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
];

const ReportsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [specialtyData, setSpecialtyData] = useState<any[]>([]);
  const [cityData, setCityData] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  // Fetch doctors
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
          
          // Extract unique locations
          const uniqueLocations = Array.from(new Set(doctorsData.map(doc => doc.city)));
          setLocations(uniqueLocations);
          
          // Calculate specialty data for charts
          const specialtyCounts: Record<string, number> = {};
          doctorsData.forEach(doctor => {
            if (specialtyCounts[doctor.specialty]) {
              specialtyCounts[doctor.specialty]++;
            } else {
              specialtyCounts[doctor.specialty] = 1;
            }
          });
          
          const specialtyChartData = Object.entries(specialtyCounts).map(([name, value]) => ({
            name,
            value,
          }));
          setSpecialtyData(specialtyChartData);
          
          // Calculate city data for charts
          const cityCounts: Record<string, number> = {};
          doctorsData.forEach(doctor => {
            if (cityCounts[doctor.city]) {
              cityCounts[doctor.city]++;
            } else {
              cityCounts[doctor.city] = 1;
            }
          });
          
          const cityChartData = Object.entries(cityCounts).map(([name, value]) => ({
            name,
            value,
          }));
          setCityData(cityChartData);
          
          // Calculate status data
          const active = doctorsData.filter(d => !d.suspended && d.isAvailable).length;
          const unavailable = doctorsData.filter(d => !d.suspended && !d.isAvailable).length;
          const suspended = doctorsData.filter(d => d.suspended).length;
          
          setStatusData([
            { name: "Active", value: active },
            { name: "Unavailable", value: unavailable },
            { name: "Suspended", value: suspended },
          ]);
          
          // Calculate monthly data
          const monthlyRegistrations: Record<string, number> = {};
          const now = new Date();
          const currentYear = now.getFullYear();
          
          // Initialize months
          for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            monthlyRegistrations[monthName] = 0;
          }
          
          // Count registrations by month
          doctorsData.forEach(doctor => {
            const createdDate = new Date(doctor.createdAt);
            if (createdDate.getFullYear() === currentYear) {
              const monthName = createdDate.toLocaleString('default', { month: 'short' });
              monthlyRegistrations[monthName]++;
            }
          });
          
          const monthlyChartData = Object.entries(monthlyRegistrations).map(([name, value]) => ({
            name,
            value,
          }));
          setMonthlyData(monthlyChartData);
          
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter doctors based on search term, specialty, and location
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchTerm === "" || 
                         doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = specialtyFilter === "" || doctor.specialty === specialtyFilter;
    
    const matchesLocation = locationFilter === "" || doctor.city === locationFilter;
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Name", "Specialty", "City", "Rating", "Reviews", "Available", "Suspended"];
    const rows = filteredDoctors.map(doctor => [
      doctor.name,
      doctor.specialty,
      doctor.city,
      doctor.rating,
      doctor.reviewCount,
      doctor.isAvailable ? "Yes" : "No",
      doctor.suspended ? "Yes" : "No"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "doctors_report.csv";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button 
          onClick={handleExportCSV}
          className="mt-4 sm:mt-0 bg-careforme-cyan hover:bg-careforme-cyan/90"
          disabled={filteredDoctors.length === 0}
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
              <Loader2 className="h-12 w-12 animate-spin text-careforme-cyan" />
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Doctors by Specialty */}
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
                          {specialtyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} doctors`, 'Count']} />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Doctors by Location */}
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
                          {cityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} doctors`, 'Count']} />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Doctor Status */}
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
                          <Cell fill="#4caf50" /> {/* Active */}
                          <Cell fill="#ff9800" /> {/* Unavailable */}
                          <Cell fill="#f44336" /> {/* Suspended */}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} doctors`, 'Count']} />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Monthly Registrations */}
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Doctor Registrations</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [`${value} doctors`, 'Registrations']} />
                        <Bar dataKey="value" name="Registrations" fill="#00bcd4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-md bg-muted p-4 text-center">
                      <p className="text-sm font-medium text-muted-foreground">Total Doctors</p>
                      <p className="mt-2 text-3xl font-bold text-careforme-cyan">{doctors.length}</p>
                    </div>
                    
                    <div className="rounded-md bg-muted p-4 text-center">
                      <p className="text-sm font-medium text-muted-foreground">Available Doctors</p>
                      <p className="mt-2 text-3xl font-bold text-careforme-cyan">
                        {doctors.filter(d => !d.suspended && d.isAvailable).length}
                      </p>
                    </div>
                    
                    <div className="rounded-md bg-muted p-4 text-center">
                      <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                      <p className="mt-2 text-3xl font-bold text-careforme-cyan">
                        {doctors.length > 0 
                          ? (doctors.reduce((sum, doc) => sum + doc.rating, 0) / doctors.length).toFixed(1)
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
              <CardTitle>Doctor Data</CardTitle>
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
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="">All Locations</SelectItem>
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

              <div className="rounded-md border">
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
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredDoctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No doctors found matching the criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell className="font-medium">{doctor.name}</TableCell>
                          <TableCell>{doctor.specialty}</TableCell>
                          <TableCell>{doctor.city}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span>{doctor.rating.toFixed(1)}</span>
                              <span className="ml-1 text-yellow-400">★</span>
                            </div>
                          </TableCell>
                          <TableCell>{doctor.reviewCount}</TableCell>
                          <TableCell>
                            {doctor.suspended ? (
                              <span className="text-red-500">Suspended</span>
                            ) : doctor.isAvailable ? (
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
                    {specialtyFilter || locationFilter 
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
