import { KJUR, KEYUTIL, stob64, hextorstr } from "jsrsasign";
import * as qz from "qz-tray";
import { PDFDocument, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import config from "../config/config.json";
import moment from "moment";
import { toPng } from "html-to-image";
import JsBarcode from "jsbarcode";

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

export const createPDFReceipt = async (
  receiptId,
  receiptDate,
  cashier,
  change,
  totalDiscountSum,
  totalSum,
  printCheck,
  goodsForSell,
  download = false
) => {
  try {
    if (!printCheck) {
      if (!download) {
        return;
      }
    }
    const storeName = "JACK MARKET";
    const storeDesc = "Товары для дома";
    const storeAddress = "Косшыгулулы 20 | +7 (702) 196 38 00";
    const date = moment(receiptDate).format("DD.MM.yyyy HH:mm");

    const boldFontBytes = await fetch(
      SERVER_URL + "/fonts/oswaldmedium.ttf"
    ).then((res) => res.arrayBuffer());
    const reguFontBytes = await fetch(SERVER_URL + "/fonts/oswald.ttf").then(
      (res) => res.arrayBuffer()
    );
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const boldFont = await pdfDoc.embedFont(boldFontBytes);
    const reguFont = await pdfDoc.embedFont(reguFontBytes);
    const marginTop = 20;
    const marginLeft = 15;
    const marginRight = 15;
    const fontSize = 20;
    const textHeight = reguFont.heightAtSize(fontSize);
    const boldHeight = boldFont.heightAtSize(fontSize);
    const pageWidth = 300;
    let goodsListHeight = 0;
    goodsForSell.forEach(() => {
      goodsListHeight += 40;
    });
    const pageHeight =
      marginTop +
      textHeight +
      16 +
      5 * (15 + textHeight) -
      15 +
      41 +
      20 +
      goodsListHeight +
      45 +
      15 +
      boldHeight +
      2 * (15 + textHeight) -
      textHeight;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const drawTextAtCenter = (text, yOffset, fontType = reguFont) => {
      const textWidth = fontType.widthOfTextAtSize(text, fontSize);
      const textHeight = fontType.heightAtSize(fontSize);
      page.drawText(text, {
        font: fontType,
        x: page.getWidth() / 2 - textWidth / 2,
        y: page.getHeight() - yOffset - textHeight - marginTop,
        size: fontSize,
      });
    };
    const drawTextAtStart = (text, yOffset, fontType = reguFont) => {
      const textHeight = fontType.heightAtSize(fontSize);
      page.drawText(text, {
        font: fontType,
        x: marginLeft,
        y: page.getHeight() - yOffset - textHeight - marginTop,
        size: fontSize,
      });
    };
    const drawTextAtEnd = (text, yOffset, fontType = reguFont) => {
      const textWidth = fontType.widthOfTextAtSize(text, fontSize);
      const textHeight = fontType.heightAtSize(fontSize);
      page.drawText(text, {
        font: fontType,
        x: page.getWidth() - marginRight - textWidth,
        y: page.getHeight() - yOffset - textHeight - marginTop,
        size: fontSize,
      });
    };
    const drawLine = (yOffset) => {
      const lineThickness = 2;
      const finalYOffset =
        page.getHeight() - yOffset - marginTop - lineThickness;
      page.drawLine({
        start: { x: 10, y: finalYOffset },
        end: { x: page.getWidth() - 10, y: finalYOffset },
        thickness: lineThickness,
      });
    };
    drawTextAtCenter(storeName, 0);
    drawLine(40);
    drawTextAtStart(storeDesc, 60);
    drawTextAtStart(storeAddress, 80);
    drawTextAtStart("Чек: #" + receiptId, 100);
    drawTextAtStart("Дата: " + date, 120);
    drawTextAtStart("Кассир: " + cashier, 140);
    drawTextAtCenter("ЧЕК ПРОДАЖИ", 170);
    drawLine(200);
    let marginBetweenGoods = 0;
    for (let good of goodsForSell) {
      drawTextAtStart(good.name, 210 + marginBetweenGoods);
      drawTextAtEnd(
        `${good.quantity} шт X ${good.price.toFixed(2)} = ${(
          good.quantity * good.price
        ).toFixed(2)} тг`,
        230 + marginBetweenGoods
      );
      marginBetweenGoods += 40;
    }
    drawTextAtEnd(
      `${
        totalDiscountSum >= 0 ? "Скидка:" : "Наценка:"
      } ${totalDiscountSum} тг`,
      260 + marginBetweenGoods,
      reguFont
    );
    drawTextAtEnd(`ИТОГО: ${totalSum} тг`, 280 + marginBetweenGoods, boldFont);
    // drawTextAtEnd(`Сдача: ${change} тг`, 205 + marginBetweenGoods);
    drawLine(320 + marginBetweenGoods);
    drawTextAtCenter(
      "*НАШ ИНТСТАГРАМ @JACK_MARKET_KZ*",
      330 + marginBetweenGoods
    );
    drawTextAtCenter("*Спасибо за покупку!*", 350 + marginBetweenGoods);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const base64PDF = await blobToBase64(blob);
    if (printCheck) {
      try {
        const config = qz.configs.create("XP-58", {
          encoding: "PC866",
          rasterize: false,
          orientation: "portrait",
        });
        await qz.print(config, [
          {
            type: "pixel",
            format: "pdf",
            flavor: "base64",
            data: base64PDF,
          },
        ]);
      } catch (err) {
        console.error("Print Error: ", err?.message);
      }
    }
    if (download) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "receipt";
      link.target = "_blank";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    console.log("CreatePDFLabels Error:", e);
  }
};

export const createPDFLabels = async (
  setProcessLoading,
  pickedGoods,
  print
) => {
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
