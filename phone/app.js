import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import moment from "moment";
import writeXlsxFile from "write-excel-file/node";
import XLSX from "xlsx";
import ws from "websocket";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", { data: "", moment: moment });
});

app.post("/", async (req, res) => {
  axios({
    method: "get",
    url: "http://device.telematic.mflora.com.my/api/session?token=XKi6rzwPzJvjtkHctiiyeKlSdRl9PNPi",
    withCredentials: true,
  })
    .then((data) => {
      axios({
        method: "get",
        url: "http://device.telematic.mflora.com.my/api/devices?all=true",
        headers: { Cookie: data.headers["set-cookie"][0] },
      })
        .then((result) => {
          if (req.body.imei.trim() === "") {
            res.render("index", { data: [], moment: moment });
          } else {
            if (result.data.length > 0) {
              const theResult = result.data.filter((dt) => {
                if (typeof dt.phone === "string") {
                  return dt.phone.includes(req.body.imei);
                } else {
                  false;
                }
              });
              res.render("index", { data: theResult, moment: moment });
            } else {
              res.render("index", { data: [], moment: moment });
            }
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

app.post("/generate/:url", (req, res) => {
  if (req.params.url === "all") {
    axios({
      method: "get",
      url: "http://device.telematic.mflora.com.my/api/session?token=XKi6rzwPzJvjtkHctiiyeKlSdRl9PNPi",
      withCredentials: true,
    })
      .then((data) => {
        axios({
          method: "get",
          url: "http://device.telematic.mflora.com.my/api/devices",
          headers: { Cookie: data.headers["set-cookie"][0] },
        })
          .then(async (data) => {
            const obj = data.data;
            console.log(typeof data.data);
            const worksheet = XLSX.utils.json_to_sheet(obj);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

            XLSX.writeFile(
              workbook,
              "Generated_PDF/" +
                moment().format("YY") +
                moment().format("MM") +
                moment().format("DD") +
                moment().format("HH") +
                moment().format("mm") +
                moment().format("ss") +
                "_telematic-data-data.xlsx"
            );
            res.redirect("/");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  } else if (req.params.url === "loc") {
    axios({
      method: "get",
      url: "http://device.telematic.mflora.com.my/api/session?token=XKi6rzwPzJvjtkHctiiyeKlSdRl9PNPi",
      withCredentials: true,
    })
      .then((data) => {
        axios({
          method: "get",
          url: "http://device.telematic.mflora.com.my/api/positions",
          headers: { Cookie: data.headers["set-cookie"][0] },
        })
          .then(async (data) => {
            const obj = data.data;
            const worksheet = XLSX.utils.json_to_sheet(obj);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

            XLSX.writeFile(
              workbook,
              "Generated_PDF/" +
                moment().format("YY") +
                moment().format("MM") +
                moment().format("DD") +
                moment().format("HH") +
                moment().format("mm") +
                moment().format("ss") +
                "_telematic-data-loc.xlsx"
            );
            res.redirect("/");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
});

app.post("/rangedata", async (req, res) => {
  axios({
    method: "get",
    url: "http://device.telematic.mflora.com.my/api/session?token=XKi6rzwPzJvjtkHctiiyeKlSdRl9PNPi",
    withCredentials: true,
  }).then((data) => {
    axios({
      method: "get",
      url: "http://device.telematic.mflora.com.my/api/devices",
      headers: { Cookie: data.headers["set-cookie"][0] },
    }).then((data) => {
      const core = data.data.filter((result) => {
        return (
          result.lastUpdate !== null ||
          moment().diff(moment(result.lastUpdate), "days") < 31
        );
      });

      const obj = core;
      const worksheet = XLSX.utils.json_to_sheet(obj);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      XLSX.writeFile(
        workbook,
        "Generated_PDF/" +
          moment().format("YY") +
          moment().format("MM") +
          moment().format("DD") +
          moment().format("HH") +
          moment().format("mm") +
          moment().format("ss") +
          "_telematic-data-30hari-active.xlsx"
      );
      res.redirect("/");
    });
  });
});

app.listen(80);

// const obj = core ;
// const worksheet = XLSX.utils.json_to_sheet(obj);
// const workbook = XLSX.utils.book_new();
// XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

// XLSX.writeFile(
//   workbook,
//   "Generated_PDF/" +
//     moment().format("YY") +
//     moment().format("MM") +
//     moment().format("DD") +
//     moment().format("HH") +
//     moment().format("mm") +
//     moment().format("ss") +
//     "_telematic-data-30hari-active.xlsx"
// );
// res.redirect("/");
