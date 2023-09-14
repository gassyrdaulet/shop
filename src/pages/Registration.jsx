import { registration } from "../api/AuthService.js";
import { useState } from "react";
import cl from "../styles/Auth.module.css";
import LegendInput from "../components/LegendInput";
import MyButton from "../components/MyButton";
import TextButton from "../components/TextButton";
import { useNavigate } from "react-router-dom";

function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistrationLoading, setRegistrationLoading] = useState(false);
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
          <p>Регистрация</p>
          <LegendInput
            type="email"
            inputMode="email"
            disabled={isRegistrationLoading}
            legend="Email"
            value={email}
            setValue={setEmail}
          />
          <LegendInput
            type="text"
            inputMode="text"
            disabled={isRegistrationLoading}
            legend="Имя"
            value={name}
            setValue={setName}
          />
          <LegendInput
            type="password"
            inputMode="password"
            disabled={isRegistrationLoading}
            legend="Пароль"
            value={password}
            setValue={setPassword}
          />
          <div className={cl.Buttons}>
            <MyButton
              onClick={() =>
                registration({
                  email,
                  name,
                  password,
                  setRegistrationLoading,
                  next: () => {
                    navigate("/confirm/" + email);
                  },
                })
              }
              isLoading={isRegistrationLoading}
              text="Зарегистрироваться"
            />
          </div>
          <div className={cl.Right}>
            <TextButton
              text="Уже есть аккаунт?"
              onClick={() => navigate("/auth")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
