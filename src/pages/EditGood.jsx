import cl from "../styles/NewGood.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowLeftCircle } from "react-icons/bs";
import { useState, useEffect } from "react";
import LegendInput from "../components/LegendInput";
import MyButton from "../components/MyButton";
import {
  getGroups,
  fetchGoodInfo,
  editGood,
  getBarcode,
} from "../api/GoodService";
import config from "../config/config.json";
import cake from "../assets/cake.svg";
import TextButton from "../components/TextButton";

const { UNITS } = config;

function EditGood() {
  const [editGoodLoading, setEditGoodLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    getGroups({
      setGroupsLoading,
      setGroups: (data) => {
        setInputs((prev) => {
          const temp = [...prev];
          for (let input of temp) {
            if (input.id === 2) {
              input.list = [
                { value: "-1", name: "Оставить без группы" },
                ...data.map((group) => {
                  return { value: group.id, name: group.name };
                }),
              ];
            }
          }
          return temp;
        });
      },
    });
  }, [params.id]);

  const buttons = [
    {
      icon: <BsArrowLeftCircle />,
      text: "Назад ко всем товарам",
      onClick: () => navigate("/goods"),
    },
  ];
  const [inputs, setInputs] = useState([
    {
      title: "Название",
      type: "input",
      inputType: "text",
      inputMode: "text",
      value: "",
      id: 0,
      name: "name",
    },
    {
      title: "Единица измерения",
      type: "select",
      value: "шт.",
      id: 1,
      list: UNITS,
      name: "unit",
    },
    {
      title: "Группа",
      type: "select",
      disabled: groupsLoading,
      value: "-1",
      id: 2,
      list: [{ value: "-1", name: "Оставить без группы" }],
      name: "series",
    },
    {
      title: "Цена",
      type: "input",
      inputType: "number",
      inputMode: "numeric",
      value: "",
      id: 3,
      placeholder: "0",
      name: "price",
    },
    {
      title: "Баркод",
      type: "input",
      inputType: "text",
      inputMode: "text",
      value: "",
      id: 4,
      name: "barcode",
    },
  ]);

  useEffect(() => {
    fetchGoodInfo({ setInputs, setFetchLoading, id: params.id });
  }, [params.id]);

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

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
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
        <div></div>
      </div>
      <div className={cl.NewGoodWrapper}>
        <div className={cl.firstHalf}>
          {inputs.map((input) => {
            if (input.type === "input") {
              return (
                <LegendInput
                  placeholder={input.placeholder}
                  key={input.id}
                  legend={input.title}
                  value={input.value}
                  setValue={(value) => handleChange(input.id, value)}
                  disabled={
                    editGoodLoading ||
                    input.disabled ||
                    fetchLoading ||
                    barcodeLoading ||
                    groupsLoading
                  }
                />
              );
            } else if (input.type === "select") {
              return (
                <div className={cl.SelectWrapper} key={input.id}>
                  <p className={cl.SelectTitle}>{input.title}</p>
                  <select
                    className={cl.Select}
                    disabled={
                      editGoodLoading ||
                      input.disabled ||
                      fetchLoading ||
                      barcodeLoading ||
                      groupsLoading
                    }
                    value={input.value}
                    onChange={({ target }) =>
                      handleChange(input.id, target.value)
                    }
                  >
                    {input.list.map((option) => {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            } else {
              return "";
            }
          })}
          <MyButton
            disabled={groupsLoading || fetchLoading || barcodeLoading}
            text="Сохранить"
            isLoading={editGoodLoading}
            onClick={() =>
              editGood({
                inputs,
                setEditGoodLoading,
                id: params.id,
              })
            }
          />
          <TextButton
            text="Сгенерировать баркод"
            onClick={() => {
              if (
                !(
                  barcodeLoading ||
                  editGoodLoading ||
                  groupsLoading ||
                  fetchLoading
                )
              ) {
                getBarcode({
                  setBarcodeLoading,
                  setBarcode: (value) => handleChange(4, value),
                });
              }
            }}
          />
        </div>
        <div className={cl.secondHalf}>
          <img src={cake} alt="" className={cl.Cake} />
        </div>
      </div>
    </div>
  );
}

export default EditGood;
