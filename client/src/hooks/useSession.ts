import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, logout } from "@/app/features/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "@/app/store"; // ✅ ensure correct types

export function useSession() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const loading = useSelector((state: RootState) => state.auth.isLoading);

  useEffect(() => {
    const init = async () => {
      const result = await dispatch(fetchCurrentUser());
      if (fetchCurrentUser.rejected.match(result)) {
        dispatch(logout());
        if (location.pathname.startsWith("/dashboard")) {
          navigate("/auth");
        }
      }
    };
    init();
  }, [dispatch, navigate, location]);

  return { loading };
}
