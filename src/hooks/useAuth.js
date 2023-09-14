import { AuthContext } from "../context";
import { useContext } from "react";

export default function useAuth() {
  const {
    isAuth,
    setIsAuth,
    isNoOrg,
    setIsNoOrg,
    isAuthLoading,
    setIsAuthLoading,
    alert,
    isCheckOrgLoading,
    setIsCheckOrgLoading,
    fixed,
    setFixed,
  } = useContext(AuthContext);
  return {
    setIsAuth,
    isAuth,
    isNoOrg,
    setIsNoOrg,
    isAuthLoading,
    setIsAuthLoading,
    alert,
    isCheckOrgLoading,
    setIsCheckOrgLoading,
    fixed,
    setFixed,
  };
}
