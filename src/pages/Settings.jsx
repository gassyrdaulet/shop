import { useState, useMemo } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import cl from "../styles/Goods.module.css";
import { BiLink, BiListCheck, BiUserCheck, BiUserCircle } from "react-icons/bi";
import SettingsRow from "../components/SettingsRow";
import Select from "../components/Select";
import { BsGear } from "react-icons/bs";
import OrgSettings from "../components/OrgSettings";
import EditUsers from "../components/EditUsers";
import EditRelations from "../components/EditRelations";
import EditAccount from "../components/EditAccount";

function Settings() {
  const navigate = useNavigate();
  const { settingstype: settingsType } = useParams();
  const [processLoading] = useState(false);

  const settingsTypes = useMemo(
    () => [
      {
        name: "organizationsettings",
        text: "Настройки организации",
        icon: <BsGear />,
        page: <OrgSettings />,
      },
      {
        name: "organizationprofile",
        text: "Профиль организации",
        icon: <BiListCheck />,
      },
      {
        name: "editusers",
        text: "Редактировать пользователей",
        icon: <BiUserCheck />,
        page: <EditUsers />,
      },
      {
        name: "editrelations",
        text: "Связи товаров",
        icon: <BiLink />,
        page: <EditRelations />,
      },
      {
        name: "editaccount",
        text: "Редактировать аккаунт",
        icon: <BiUserCircle />,
        page: <EditAccount />,
      },
    ],
    []
  );

  const settingsTypesMobile = useMemo(
    () =>
      settingsTypes.map((item) => {
        return { id: item.name, name: item.text };
      }),
    [settingsTypes]
  );

  const buttons = [
    {
      show: false,
      disabled: processLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Сохранить",
      onClick: () => {},
    },
  ];

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div className={cl.OptionsButtons}></div>
        <div className={cl.OptionsButtons}>
          {buttons.map((button) => {
            if (button.show) {
              return (
                <button
                  disabled={button.disabled}
                  key={button.text}
                  onClick={button.onClick}
                  className={cl.OptionsButton}
                >
                  {button.icon}
                  {button.text}
                </button>
              );
            }
            return "";
          })}
        </div>
      </div>
      <div className={cl.goodsWrapper}>
        <div className={cl.groupsWrapper}>
          {settingsTypes.map((item, index) => {
            return (
              <SettingsRow
                item={item}
                index={index}
                totalLength={settingsTypes.length}
                settingsType={settingsType}
                key={item.name}
              />
            );
          })}
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}>
            <Select
              value={settingsType}
              setValue={(v) => navigate("/settings/" + v)}
              type="settings"
              options={settingsTypesMobile}
            />
          </div>
          {
            settingsTypes.filter(({ name }) => {
              return settingsType === name;
            })[0].page
          }
        </div>
      </div>
    </div>
  );
}

export default Settings;
