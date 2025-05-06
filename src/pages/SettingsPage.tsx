
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth"; // <-- Import from the hooks folder
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  
  const [notificationEmail, setNotificationEmail] = useState("admin@careforme.com");
  const [notifyOnNewDoctors, setNotifyOnNewDoctors] = useState(true);
  const [notifySaving, setNotifySaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setChangePasswordLoading(true);
      
      // Simulated password change - in real app would call Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Password has been updated successfully",
      });
      
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setNotifySaving(true);
      
      // Simulated save - in real app would save to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Notification settings have been updated",
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setNotifySaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Tabs defaultValue="account">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View and update your account details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || "admin@careforme.com"}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Your email address cannot be changed.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-careforme-cyan hover:bg-careforme-cyan/90"
                  disabled={changePasswordLoading}
                >
                  {changePasswordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotificationSettings} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="notify-new-doctors"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-careforme-cyan focus:ring-careforme-cyan"
                    checked={notifyOnNewDoctors}
                    onChange={(e) => setNotifyOnNewDoctors(e.target.checked)}
                  />
                  <Label htmlFor="notify-new-doctors">
                    Notify me when new doctors register
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-careforme-cyan hover:bg-careforme-cyan/90"
                  disabled={notifySaving}
                >
                  {notifySaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Notification Settings"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About CareForMe Admin Portal</CardTitle>
              <CardDescription>
                Information about this application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">
                  CareForMe Admin Portal is a comprehensive web application used by admin to manage doctors, view reports and manage the CareForMe app too.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Developed By</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>Oratile Chilliboy</Badge>
                  <Badge>22000517</Badge>
                  <Badge>COMP 302 Assignment</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Badge component for the About section
const Badge = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="inline-flex items-center rounded-full border border-careforme-cyan/30 bg-careforme-cyan/10 px-2.5 py-0.5 text-xs font-medium text-careforme-cyan">
      {children}
    </span>
  );
};

export default SettingsPage;
