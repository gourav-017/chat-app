import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";



const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatically set token on load
  useEffect(() => {
  if (token) {
    axios.defaults.headers.common["token"] = token;
    checkAuth();
  } else {
    setLoading(false); // if no token at all
  }
}, [token]);


  // Check auth status
  const checkAuth = async () => {
  try {
    const { data } = await axios.get("/api/auth/check-auth");
    if (data.success) {
      setAuthUser(data.user);
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
  } finally {
    setLoading(false); // ✅ whether success or failure
  }
};


  // Login function
  const login = async (state, credentials) => {
  try {
    const { data } = await axios.post(`/api/auth/${state}`, credentials);

    // Handle SIGNUP separately
    if (state === "signup") {
      if (data.success) {
        toast.success(data.message || "Signup successful. Please login.");
        
      } else {
        toast.error(data.message || "Signup failed");
      }
      return;
    }

    // Handle LOGIN normally
    if (data.success) {
      setAuthUser(data.user);
      axios.defaults.headers.common["token"] = data.token;
      setToken(data.token);
      localStorage.setItem("token", data.token);
      toast.success(data.message || "Login successful");
    } else {
      toast.error(data.message || "Login failed");
    }

  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
    console.error("Auth error:", error);
  }
};

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    toast.success("Logout successful");
    if (socket) socket.disconnect();
  };

  // Profile update
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
      console.error("Error updating profile:", error);
    }
  };

  // Socket connection
  useEffect(() => {
    if (!authUser?._id) return;

    const newSocket = io(backendUrl, {
      query: { userId: authUser._id },
      transports: ['websocket'], // optional for stability
    });

    setSocket(newSocket);

    // Listen for online user list from backend
    newSocket.on("onlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    // Cleanup on unmount/tab close
    return () => {
      newSocket.disconnect();
    };
  }, [authUser]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
