import { confirmAccount, sendCode } from "../api/AuthService.js";
import { useState } from "react";
import cl from "../styles/Auth.module.css";
import LegendInput from "../components/LegendInput";
import MyButton from "../components/MyButton";
import TextButton from "../components/TextButton";
import { useNavigate, useParams } from "react-router-dom";

function ConfirmAccount() {
  const navigate = useNavigate();
  const params = useParams();
  const [email, setEmail] = useState(params.email);
  const [code, setCode] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);

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
          <p>
            Ваш аккаунт не подтвержден. Пожалуйста введите код отправленный на
            Вашу электронную почту.
          </p>
          <LegendInput
            type="email"
            inputMode="email"
            disabled={true}
            legend="Email"
            value={email}
            setValue={setEmail}
          />
          <LegendInput
            type="text"
            inputMode="text"
            disabled={confirmLoading || sendCodeLoading}
            legend="Код"
            value={code}
            setValue={setCode}
          />
          <div className={cl.Buttons}>
            <MyButton
              disabled={confirmLoading}
              onClick={() => {
                sendCode({
                  email,
                  setSendCodeLoading,
                  next: () => {},
                });
              }}
              isLoading={sendCodeLoading}
              text="Отправить код"
              className="marginRight10px"
            />
            <MyButton
              onClick={() => {
                confirmAccount({
                  email,
                  code,
                  setConfirmLoading,
                  next: () => navigate("/auth"),
                });
              }}
              isLoading={confirmLoading}
              text="Подтвердить почту"
              disabled={sendCodeLoading}
            />
          </div>
          <div className={cl.Right}>
            <TextButton
              text="Назад к авторизации"
              onClick={() => navigate("/auth")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmAccount;
