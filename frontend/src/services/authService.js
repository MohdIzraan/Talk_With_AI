import api from "./api";

// Registers a new user, returns the user data and token
export const registerUser = async (name, email, password) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data;
};

// Logs in a user, returns the user data and token
export const loginUser = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

// Fetches the currently logged-in user's profile
export const fetchProfile = async () => {
  const { data } = await api.get("/auth/profile");
  return data.user;
};

// Updates the user's profile 
export const updateProfile = async (payload) => {
  const { data } = await api.put("/auth/profile", payload);
  return data.user;
};
