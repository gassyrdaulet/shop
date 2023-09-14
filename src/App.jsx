import "./styles/App.css";
import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./context";
import AppRouter from "./components/AppRouter";
import Header from "./components/Header";
import config from "./config/config.json";
import { checkOrg, ping, setAlertAuthService } from "./api/AuthService";
import Loading from "./components/Loading";
import Alert from "./components/Alert";
import { setAlertGoodService } from "./api/GoodService";
import { setAlertWarehouseService } from "./api/WarehouseService";
import { setAlertOrganizationService } from "./api/OrganizationService";
import { setAlertOrderService } from "./api/OrderService";

const { PING_MS } = config;

export default function App() {
  const [isAuth, setIsAuth] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isCheckOrgLoading, setIsCheckOrgLoading] = useState(true);
  const [isNoOrg, setIsNoOrg] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const alert = useCallback(async (title = "", text = "") => {
    setAlerts((alerts) => {
      if (alerts.length > 50) {
        return;
      }
      let id = 0;
      const temp = [...alerts];
      for (let item of temp) {
        if (id <= item.id) {
          id = item.id + 1;
        }
      }
      const date = Date.now();
      temp.push({ id, title, text, date });
      return temp;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const date = Date.now();
      const temp = alerts.filter((alert) => {
        return date - alert.date < 3000;
      });
      setAlerts(temp);
    }, 1000);
    return () => clearInterval(interval);
  }, [alerts]);

  useEffect(() => {
    ping({ setIsAuth, setIsAuthLoading });
    const interval = setInterval(() => {
      checkOrg({ setIsNoOrg, setIsCheckOrgLoading });
      ping({ setIsAuth, setIsAuthLoading });
    }, PING_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAlertGoodService(alert);
    setAlertAuthService(alert);
    setAlertWarehouseService(alert);
    setAlertOrganizationService(alert);
    setAlertOrderService(alert);
  }, [alert]);

  return (
    <div
      id="App"
      className="App"
      style={{
        position: fixed ? "fixed" : "static",
        paddingRight: fixed ? 5 : 0,
      }}
    >
      <AuthContext.Provider
        value={{
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
        }}
      >
        {isAuthLoading ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              backgroundColor: "#f8f8f8",
              zIndex: 100,
            }}
            className="pageWrapper"
          >
            <Loading />
          </div>
        ) : (
          ""
        )}
        <div className="Body">
          {isAuth ? <Header /> : ""}
          <AppRouter />
          {alerts.map(({ id, title, text }) => {
            return <Alert key={id} title={title} text={text} />;
          })}
        </div>
      </AuthContext.Provider>
    </div>
  );
}
