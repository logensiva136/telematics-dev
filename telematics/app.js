import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import moment from "moment";
import writeXlsxFile from "write-excel-file/node";

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
            const theResult = result.data.filter((data) => {
              return data.uniqueId.includes(req.body.imei);
            });
            res.render("index", { data: theResult, moment: moment });
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

app.post("/generate", (req, res) => {
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
              "_telematic-data.xlsx"
          );
          res.redirect("/");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

app.listen(80);
