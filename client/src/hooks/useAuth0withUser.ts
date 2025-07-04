import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

export const useAuth0WithUser = () => {
  const auth0 = useAuth0(); // Original hook
  const { user, isAuthenticated } = auth0;

  const syncUserToBackend = async () => {
    if (!isAuthenticated) return null;

    try {
      console.log("User", user);

      // Check if user exists
      const { data: existingUser } = await axios.get(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000/api"
        }/auth/users/${user?.sub}`
      );
      console.log("Existing user:", existingUser);
      //check if user used google or github to login then update the user info
      if (existingUser.auth0Id !== user?.sub) {
        const { data: updatedUser } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/profile}`,
          {
            auth0Id: existingUser?.sub,
            email: existingUser?.email,
            name: existingUser?.name,
            avatar: existingUser?.picture,
            use: existingUser,
          }
        );

        return updatedUser || existingUser;
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
