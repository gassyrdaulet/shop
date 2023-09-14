import Select from "./Select";
import { useMemo, useState, useEffect } from "react";
import Button from "./Button";
import { BiCheckCircle } from "react-icons/bi";
import { getOrgInfo, editOrgInfo } from "../api/OrganizationService";
import { useNavigate } from "react-router-dom";

function OrgSettings() {
  const [processLoading, setProcessLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [invControlType, setInvControlType] = useState("fifo");
  const [data, setData] = useState({});
  const navigate = useNavigate();

  const invControlTypes = useMemo(
    () => [
      { id: "fifo", name: "(FIFO) Первый пришел, Первый ушел" },
      { id: "lifo", name: "(LIFO) Последний пришел, Первый ушел" },
    ],
    []
  );

  const settingRow = useMemo(() => {
    return {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "10px 0",
    };
  }, []);

  useEffect(() => {
    getOrgInfo({ setFetchLoading, setData });
  }, []);

  useEffect(() => {
    setInvControlType(data.inventorycontroltype);
  }, [data]);

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
        Настройки организации
      </p>
      <div style={settingRow}>
        <p>Метод оценки запасов</p>
        <Select
          loading={fetchLoading || processLoading}
          style={{ margin: 0, maxWidth: 280 }}
          options={invControlTypes}
          value={invControlType}
          setValue={setInvControlType}
          type="settings"
        />
      </div>
      <div style={settingRow}>
        <div></div>
        <Button
          style={{ margin: 0 }}
          icon={<BiCheckCircle />}
          disabled={processLoading}
          text="Сохранить"
          onClick={() => {
            editOrgInfo({
              newData: { inventorycontroltype: invControlType },
              setProcessLoading,
              next: () => navigate(0),
            });
          }}
        />
      </div>
    </div>
  );
}

export default OrgSettings;
