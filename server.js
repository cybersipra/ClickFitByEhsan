const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const busBoy = require("busboy");
const app = express();

const uploadDir = path.join(__dirname, "upload_images");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Bydefault for upload images using express endpoint and for getting images using node native endpoint.

//#region  Express Functionality for backend apis
app.use(express.static(__dirname));
app.use("/upload_images", express.static(uploadDir));
app.use("/public", express.static(path.join(__dirname, "public"))); 
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage: storage });

app.post("/uploadimages", upload.array("images"), (req, res) => {
  res.json({ message: "Images uploaded successfully!" });
});

app.get("/getimages", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to read files" });
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file));
    res.json({
      files: imageFiles.map(file => ({
        name: file,
        url: `/upload_images/${file}`
      }))
    });
  });
});

const expressServer = app.listen(0);
//#endregion Express Functionality for backend apis

//#region Node native functionality for backend api
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/uploadimagesnative") {
    const busboy = busBoy({ headers: req.headers });
    const uploadedFiles = [];
    busboy.on("file", (fieldname, file, filename) => {
      let realFilename = filename;
      if (typeof filename === "object" && filename !== null && "filename" in filename) {
        realFilename = filename.filename;
      }
      const saveTo = path.join(uploadDir, `${Date.now()}-${realFilename}`);
      file.pipe(fs.createWriteStream(saveTo));
      uploadedFiles.push(saveTo);
    });

    busboy.on("finish", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Images uploaded successfully!", files: uploadedFiles }));
    });

    req.pipe(busboy);
  }

  else if (req.method === "GET" && req.url === "/getimagesnative") {
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Failed to read files" }));
      }
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(f));
      const data = imageFiles.map(file => ({
        name: file,
        url: `/upload_images/${file}`
      }));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ files: data }));
    });
  }

  else {
    expressServer.emit("request", req, res);
  }
});
//#endregion Node native functionality for backend api

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});