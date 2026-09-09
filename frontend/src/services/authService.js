import api from "./api";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  if (response.data.token) {
    localStorage.setItem("medassist_token", response.data.token);
  }

  if (response.data.user?.role) {
    localStorage.setItem(
      "medassist_role",
      response.data.user.role
    );
  }

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("medassist_token");
  localStorage.removeItem("medassist_role");
};