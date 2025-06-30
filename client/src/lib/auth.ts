import { useAuth0WithUser as useAuth0 } from "../hooks/useAuth0withUser";
import { useEffect } from "react";
import { authAPI } from "./api";
import { useAuthStore } from "../stores/useAuthStore";

export const useAuthSync = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { setUser, setDbUser, setLoading } = useAuthStore();

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user) {
        setUser(user);
        // console.log("User", user);

        setLoading(true);

        try {
          const response = await authAPI.createOrUpdateProfile({
            auth0Id: user.sub,
            email: user.email,
            name: user.name,
            avatar: user.picture,
          });

          setDbUser(response.data.user);
        } catch (error) {
          console.error("Error syncing user:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setDbUser(null);
        setLoading(isLoading);
      }
    };

    syncUser();
  }, [isAuthenticated, user, isLoading, setUser, setDbUser, setLoading]);
};

export const useCurrentUser = () => {
  const { user, dbUser } = useAuthStore();
  return { user, dbUser };
};
