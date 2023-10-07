import MyButton from "../components/MyButton";
import { useState, useEffect } from "react";
import { ping } from "../api/AuthService";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function Error() {
  const { setIsError, setIsAuth, setIsAuthLoading, isError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      return;
    } else {
      navigate("/main");
    }
  }, [isError, navigate]);

  return (
    <div className="pageWrapper">
      Произошла ошибка... Проверьте свой интернет!
      <MyButton
        style={{ marginTop: 10 }}
        disabled={isLoading}
        text="Обновить"
        onClick={() => {
          setIsLoading(true);
          ping({
            setIsAuth,
            setIsAuthLoading: (v) => {
              setIsAuthLoading(v);
              setIsLoading(v);
            },
            setIsError,
          });
        }}
      />
    </div>
  );
}

export default Error;
