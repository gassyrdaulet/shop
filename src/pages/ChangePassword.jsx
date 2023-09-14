import React from "react";
import cl from "../styles/Auth.module.css";
import LegendInput from "../components/LegendInput";
import MyButton from "../components/MyButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextButton from "../components/TextButton";
import { sendCode, changePassword } from "../api/AuthService.js";

function ChangePassword() {
  const [email, setEmail] = useState("");
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
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
          {showPasswordInput ? (
            <p>Введите код отправленный на Вашу почту и новый пароль.</p>
          ) : (
            <p>
              Введите Вашу электронную почту. На нее придет код для
              восстановления пароля.
            </p>
          )}

          <LegendInput
            type="email"
            inputMode="email"
            disabled={sendCodeLoading || showPasswordInput || changeLoading}
            legend="Email"
            value={email}
            setValue={setEmail}
          />
          {showPasswordInput ? (
            <span style={{ width: "100%" }}>
              <LegendInput
                type="text"
                inputMode="text"
                disabled={sendCodeLoading || changeLoading}
                legend="Код"
                value={code}
                setValue={setCode}
              />
              <LegendInput
                type="text"
                inputMode="text"
                disabled={sendCodeLoading || changeLoading}
                legend="Новый пароль"
                value={newPass}
                setValue={setNewPass}
              />
            </span>
          ) : (
            ""
          )}
          <div className={cl.Buttons}>
            <MyButton
              disabled={changeLoading}
              className="marginRight10px"
              onClick={() => {
                sendCode({
                  email,
                  setSendCodeLoading,
                  next: () => setShowPasswordInput(true),
                });
              }}
              isLoading={sendCodeLoading}
              text="Отправить код"
            />
            {showPasswordInput ? (
              <MyButton
                onClick={() => {
                  changePassword({
                    email,
                    code,
                    newPass,
                    setChangeLoading,
                    next: () => {
                      navigate("/auth");
                    },
                  });
                }}
                isLoading={changeLoading}
                text="Изменить пароль"
                disabled={sendCodeLoading}
              />
            ) : (
              ""
            )}
          </div>
          {showPasswordInput ? (
            <div className={cl.Right}>
              <TextButton
                text="Ввести другую почту"
                onClick={() => {
                  setShowPasswordInput(false);
                }}
              />
            </div>
          ) : (
            ""
          )}
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

export default ChangePassword;
