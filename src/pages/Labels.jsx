import { useState, useEffect, useCallback, useMemo } from "react";
import { BsPrinterFill } from "react-icons/bs";
import { BiChevronLeftCircle, BiDownload } from "react-icons/bi";
import cl from "../styles/Goods.module.css";
import { getGoodsAndGroups } from "../api/GoodService";
import Modal from "../components/Modal";
import SearchInput from "../components/SearchInput";
import LabelRow from "../components/LabelRow";
import LabelRowHeaders from "../components/LabelRowHeaders";
import { PDFDocument, degrees } from "pdf-lib";
import config from "../config/config.json";
import fontkit from "@pdf-lib/fontkit";
import { KJUR, KEYUTIL, stob64, hextorstr } from "jsrsasign";
import * as qz from "qz-tray";
import JsBarcode from "jsbarcode";
import { toPng } from "html-to-image";
import Button from "../components/Button";
const { SERVER_URL } = config;

qz.security.setCertificatePromise(function (resolve, reject) {
  resolve(
    "-----BEGIN CERTIFICATE-----\n" +
      "MIIEATCCAumgAwIBAgIUfc/Wpc+He/iyc6BWK3/yLqTP44IwDQYJKoZIhvcNAQELBQAwgY4xCzAJBgNVBAYTAktaMQ8wDQYDVQQIDAZBcW1vbGExDzANBgNVBAcMBkFzdGFuYTETMBEGA1UECgwKSmFja01hcmtldDELMAkGA1UECwwCSUUxFDASBgNVBAMMCyouZG9tcGVyLmt6MSUwIwYJKoZIhvcNAQkBFhZnYXNzeXJkYXVsZXRAZ21haWwuY29tMCAXDTIzMTAxMDExNTgxOFoYDzIwNTUwNDA0MTE1ODE4WjCBjjELMAkGA1UEBhMCS1oxDzANBgNVBAgMBkFxbW9sYTEPMA0GA1UEBwwGQXN0YW5hMRMwEQYDVQQKDApKYWNrTWFya2V0MQswCQYDVQQLDAJJRTEUMBIGA1UEAwwLKi5kb21wZXIua3oxJTAjBgkqhkiG9w0BCQEWFmdhc3N5cmRhdWxldEBnbWFpbC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2lzI7gLDj4OKcgL8GT/GZ/H+TQZojuBGyqC9XbyYA5xecIAQuasTf6tt+Nmv0tyA3sO/vnnenRCOzB8afWZahf2DZQ1+7Kq04acAbySgRix+e6zbUFTlgQmCA/MyiYVOKtWjsRwq+fGZJcFaJ/8A5H6OeUlck/Z5XZJ2tF6t+5rdDlUJnnvM23nYqRNcRecQRB26cXkNXMjFMAjAgm+ZL7uyu0j8ehcWNCybCS/RorK5i/7gnJgB1uyaxXrl20pZ/C804AM+BQP7uehw9clinjkSr+qoZT58AqehwW56nbQBP3hqQOgrqZShN6eOuXFPxZqbQphHDwavmGi1JKopjAgMBAAGjUzBRMB0GA1UdDgQWBBQ3cLnWQbbB8DyTCaoSeztGOwrk/jAfBgNVHSMEGDAWgBQ3cLnWQbbB8DyTCaoSeztGOwrk/jAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCOg/UBc1XkjOuUq7Sm6RbObIQeSHNEQvafYhNv99PhXPhdgdje09jzhI3Xgp0H7DUp+Qivll9sYN4fLJsEYgCrCdkDJ96anmHPJ1Cuxrq/GiWn/PLEmNPJgLc9djlX+4e7txxGW+/kPOrBbqap8pY9odtMoh5qpZ/l4zmPmlRejNy+Z9hghlXyPNJF9mNn/dSagtHsjozSXJ4cYgOAQnQavchxGNmCzPUnJRwOR+MMkJVw2RJQTBQY+tajCiEOD2voUHKZZaIQo685wM0tnHbjtzacPRHcE985PkJNeFVPUtvSVnh0mmVBp4gDLO2GgikXZ9FYuI7L+ZC2qqT+FefU\n" +
      "-----END CERTIFICATE-----"
  );
});

