import useAuth from "../hooks/useAuth";
import { login } from "../api/AuthService.js";
import { useState } from "react";
import cl from "../styles/Auth.module.css";
import LegendInput from "../components/LegendInput";
import MyButton from "../components/MyButton";
import TextButton from "../components/TextButton";
import { useNavigate } from "react-router-dom";

function Auth() {
  const { setIsAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const navigate = useNavigate();

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
          <p>Вход в систему</p>
          <LegendInput
            type="email"
            inputMode="email"
            disabled={isLoginLoading}
            legend="Email"
            value={email}
            setValue={setEmail}
          />
          <LegendInput
            type="password"
            inputMode="password"
            disabled={isLoginLoading}
            legend="Пароль"
            value={password}
            setValue={setPassword}
          />
          <div className={cl.Buttons}>
            <MyButton
              disabled={isLoginLoading}
              text="Регистрация"
              className="marginRight10px"
              onClick={() => {
                navigate("/registration");
              }}
            />
            <MyButton
              onClick={() =>
                login({
                  email,
                  password,
                  setIsAuth,
                  setIsLoginLoading,
                  notActivated: (email) => navigate(`/confirm/${email}`),
                })
              }
              isLoading={isLoginLoading}
              text="Войти"
            />
          </div>
          <div className={cl.Right}>
            <TextButton
              text="Забыли пароль?"
              onClick={() => navigate("/changepassword")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
