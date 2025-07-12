import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

export const useAuth0WithUser = () => {
  const auth0 = useAuth0(); // Original hook
  const { user, isAuthenticated } = auth0;

  const syncUserToBackend = async () => {
    if (!isAuthenticated) return null;

    try {
      //when user uses github i need the gmail
      console.log("User", user);
      //check if user exists and just update it,
      // no need to check if user used google or github,just update it
      const { data: existingUser } = await axios.post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000/api"
        }/auth/checkEmail`,
        user?.email
      );
      console.log("Existing user:", existingUser);

      if (existingUser) {
        // Create new user if not found
        const { data: newUser } = await axios.post(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000/api"
          }/auth/updateID`,
          {
            auth0Id: user?.sub,
            email: user?.email,
          }
        );
        console.log("New user created:", newUser);
        return newUser || existingUser;
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Create new user if not found
        const { data: newUser } = await axios.post(
          `${import.meta.env.VITE_API_URL}/users`,
          {
            auth0Id: user?.sub,
            email: user?.email,
            name: user?.name,
            avatar: user?.picture,
          }
        );
        console.log("New user created:", newUser);

        return newUser;
      }
      throw error;
    }
  };

  return {
    ...auth0,
    syncUserToBackend,
  };
};
