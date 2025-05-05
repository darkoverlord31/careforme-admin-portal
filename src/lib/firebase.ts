
// This file serves as a placeholder for Firebase integration
// In a production environment, you would initialize Firebase here with your config

// Simulated Firebase Auth for the demo
export const auth = {
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // For demo purposes, accept specific credentials
    if (email === "admin@careforme.com" && password === "admin123") {
      return { user: { uid: "admin-uid", email } };
    }
    
    throw new Error("Invalid email or password");
  },
  signOut: async () => {
    // Simulated sign out
    console.log("User signed out");
    return true;
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Check if user is logged in from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      callback(JSON.parse(user));
    } else {
      callback(null);
    }
    
    // Return unsubscribe function (not used in this demo)
    return () => {};
  }
};

// Simulated Firestore for the demo
export const firestore = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: async (data: any) => {
        let collection = JSON.parse(localStorage.getItem(name) || "{}");
        collection[id] = { id, ...data };
        localStorage.setItem(name, JSON.stringify(collection));
        return { id };
      },
      update: async (data: any) => {
        let collection = JSON.parse(localStorage.getItem(name) || "{}");
        collection[id] = { ...collection[id], ...data };
        localStorage.setItem(name, JSON.stringify(collection));
        return { id };
      },
      delete: async () => {
        let collection = JSON.parse(localStorage.getItem(name) || "{}");
        delete collection[id];
        localStorage.setItem(name, JSON.stringify(collection));
      },
      get: async () => {
        let collection = JSON.parse(localStorage.getItem(name) || "{}");
        const data = collection[id];
        return {
          exists: !!data,
          data: () => data,
          id
        };
      }
    }),
    add: async (data: any) => {
      const id = Math.random().toString(36).substring(2, 15);
      let collection = JSON.parse(localStorage.getItem(name) || "{}");
      collection[id] = { id, ...data };
      localStorage.setItem(name, JSON.stringify(collection));
      return { id };
    },
    get: async () => {
      const collection = JSON.parse(localStorage.getItem(name) || "{}");
      return {
        docs: Object.values(collection).map((doc: any) => ({
          id: doc.id,
          data: () => doc
        })),
        empty: Object.keys(collection).length === 0
      };
    }
  })
};

// Initialize with sample data if none exists
export const initializeSampleData = () => {
  if (!localStorage.getItem("doctors")) {
    const sampleDoctors = {
      "doc1": {
        id: "doc1",
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        city: "New York",
        address: "123 Medical Ave, New York, NY 10001",
        email: "sarah.johnson@careforme.com",
        phone: "+1 (212) 555-1234",
        latitude: 40.7128,
        longitude: -74.0060,
        profilePicture: "https://randomuser.me/api/portraits/women/1.jpg",
        bio: "Experienced cardiologist with over 10 years of practice.",
        rating: 4.8,
        reviewCount: 156,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Friday"],
        isAvailable: true,
        suspended: false,
        createdAt: new Date().toISOString()
      },
      "doc2": {
        id: "doc2",
        name: "Dr. Michael Chen",
        specialty: "Dermatology",
        city: "San Francisco",
        address: "456 Health St, San Francisco, CA 94105",
        email: "michael.chen@careforme.com",
        phone: "+1 (415) 555-5678",
        latitude: 37.7749,
        longitude: -122.4194,
        profilePicture: "https://randomuser.me/api/portraits/men/2.jpg",
        bio: "Board-certified dermatologist specializing in skin cancer prevention.",
        rating: 4.9,
        reviewCount: 203,
        availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
        isAvailable: true,
        suspended: false,
        createdAt: new Date().toISOString()
      },
      "doc3": {
        id: "doc3",
        name: "Dr. Emily Rodriguez",
        specialty: "Pediatrics",
        city: "Chicago",
        address: "789 Child Care Blvd, Chicago, IL 60601",
        email: "emily.rodriguez@careforme.com",
        phone: "+1 (312) 555-9012",
        latitude: 41.8781,
        longitude: -87.6298,
        profilePicture: "https://randomuser.me/api/portraits/women/3.jpg",
        bio: "Dedicated pediatrician with a focus on newborn care and child development.",
        rating: 4.7,
        reviewCount: 178,
        availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday"],
        isAvailable: true,
        suspended: false,
        createdAt: new Date().toISOString()
      }
    };
    
    localStorage.setItem("doctors", JSON.stringify(sampleDoctors));
  }
};
