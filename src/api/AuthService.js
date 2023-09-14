import axios from "axios";
import config from "../config/config.json";
import Cookies from "universal-cookie";

// ("scp -r ./build/* /var/www/domper.kz/html");
const { SERVER_URL, TOKEN_NAME } = config;
const cookies = new Cookies();
let alert;

export const setAlertAuthService = (variable) => {
  alert = variable;
};

export const errParser = (err) => {
  return err.response?.data?.errors
    ? err.response?.data?.errors.errors[0].msg
    : err.response?.data?.message;
};

export const ping = async ({ setIsAuth, setIsAuthLoading }) => {
  const token = await cookies.get(TOKEN_NAME);
  if (!token) {
    setIsAuthLoading(false);
    setIsAuth(false);
    return;
  }
  setIsAuthLoading(true);
  axios
    .get(`${SERVER_URL}/api/auth/ping`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      if (data?.logout) {
        logout({ setIsAuth });
        return;
      }
      setIsAuth(true);
    })
    .catch(() => {
      logout({ setIsAuth });
    })
    .finally(() => {
      setIsAuthLoading(false);
    });
};

export const checkOrg = async ({ setIsNoOrg, setIsCheckOrgLoading }) => {
  const token = await cookies.get(TOKEN_NAME);
  if (!token) {
    setIsCheckOrgLoading(false);
    return;
  }
  setIsCheckOrgLoading(true);
  axios
    .get(`${SERVER_URL}/api/auth/checkorg`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      if (data?.noOrg) {
        setIsNoOrg(true);
        return;
      }
      setIsNoOrg(false);
    })
    .catch(() => {
      setIsNoOrg(true);
    })
    .finally(() => {
      setIsCheckOrgLoading(false);
    });
};

export const logout = async ({ setIsAuth }) => {
  cookies.remove(TOKEN_NAME, { path: "/" });
  localStorage.clear();
  setIsAuth(false);
};

export const login = async ({
  email,
  password,
  setIsAuth,
  setIsLoginLoading,
  notActivated,
}) => {
  setIsLoginLoading(true);
  axios
    .post(`${SERVER_URL}/api/auth/login`, {
      email: email.toLowerCase(),
      password,
    })
    .then(({ data }) => {
      if (!data.cookie) {
        notActivated(data.email);
        return;
      }
      setIsAuth(true);
      cookies.set(data.cookie.name, data.cookie.value, {
        maxAge: data.cookie.maxAge,
      });
      Object.keys(data.user).forEach((key) => {
        localStorage.setItem(key, data.user[key]);
      });
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setIsLoginLoading(false);
    });
};

export const registration = async ({
  email,
  password,
  name,
  setRegistrationLoading,
  next,
}) => {
  setRegistrationLoading(true);
  axios
    .post(`${SERVER_URL}/api/auth/registration`, {
      email: email.toLowerCase(),
      password,
      name,
    })
    .then(({ data }) => {
      alert("Успешно", data.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setRegistrationLoading(false);
    });
};

export const sendCode = async ({ email, setSendCodeLoading, next }) => {
  setSendCodeLoading(true);
  axios
    .post(`${SERVER_URL}/api/auth/sendcode`, {
      email,
    })
    .then(({ data }) => {
      alert("Успешно", data.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setSendCodeLoading(false);
    });
};

export const changePassword = async ({
  email,
  code,
  newPass,
  setChangeLoading,
  next,
}) => {
  setChangeLoading(true);
  axios
    .post(`${SERVER_URL}/api/auth/change`, {
      email,
      password: newPass,
      code,
    })
    .then(({ data }) => {
      alert("Успешно", data.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setChangeLoading(false);
    });
};

export const confirmAccount = async ({
  email,
  code,
  setConfirmLoading,
  next,
}) => {
  setConfirmLoading(true);
  axios
    .post(`${SERVER_URL}/api/auth/confirm`, {
      email,
      code,
    })
    .then(({ data }) => {
      alert("Успешно", data.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setConfirmLoading(false);
    });
};

export const getAPIToken = async (id) => {
  try {
    const token = await cookies.get(TOKEN_NAME);
    const { data } = await axios.post(
      `${SERVER_URL}/api/auth/token`,
      {
        id,
      },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    );
    return data.token;
  } catch (e) {
    console.log(e);
  }
};

export const getUserData = async ({ setIsLoading, setUserData }) => {
  const token = await cookies.get(TOKEN_NAME);
  setIsLoading(true);
  axios
    .get(`${SERVER_URL}/api/auth/getuserdata`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setUserData(data);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setIsLoading(false);
    });
};

export const editUserData = async ({ setIsLoading, inputs }) => {
  const token = await cookies.get(TOKEN_NAME);
  setIsLoading(true);
  const body = {};
  inputs.forEach((item) => {
    body[item.name] = item.value;
  });
  axios
    .post(`${SERVER_URL}/api/auth/edituserdata`, body, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      alert("Успешно!", data.message);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setIsLoading(false);
    });
};
