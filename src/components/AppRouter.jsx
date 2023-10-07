import { Route, Routes } from "react-router-dom";
import { publicRoutes, userRoutes, userRoutes2, errorRoutes } from "../router";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";
import { checkOrg } from "../api/AuthService";
import Loading from "../components/Loading";

function AppRouter() {
  const {
    isAuth,
    isNoOrg,
    setIsNoOrg,
    isCheckOrgLoading,
    setIsCheckOrgLoading,
    isError,
  } = useAuth();

  useEffect(() => {
    checkOrg({ setIsNoOrg, setIsCheckOrgLoading });
  }, [setIsNoOrg, isAuth, setIsCheckOrgLoading]);

  return isError ? (
    <span>
      <Routes>
        {errorRoutes.map(({ path, element }) => (
          <Route path={path} element={element} key={path} />
        ))}
      </Routes>
    </span>
  ) : isAuth ? (
    isNoOrg ? (
      <span>
        {isCheckOrgLoading ? (
          <div
            style={{
              position: "absolute",
              backgroundColor: "#f8f8f8",
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 99,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 50,
                backgroundColor: "#dedede",
              }}
            ></div>
            <Loading />
            Проверка аутентификации
          </div>
        ) : (
          ""
        )}
        <Routes>
          {userRoutes2.map(({ path, element }) => (
            <Route path={path} element={element} key={path} />
          ))}
        </Routes>
      </span>
    ) : (
      <span>
        {isCheckOrgLoading ? (
          <div
            style={{
              position: "absolute",
              backgroundColor: "#f8f8f8",
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 99,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 50,
                backgroundColor: "#dedede",
              }}
            ></div>
            <Loading />
            Проверка аутентификации
          </div>
        ) : (
          ""
        )}
        <Routes>
          {userRoutes.map(({ path, element }) => (
            <Route path={path} element={element} key={path} />
          ))}
        </Routes>
      </span>
    )
  ) : (
    <span>
      <Routes>
        {publicRoutes.map(({ path, element }) => (
          <Route path={path} element={element} key={path} />
        ))}
      </Routes>
    </span>
  );
}

export default AppRouter;