const privateKey =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC2lzI7gLDj4OKcgL8GT/GZ/H+TQZojuBGyqC9XbyYA5xecIAQuasTf6tt+Nmv0tyA3sO/vnnenRCOzB8afWZahf2DZQ1+7Kq04acAbySgRix+e6zbUFTlgQmCA/MyiYVOKtWjsRwq+fGZJcFaJ/8A5H6OeUlck/Z5XZJ2tF6t+5rdDlUJnnvM23nYqRNcRecQRB26cXkNXMjFMAjAgm+ZL7uyu0j8ehcWNCybCS/RorK5i/7gnJgB1uyaxXrl20pZ/C804AM+BQP7uehw9clinjkSr+qoZT58AqehwW56nbQBP3hqQOgrqZShN6eOuXFPxZqbQphHDwavmGi1JKopjAgMBAAECggEAGhFe+hDG8FnAcKCO5StPrnDWk+L3Sycx26RYUe7L6bAUdlU505ipr+A7YvsJEaB9aIYJ01d39LjtMden20Mylq71WD9esP2ISngKlczzvAF1S76ADupSzTPczD2LR5mGkFSS/Lytw4FGJzDzIfOR8XXbabSOvXi5/Pcf7cDl2pF+UzA4soIGUgB37wEpVyNDNtlHXK14btrWPoxFfLEHSpI7LR1JJkA6BgudOq4Q0PpsMGFu5OzmJYRokeE3jze6kHGTFjiw3ejXK2n0xXVFi0HdvI48tKyuC2bsht9pTKLbLBexHrsJO6vsA1HGsXoeQ4DETZEXTWWboXn+O09iqQKBgQD9GH0mkqdaG4vktBBRMfPFhMjIbjszNuNK9LQwnEc5KoN7BcGnxZqwdzaR9grqnCYiFKnIhxBajZswxNLZvbuVYbX9ofGyY5fxnjRp4/Q341w2fqFq39VeLgfXKVd350IGMZJcxjS+/UqkIYcQipElZpQhxU22ghZ3yoP8EcrayQKBgQC4r5Y+llwjtxCvfaUIwiKf3Px4vEC4CxinkK329DxFY89KOWgxXAbxEjqMAc3yHfjCtFG3CJ8iJ14UpGNzQOL4aMBFNxilgYjmrGDjWtiKjjqllFk55ECSKe2ZOXJv/mw8yLOmvWq1uWM/42TA2yEBb1Z1RoP1kiqREDOGJjAlywKBgARz5tfD4r/aFjb62AKlr1U9Rc8I6W+4On16GqV0Smh+D/wdGNAb0OHj5wjgXEbOYnldBbOqdKYzMZTFEbSU+vTg2DPTIo5x5B1zHBb01Loa/OdUiQB5Waajhq3JY2mPnwC+5IVPU2Q8zpBeqqKm3XDcAiUp9HkOhtiqrnHD2l7JAoGBAIDXPeF709u2opVK+g8aID2WVSuFaUD7vL9pV3Oo/0MJVltZoS6OHOmg5ec2ew4lip2KXldqVFnnTOLpq9eDtNPHgBrJTRBpRbBnIVB62AYRIyjQTU7txX4ycecrBILM44WkHnB8RC1yn6K6aFeCh4wQuCgogXaX+copm0hC6+PxAoGBAL6GHFOEhA1eSECcQS35Bd7d8h3tduHb+h849wt5T2VZJ1QTPaiSRzqL11BN0ZEZ2k0SPp6jmYhA/5aH2JFuaQupnuK8Oc/vbbnmvM1ZwNN2edo+KceO20M7+diopaOBtSDY9o0D8n9+NdYsq8ThtIC7O4ZSDPXvlgVKe3QDthpY\n" +
  "-----END PRIVATE KEY-----";

qz.security.setSignatureAlgorithm("SHA512");

