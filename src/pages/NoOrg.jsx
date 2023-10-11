import cl from "../styles/Auth.module.css";
import MyButton from "../components/MyButton";
import useAuth from "../hooks/useAuth";
import TextButton from "../components/TextButton";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ping, checkOrg } from "../api/AuthService";
import Modal from "../components/Modal";
import LegendInput from "../components/LegendInput";
import Button from "../components/MyButton";
import { newOrganization } from "../api/OrganizationService";

function NoOrg() {
  const {
    setIsAuth,
    setIsAuthLoading,
    setIsNoOrg,
    setIsCheckOrgLoading,
    setIsError,
  } = useAuth();
  const navigate = useNavigate();
  const [createOrgModal, setCreateOrgModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [processLoading, setProcessLoading] = useState("");

  useEffect(() => {
    checkOrg({ setIsNoOrg, setIsCheckOrgLoading });
    ping({ setIsAuth, setIsAuthLoading, setIsError });
  }, [
    navigate,
    setIsAuth,
    setIsAuthLoading,
    setIsNoOrg,
    setIsCheckOrgLoading,
    setIsError,
  ]);

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
              onClick={() => {
                setCreateOrgModal(true);
              }}
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
      <Modal
        modalVisible={createOrgModal}
        setModalVisible={setCreateOrgModal}
        noEscape={processLoading}
      >
        <p
          style={{
            marginBottom: 15,
          }}
        >
          Создание организации
        </p>
        <LegendInput
          value={orgName}
          setValue={setOrgName}
          type="text"
          legend="Название организации"
          inputMode="text"
          disabled={processLoading}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 15,
          }}
        >
          <Button
            disabled={processLoading}
            text="Создать организацию"
            onClick={() => {
              newOrganization({
                setIsLoading: setProcessLoading,
                name: orgName,
                next: () => {
                  navigate(0);
                },
              });
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default NoOrg;
