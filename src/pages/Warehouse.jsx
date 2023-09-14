import cl from "../styles/Goods.module.css";
import { BsPlusCircle } from "react-icons/bs";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

function Warehouse() {
  const navigate = useNavigate();
  const buttons = [
    {
      icon: <BsPlusCircle />,
      text: "Создать приемку",
      onClick: () => navigate("/warehouse/new/ac"),
    },
    {
      icon: <AiOutlineMinusCircle />,
      text: "Создать списание",
      onClick: () => navigate("/warehouse/new/wo"),
    },
  ];

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div></div>
        <div className={cl.OptionsButtons}>
          {buttons.map((button) => {
            return (
              <div
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
              >
                {button.icon}
                {button.text}
              </div>
            );
          })}
        </div>
      </div>
      <div className={cl.goodsWrapper}></div>
    </div>
  );
}

export default Warehouse;