qz.security.setSignaturePromise(function (hash) {
  return function (resolve, reject) {
    try {
      const pk = KEYUTIL.getKey(privateKey);
      const sig = new KJUR.crypto.Signature({ alg: "SHA512withRSA" }); // Use "SHA1withRSA" for QZ Tray 2.0 and older
      sig.init(pk);
      sig.updateString(hash);
      const hex = sig.sign();
      // console.log("DEBUG: \n\n" + stob64(hextorstr(hex)));
      resolve(stob64(hextorstr(hex)));
    } catch (err) {
      console.error(err);
      reject(err);
    }
  };
});

function Labels() {
  const [processLoading, setProcessLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [addGoodModal, setAddGoodModal] = useState(false);
  const [goodsVisible, setGoodsVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [search, setSearch] = useState("");
  const [goods, setGoods] = useState([]);
  const [pickedGoods, setPickedGoods] = useState([]);
  const [groups, setGroups] = useState([]);

  const blobToBase64 = async (blob) => {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result1 = reader.result;
        const result2 = result1.substr(result1.indexOf(",") + 1);
        resolve(result2);
      };
      reader.readAsDataURL(blob);
    });
  };

  const buttons = [];
  const buttons2 = [
    {
      disabled: processLoading,
      icon: <BsPrinterFill />,
      text: "Печатать",
      onClick: () => {
        createPDFLabels(true);
      },
    },
    {
      disabled: processLoading,
      icon: <BiDownload />,
      text: "Скачать",
      onClick: () => {
        createPDFLabels(false);
      },
    },
  ];

  const sortFilteredGoods = useMemo(() => {
    try {
      if (!selectedGroup.id) {
        return [...goods];
      }
      const temp = [...goods].filter((good) => {
        return good.series === selectedGroup.id;
      });
      return temp;
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [goods, selectedGroup]);

  const filteredGoods = useMemo(() => {
    try {
      const temp = [...sortFilteredGoods].filter(
        (good) =>
          good.name.toLowerCase().includes(search.toLowerCase()) ||
          good.barcode.toLowerCase().includes(search.toLowerCase()) ||
          (good.id + "").toLowerCase().includes(search.toLowerCase())
      );
      return temp;
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [sortFilteredGoods, search]);

  useEffect(() => {
    JsBarcode("#barcode", "Hi!");
    getGoodsAndGroups({ setFetchLoading, setGoods, setGroups, next: () => {} });
  }, []);

  useEffect(() => {
    qz.websocket.connect().catch((e) => {
      console.log("QZ connect Error:", e?.message);
    });
    return () => {
      qz.websocket.disconnect().catch((e) => {
        console.log("QZ disconnect Error:", e?.message);
      });
    };
  }, []);

  const newGood = useCallback((good) => {
    setPickedGoods((prev) => {
      const temp = [...prev];
      for (let item of temp) {
        if (item.id === good.id) {
          item.quantity = parseInt(item.quantity) + 1;
          return temp;
        }
      }
      temp.push(good);
      return temp;
    });
  }, []);

  const createPDFLabels = async (print) => {
    try {
      setProcessLoading(true);
      const reguFontBytes = await fetch(SERVER_URL + "/fonts/oswald.ttf").then(
        (res) => res.arrayBuffer()
      );
      const boldFontBytes = await fetch(
        SERVER_URL + "/fonts/oswaldmedium.ttf"
      ).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const boldFont = await pdfDoc.embedFont(boldFontBytes);
      const reguFont = await pdfDoc.embedFont(reguFontBytes);
      for (let good of pickedGoods) {
        try {
          const { quantity } = good;
          for (let i = 0; i < quantity; i++) {
            JsBarcode("#barcode", good.barcode, {});
            const barcode = document.getElementById("barcode");
            const barcodeBytes = await toPng(barcode);
            const image = await pdfDoc.embedPng(barcodeBytes);
            const imgDims = image.scale(0.88);
            const page = pdfDoc.addPage([300, 180]);
            const textHeight = imgDims.height;
            const price = good.price + "";
            const currency = "тг";
            const name = `[ID: ${good.id}] ${good.name}`;
            const getLine = (text, max) => {
              for (let i = max; i > 0; i--) {
                if (i > text.length - 1) {
                  return [text.slice(0, i), i];
                }
                if (text[i] === " ") {
                  return [text.slice(0, i), i];
                }
              }
            };
            const [firstLine, index] = getLine(name, 26);
            const [secondLine, secondIndex] = getLine(
              name.slice(index + 1, name.length),
              26
            );
            const ellipsis = secondIndex + index >= name.length;
            const priceSize =
              price.length > 4 ? (price.length > 6 ? 20 : 35) : 50;
            const nameSize = 15;
            const currencySize = 30;
            const boldWidth = boldFont.widthOfTextAtSize(price, priceSize);
            const boldHeight = boldFont.heightAtSize(priceSize);
            const nameWidth = reguFont.widthOfTextAtSize(firstLine, nameSize);
            const name2Width = reguFont.widthOfTextAtSize(
              secondLine + (ellipsis ? "" : "..."),
              nameSize
            );
            const nameHeight = reguFont.heightAtSize(nameSize);
            const currencyWidth = boldFont.widthOfTextAtSize(
              currency,
              currencySize
            );
            page.drawImage(image, {
              x: page.getWidth(),
              y: (page.getHeight() - imgDims.width) / 2,
              width: imgDims.width,
              height: imgDims.height,
              rotate: degrees(90),
            });
            page.drawText(price, {
              x:
                (page.getWidth() - textHeight) / 2 -
                (boldWidth + currencyWidth + 5) / 2,
              y: page.getHeight() * 0.65 - boldHeight / 2,
              size: priceSize,
              font: boldFont,
            });
            page.drawLine({
              start: {
                x: page.getWidth() - textHeight,
                y: 0,
              },
              end: {
                x: page.getWidth() - textHeight,
                y: page.getHeight(),
              },
            });
            page.drawText(currency, {
              x:
                (page.getWidth() - textHeight) / 2 +
                5 +
                (boldWidth + currencyWidth + 5) / 2 -
                currencyWidth,
              y: page.getHeight() * 0.65 - boldHeight / 2,
              font: boldFont,
              size: currencySize,
            });
            page.drawText(firstLine, {
              x: (page.getWidth() - textHeight) / 2 - nameWidth / 2,
              y: page.getHeight() * 0.35 - nameHeight / 2,
              font: reguFont,
              size: nameSize,
            });
            page.drawText(secondLine + (ellipsis ? "" : "..."), {
              x: (page.getWidth() - textHeight) / 2 - name2Width / 2,
              y: page.getHeight() * 0.35 - 15 - nameHeight / 2,
              font: reguFont,
              size: nameSize,
            });
          }
        } catch (e) {
          console.log("Single Page Render Error:", e);
        }
      }
      if (pickedGoods.length === 0) {
        pdfDoc.addPage([200, 120]);
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const base64PDF = await blobToBase64(blob);
      if (print) {
        try {
          const config = qz.configs.create("Xprinter XP-330B", {
            orientation: "portrait",
            size: { width: 43, height: 25 },
            units: "mm",
            scaleContent: true,
          });
          await qz.print(config, [
            {
              type: "pixel",
              format: "pdf",
              flavor: "base64",
              data: base64PDF,
            },
          ]);
          setProcessLoading(false);
        } catch (err) {
          setProcessLoading(false);
          console.error("Print Error: ", err?.message);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.target = "_blank";
        // link.download = "labels.pdf";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setProcessLoading(false);
      }
    } catch (e) {
      setProcessLoading(false);
      console.log("CreatePDFLabels Error:", e);
    }
  };

  useEffect(() => {
    if (search !== "") {
      setGoodsVisible(true);
    } else {
      setGoodsVisible(false);
      setSelectedGroup({});
    }
  }, [search]);

  useEffect(() => {
    const handleEvent = (e) => {
      if (e.target.id === "main") {
        if (e.key === "Backspace") {
          setBarcodeInput(barcodeInput.slice(0, barcodeInput.length - 1));
          return;
        }
        if (e.key === "Enter") {
          if (fetchLoading) {
            return;
          }
          const temp = [...goods];
          for (let item of temp) {
            if (item.barcode === barcodeInput) {
              newGood({
                id: item.id,
                name: item.name,
                quantity: 1,
                price: item.price,
                barcode: item.barcode,
              });
              break;
            }
          }
          setBarcodeInput("");
          return;
        }
        if (e.key.length > 1) {
          return;
        }
        if (!/[\da-zA-Zа-яА-Яё]/.test(e.key)) {
          return;
        }
        if (barcodeInput.length >= 20) {
          setBarcodeInput(barcodeInput.slice(1, barcodeInput.length) + e.key);
          return;
        }
        setBarcodeInput(barcodeInput + e.key);
      }
    };
    document.addEventListener("keydown", handleEvent);
    return () => {
      document.removeEventListener("keydown", handleEvent);
    };
  }, [barcodeInput, fetchLoading, goods, newGood]);

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div className={cl.OptionsButtons}>
          {buttons.map((button) => {
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
          })}
        </div>
        <div className={cl.OptionsButtons}>
          <button
            disabled={fetchLoading || processLoading}
            onClick={() => setAddGoodModal(true)}
            className={cl.OptionsButton}
          >
            Добавить товар
          </button>
          {buttons2.map((button) => {
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
          })}
        </div>
      </div>
      <div className={cl.goodsWrapper}>
        <div
          className={cl.groupsWrapper}
          style={{ padding: "5px", alignItems: "center" }}
        >
          <svg id="barcode"></svg>
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}></div>
          <div className={cl.tableWrapper}>
            <table>
              <thead>
                <LabelRowHeaders />
              </thead>
              {pickedGoods.length === 0 ? (
                <tbody style={{ width: "100%", textAlign: "center" }}>
                  <tr>
                    <td colSpan={10}>Товары не выбраны</td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {pickedGoods.map((good, index) => {
                    return (
                      <LabelRow
                        editable={!processLoading}
                        fetch={fetch}
                        key={good.id}
                        good={good}
                        index={index + 1}
                        setGoods={setPickedGoods}
                        goods={pickedGoods}
                      />
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
      <Modal setModalVisible={setAddGoodModal} modalVisible={addGoodModal}>
        <div className={cl.AddGood}>
          <div className={cl.navigationWrapper}>
            <div className={cl.navigation}>
              <div
                onClick={() => {
                  if (goodsVisible) {
                    setGoodsVisible(false);
                    setSelectedGroup({});
                    setSearch("");
                  } else {
                    setAddGoodModal(false);
                  }
                }}
                className={cl.navigationButton}
              >
                <BiChevronLeftCircle size={25} />
                Назад
              </div>
              <Button
                text="Выбрать все"
                onClick={() => {
                  for (let good of filteredGoods) {
                    newGood({
                      id: good.id,
                      name: good.name,
                      quantity: 1,
                      price: good.price,
                      barcode: good.barcode,
                    });
                  }
                }}
                className={cl.NavigationGroupName}
              />
              <SearchInput
                autoFocus={true}
                placeholder="Поиск"
                value={search}
                setValue={setSearch}
              />
            </div>
          </div>
          <div className={cl.itemsWrapper}>
            {goodsVisible ? (
              <div className={cl.GoodItems}>
                {filteredGoods.map((good) => {
                  return (
                    <div
                      key={good.id}
                      onClick={() => {
                        newGood({
                          id: good.id,
                          name: good.name,
                          quantity: 1,
                          price: good.price,
                          barcode: good.barcode,
                        });
                      }}
                      className={cl.OptionsButton}
                    >
                      {good.name}
                      {` (id:${good.id}) Остаток: ${good.remainder} ${good.unit}`}
                    </div>
                  );
                })}
                {filteredGoods.length === 0 ? "Нет товаров" : ""}
              </div>
            ) : (
              <div className={cl.GroupItems}>
                <div
                  onClick={() => {
                    setSelectedGroup({
                      id: -1,
                      name: "Товары без группы",
                    });
                    setGoodsVisible(true);
                  }}
                  className={cl.OptionsButton}
                >
                  Товары без группы
                </div>
                {groups.map((group) => {
                  return (
                    <div
                      key={group.id}
                      onClick={() => {
                        setSelectedGroup(group);
                        setGoodsVisible(true);
                      }}
                      className={cl.OptionsButton}
                    >
                      {group.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Labels;
