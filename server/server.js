import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./configs/connectDB.js";
import Text from "./text.js";
import CryptoJS from "crypto-js";
import morgan from "morgan";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors(
    {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.get("/", (req, res) => {
    res.send("API is running...");
})
 
app.post("/api/text-share", async (req, res) => {
    const {url, text, isEncrypted} = req.body;
    if(!url || !text) {
        return res.status(400).json({ message: "URL and text are required" });
    }
    let short_url;
    if(url.substring(0, 22) === "http://localhost:5173/") {
        short_url = url.replace("http://localhost:5173/", "");
    }
    if(!short_url){
        return res.status(400).json({ message: "Invalid URL" });
    }
    const newText = await Text.create({ url:short_url, text, isEncrypted });
    res.status(201).json({ message: "Text shared successfully" });
})

app.post("/api/encrypt-text", async (req, res) => {
    const { text, key } = req.body;

    try {
        const cipherText = CryptoJS.AES.encrypt(text,key).toString();
        res.status(200).json({ message: "Text encrypted successfully", text: cipherText });
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
            console.log(key)
            const bytes = CryptoJS.AES.decrypt(data.text, key);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            // res.status(200).json({ message: "Text retrieved successfully", data: originalText });
        }


        res.status(200).json({ message: "Text retrieved successfully", data: data.text || originalText });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving texts", error });
    }
});


app.listen(PORT, async () => {
  await connectDB();
  console.error("Server is running on http://localhost:"+PORT);
});