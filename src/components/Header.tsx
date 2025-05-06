// src/components/Header.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom"; // Assuming you might need Link in the future
import { useAuth } from "@/hooks/useAuth"; // Assuming useAuth is in hooks
import {
  Bell, // Bell icon for notifications
  Menu, // Example icon for mobile sidebar toggle
  // Search, // Removed Search icon import
  X, // Close icon for the notification popup
  CircleUser, // Example icon for user menu
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming Button component
// import { Input } from "@/components/ui/input"; // Removed Input import
// Assuming you have DropdownMenu components if you want a user menu
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";


interface HeaderProps {
  // Assuming your Layout passes a toggleSidebar function
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  // You might not need the user here, but keeping it as an example
  // const { user } = useAuth(); // Get user from Auth context if needed

  // State to manage the visibility of the notification popup
  const [showNotification, setShowNotification] = useState(false);

  // Placeholder notification data
  const placeholderNotification = {
    id: "noti-1",
    message: "Dr Lester Green is behind on payment.",
    isRead: false, // Set to true to hide the badge
  };

  // Handle clicking the notification bell
  const handleBellClick = () => {
    setShowNotification(!showNotification); // Toggle notification popup visibility
  };

  // Handle marking the notification as read (just closes the popup for now)
  const handleMarkAsRead = () => {
    // In a real app, you would update the notification status in your backend
    console.log("Notification marked as read (placeholder)");
    setShowNotification(false); // Close the popup
    // You might also want to update the placeholderNotification state here
    // setPlaceholderNotification({...placeholderNotification, isRead: true});
  };


  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      {/* Mobile Sidebar Toggle (if you implement one) */}
      {/* This button would typically call toggleSidebar */}
       <Button
         variant="outline"
         size="icon"
         className="shrink-0 md:hidden"
         onClick={toggleSidebar} // Call the toggleSidebar function from props
       >
         <Menu className="h-5 w-5" />
         <span className="sr-only">Toggle navigation menu</span>
       </Button>

      {/* Search Input (optional, remove if not needed in header) */}
      {/* Removed the div containing the search input */}
      {/*
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
        </form>
      </div>
      */}

      {/* Header Right Section (Notifications, User Menu, etc.) */}
      {/* ml-auto pushes this div and its contents to the right */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notification Bell Icon */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative" // Make position relative for absolute badge
            onClick={handleBellClick} // Toggle notification popup
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
            {/* Optional: Notification Badge (if you had unread notifications) */}
            {/* Conditionally render badge if notification is unread */}
            {!placeholderNotification.isRead && (
               <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </Button>

          {/* Notification Popup (Placeholder) */}
          {/* Conditionally render the popup based on showNotification state */}
          {showNotification && (
            <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Notifications</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Placeholder Notification Item */}
                <div className="flex items-start space-x-3">
                   {/* Icon (optional) */}
                   {/* <Bell className="h-5 w-5 text-yellow-500" /> */}
                   <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                         {placeholderNotification.message}
                      </p>
                      {/* "Mark as Read" button */}
                      <Button
                         variant="link"
                         size="sm"
                         className="p-0 h-auto text-xs text-careforme-cyan hover:underline"
                         onClick={handleMarkAsRead} // Call the mark as read handler
                      >
                         Mark as Read
                      </Button>
                   </div>
                   {/* Optional: Close button for individual notification */}
                   {/* <Button variant="ghost" size="icon" className="w-6 h-6">
                      <X className="h-3 w-3" />
                   </Button> */}
                </div>
                {/* Add more notification items here */}
                {/* Example:
                <div className="flex items-start space-x-3">
                   <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                         New doctor registered: Dr. Jane Smith
                      </p>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs text-careforme-cyan hover:underline">
                         View Doctor
                      </Button>
                   </div>
                </div>
                */}
              </div>
               {/* Optional: "View All" link */}
               {/* <div className="p-4 border-t text-center">
                   <Link to="/notifications" className="text-sm text-careforme-cyan hover:underline">
                      View All Notifications
                   </Link>
               </div> */}
            </div>
          )}
        </div>

        {/* User Dropdown Menu (optional, uncomment if you have one) */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
    </header>
  );
};

export default Header;
