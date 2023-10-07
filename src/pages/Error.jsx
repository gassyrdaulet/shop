import { useNavigate } from "react-router-dom";
import MyButton from "../components/MyButton";
import { useState } from "react";

function Error() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="pageWrapper">
      Произошла ошибка... Проверьте свой интернет!
      <MyButton
        style={{ marginTop: 10 }}
        disabled={isLoading}
        text="Обновить"
        onClick={() => {
          setIsLoading(true);
          navigate("/main");
        }}
      />
    </div>
  );
}

export default Error;
