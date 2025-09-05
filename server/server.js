import express from "express";
import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { connectDB} from "./configs/connectDB.js";
import Text from "./models/text.model.js";
import CryptoJS from "crypto-js";
import morgan from "morgan";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import File from "./models/files.model.js";


await connectDB();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const PORT = process.env.PORT || 5000;
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Replace diskStorage with memoryStorage
const upload = multer({
  storage: multer.memoryStorage(),
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    console.log(req.file)
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: "File size exceeds 10MB limit" });
    }
    // Upload directly from buffer to Supabase
    const filename = `${Date.now()}-${uuidv4()}.${req.file.originalname.split('.').pop()}`;
    const { data, error } = await supabase.storage
      .from("files")
      .upload(filename, req.file.buffer, {
        cacheControl: "86400",
        upsert: false,
        contentType: req.file.mimetype,
      });
    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ message: "Error uploading file", error });
    }
    const file = await File.create({
      fileName: req.file.originalname,
      path: data.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
    const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/files/${data.path}`;
    res.status(201).json({ message: "File uploaded successfully", file, url });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});


app.get("/", (req, res) => {
  res.send("API is running...");
});

app.post("/api/text-share", async (req, res) => {
  const { url, text, isEncrypted, content_url } = req.body;
  console.log(req.body)
  if(content_url && url){
    let short_url;
  if (url.substring(0, 35) === "https://code-share-mern.vercel.app/") {
    short_url = url.replace("https://code-share-mern.vercel.app/", "");
  }

  // if (url.substring(0, 22) === "http://localhost:5173/") {
  //   short_url = url.replace("http://localhost:5173/", "");
  // }
  if (!short_url) {
    return res.status(400).json({ message: "Invalid URL" });
  }
  const newText = await Text.create({ url: short_url, content_url, isEncrypted });
  return res.status(201).json({ message: "Content URL shared successfully" });
  }
  if (!url || !text) {
    return res.status(400).json({ message: "URL and text are required" });
  }
  let short_url;
  if (url.substring(0, 35) === "https://code-share-mern.vercel.app/") {
    short_url = url.replace("https://code-share-mern.vercel.app/", "");
  }
  // if (url.substring(0, 22) === "http://localhost:5173/") {
  //   short_url = url.replace("http://localhost:5173/", "");
  // }
  if (!short_url) {
    return res.status(400).json({ message: "Invalid URL" });
  }
  const newText = await Text.create({ url: short_url, text, isEncrypted });
  res.status(201).json({ message: "Text shared successfully" });
});

app.post("/api/encrypt-text", async (req, res) => {
  const { text, key } = req.body;

  try {
    const cipherText = CryptoJS.AES.encrypt(text, key).toString();
    res
      .status(200)
      .json({ message: "Text encrypted successfully", text: cipherText });
  } catch (error) {
    res.status(500).json({ message: "Error encrypting text", error });
  }
});

app.get("/api/text-share", async (req, res) => {
  try {
    const { url, key } = req.query;
    const data = await Text.findOne({ url }).sort({ createdAt: -1 });
    if (!data) {
      return res.status(404).json({ message: "Text not found" });
    }

    if (key) {
      console.log(key);
      const bytes = CryptoJS.AES.decrypt(data.text, key);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      // res.status(200).json({ message: "Text retrieved successfully", data: originalText });
    }

    res
      .status(200)
      .json({
        message: "Text retrieved successfully",
        data: data.text || data.content_url,
      });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving texts", error });
  }
});

app.listen(PORT, async () => {
  console.error("Server is running on http://localhost:" + PORT);
});