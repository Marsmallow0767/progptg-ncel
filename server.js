const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const OPENAI_API_KEY = "BURAYA_KENDI_API_KEYINI_YAZ"; // 🔑 OpenAI API anahtarını buraya yaz

// Ana sayfa
app.get("/", (req, res) => {
  res.render("index");
});

// Sohbet API
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Sen ProGPT adında yardımsever bir asistansın." },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Cevap alınamadı." });
  }
});

// Görsel oluşturma API
app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "gpt-image-1",
        prompt,
        size: "512x512"
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ imageUrl: response.data.data[0].url });
  } catch (err) {
    res.status(500).json({ error: "Görsel oluşturulamadı." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Çalışıyor: http://localhost:${PORT}`));
