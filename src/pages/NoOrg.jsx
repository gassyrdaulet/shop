import cl from "../styles/Auth.module.css";
import MyButton from "../components/MyButton";
import useAuth from "../hooks/useAuth";
import TextButton from "../components/TextButton";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ping, checkOrg } from "../api/AuthService";

function NoOrg() {
  const {
    alert,
    setIsAuth,
    setIsAuthLoading,
    setIsNoOrg,
    setIsCheckOrgLoading,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkOrg({ setIsNoOrg, setIsCheckOrgLoading });
    ping({ setIsAuth, setIsAuthLoading, navigate });
  }, [navigate, setIsAuth, setIsAuthLoading, setIsNoOrg, setIsCheckOrgLoading]);

  return (
    <div className="pageWrapper">
      <div className={cl.authWrapper}>
        <h1 style={{ color: "#ff4141" }}>SHOP</h1>
        <h2
          style={{
            color: "#393333",
            fontSize: "1rem",
            fontWeight: "normal",
            maxWidth: 500,
            minWidth: 250,
          }}
        >
          автоматизация учета торговли, склада и доставок
        </h2>
        <div className={cl.formWrapper}>
          <p>Вы не состоите в какой либо организации.</p>
          <br />
          <p>Вы можете создать новую или вступить в существующую.</p>
          <center style={{ margin: 20 }}>
            <MyButton
              text="Создать новую организацию"
              onClick={() =>
                alert("Недоступно", "Пока что недоступно, извините.")
              }
            />
          </center>
          <p>
            Чтобы вступить в существующую организацию попросите менеджера
            добавить Вас через Ваш ID номер:
          </p>
          <p>« {localStorage.getItem("id")} »</p>
          <center style={{ margin: 10 }}>
            <TextButton
              text="Обновить"
              onClick={() => {
                navigate(0);
              }}
            />
          </center>
        </div>
      </div>
    </div>
  );
}

export default NoOrg;
