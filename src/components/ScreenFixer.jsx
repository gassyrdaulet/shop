import { useEffect } from "react";
import useAuth from "../hooks/useAuth";

function ScreenFixer() {
  const { setFixed, fixed } = useAuth();

  useEffect(() => {
    setFixed(true);
  }, [setFixed, fixed]);

  return;
}

export default ScreenFixer;
