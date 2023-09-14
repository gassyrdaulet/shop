import { useMemo, useState, useEffect } from "react";
import Button from "./Button";
import LegendInput from "./LegendInput";
import { editUserData, getUserData } from "../api/AuthService";

function EditAccount() {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [inputs, setInputs] = useState([
    {
      title: "Имя",
      type: "input",
      inputType: "text",
      inputMode: "text",
      value: "",
      id: 0,
      name: "name",
    },
    {
      title: "Kaspi API токен",
      type: "input",
      inputType: "text",
      inputMode: "text",
      value: "",
      id: 1,
      name: "kaspitoken",
    },
  ]);

  const settingRow = useMemo(() => {
    return {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "10px 0",
    };
  }, []);

  const handleChange = (id, value) => {
    const temp = [...inputs];
    for (let input of temp) {
      if (input.id === id) {
        input.value = value;
        break;
      }
    }
    setInputs(temp);
  };

  useEffect(() => {
    getUserData({ setIsLoading, setUserData });
  }, []);

  useEffect(() => {
    if (!userData || Object.keys(userData).length === 0) {
      return;
    }
    setInputs((prev) => {
      const temp = [...prev];
      temp.forEach((item) => {
        item.value = userData[item.name];
      });
      return temp;
    });
  }, [userData]);

  return (
    <div
      style={{
        padding: "10px 0",
        margin: "20px 0",
        maxWidth: 600,
        color: "#3d3d3d",
      }}
    >
      <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
        Редактирование аккаунта
      </p>
      <div style={settingRow}></div>
      {inputs.map((input) => {
        return (
          <LegendInput
            placeholder={input.placeholder}
            key={input.id}
            legend={input.title}
            value={input.value}
            setValue={(value) => handleChange(input.id, value)}
            disabled={input.disabled || isLoading}
          />
        );
      })}
      <div style={settingRow}>
        <div></div>
        <Button
          disabled={isLoading}
          text="Сохранить"
          onClick={() => editUserData({ setIsLoading, inputs })}
        />
      </div>
    </div>
  );
}

export default EditAccount;
