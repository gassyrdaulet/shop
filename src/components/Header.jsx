import cl from "../styles/Header.module.css";
import Logo from "./Logo";
import {
  BsFillClockFill,
  BsBoxArrowLeft,
  BsBox2Heart,
  BsTruck,
  BsBag,
  BsCashCoin,
  BsCart3,
  BsClipboardPulse,
  BsGear,
  BsPersonGear,
  BsPencil,
} from "react-icons/bs";
import {
  AiOutlinePlusCircle,
  AiOutlineMinusCircle,
  // AiOutlineInbox,
} from "react-icons/ai";
import useAuth from "../hooks/useAuth";
import { logout } from "../api/AuthService.js";
import { useState } from "react";
import HeaderIcon from "./HeaderIcon";
import Modal from "./Modal";
import MyButton from "./MyButton";
import { useNavigate, useLocation } from "react-router-dom";
import { BiUser } from "react-icons/bi";

function Header() {
  const { setIsAuth } = useAuth();
  const [actual, setActual] = useState("");
  const [exitModal, setExitModal] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  //В этом массиве хранятся все вкладки шапки. Вкладки со списками составляют
  //еще массивы. Названия вкладок должны быть разными!

  const buttons = [
    {
      name: "Товары",
      icon: <BsBox2Heart />,
      onClick: () => navigate("/goods"),
      path: "/goods",
    },
    {
      name: "Доставки",
      icon: <BsTruck />,
      onClick: () => navigate("/delivery/new"),
      path: "/delivery",
    },
    {
      name: "Магазин",
      icon: <BsBag />,
      onClick: () => navigate("/pickup/new"),
      path: "/pickup",
    },
    {
      name: "Касса",
      icon: <BsCashCoin />,
      onClick: () => navigate("/cash"),
      path: "/cash",
    },
    {
      name: "Склад",
      icon: <BsCart3 />,
      path: "/warehouse",
      dropmenu: [
        {
          icon: <AiOutlinePlusCircle />,
          name: "Приемки",
          onClick: () => navigate("/warehouse/inventory/acceptance"),
          path: "/warehouse/inventory/acceptance",
        },
        {
          icon: <AiOutlineMinusCircle />,
          name: "Списания",
          onClick: () => navigate("/warehouse/inventory/writeoff"),
          path: "/warehouse/inventory/writeoff",
        },
      ],
    },
    {
      name: "Отчеты",
      icon: <BsClipboardPulse />,
      path: "/summaries",
      dropmenu: [
        {
          icon: <BsFillClockFill />,
          name: "Отчет",
          onClick: () => navigate("/summaries/summary"),
          path: "/summaries/summary",
        },
      ],
    },
    {
      name: "Аккаунт",
      icon: <BsPersonGear />,
      path: "/account",
      dropmenu: [
        {
          icon: <BiUser />,
          name:
            localStorage.getItem("name") +
            " (id: " +
            localStorage.getItem("id") +
            ")",
          onClick: () => {},
        },
        {
          icon: <BsPencil />,
          name: "Редактировать",
          onClick: () => {
            navigate("/settings/editaccount");
          },
        },
        {
          icon: <BsBoxArrowLeft />,
          name: "Выйти",
          onClick: () => setExitModal(true),
        },
      ],
    },
    {
      name: "Настройки",
      icon: <BsGear />,
      onClick: () => navigate("/settings/organizationsettings"),
      path: "/settings/",
    },
  ];

  const handleClick = async (name) => {
    if (name === actual) {
      setActual("");
      return;
    }
    setActual(name);
  };

  return (
    <div
      className={
        cl.mainWrapper + " " + (mobileMenuVisible ? "" : cl.mainWrapperShrinker)
      }
    >
      <div className={cl.mobileWrapper}>
        <div className={cl.mobileTitle}>
          <Logo />
        </div>
        <div
          className={
            cl.menuButton + " " + (mobileMenuVisible ? cl.menuButtonActive : "")
          }
          onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
        >
          <span />
        </div>
      </div>
      <div
        className={
          cl.secondaryWrapper +
          " " +
          (mobileMenuVisible ? cl.mobileMenuActive : "")
        }
      >
        <div className={cl.Logo}>
          <Logo />
        </div>
        {buttons.map((item) => {
          return (
            <HeaderIcon
              actual={actual}
              name={item.name}
              closeMenu={() => setActual("")}
              key={item.name}
              className={cl.buttonWrapper}
            >
              <div
                className={
                  cl.button +
                  " " +
                  (location.pathname.startsWith(item.path) ? cl.Selected : "") +
                  " " +
                  (actual === item.name ? cl.Active : "")
                }
                onClick={
                  item.dropmenu ? () => handleClick(item.name) : item.onClick
                }
              >
                {item.icon}
                <p className={cl.buttonName}>
                  {item.name}
                  <span className={cl.Arrow}>{item.dropmenu ? "▾" : ""}</span>
                </p>
              </div>
              {item.dropmenu ? (
                <div
                  className={
                    cl.dropMenu + " " + (item.name === actual ? cl.Show : "")
                  }
                >
                  {item.dropmenu.map((dmitem) => {
                    return (
                      <div
                        onClick={() => dmitem.onClick()}
                        key={dmitem.name}
                        className={
                          cl.dropMenuElement +
                          " " +
                          (location.pathname.startsWith(dmitem.path)
                            ? cl.SelectedDrop
                            : "")
                        }
                      >
                        {dmitem.icon}
                        <p className={cl.dropMenuText}>{dmitem.name}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                ""
              )}
            </HeaderIcon>
          );
        })}
      </div>
      <Modal modalVisible={exitModal} setModalVisible={setExitModal}>
        <div className={cl.ExitModalWrapper}>
          <p className={cl.Question}>
            Вы уверены что хотите выйти из своего аккаунта?
          </p>
          <div className={cl.ExitModalButtons}>
            <MyButton
              style={{ width: 80, minWidth: 80, maxWidth: 80 }}
              onClick={() => setExitModal(false)}
              text="Нет"
            />
            <MyButton
              style={{ width: 80, minWidth: 80, maxWidth: 80 }}
              onClick={() => logout({ setIsAuth })}
              text="Да"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Header;
