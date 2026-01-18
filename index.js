import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const CHANNEL_SECRET = process.env.CHANNEL_SECRET;
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

function verifySignature(body, signature) {
  const hash = crypto
    .createHmac("SHA256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

app.post("/webhook", async (req, res) => {
  const signature = req.headers["x-line-signature"];
  const body = JSON.stringify(req.body);

  if (!verifySignature(body, signature)) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body.events?.[0];
  if (event?.type === "message" && event.message?.type === "text") {
    await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text:
              "ขอบคุณที่ติดต่อ Flower Art Love 🌸\n" +
              "กรุณาแจ้งรายละเอียดการสั่งจอง:\n" +
              "- สีดอกกุหลาบ\n" +
              "- จำนวนดอก / งบประมาณ\n" +
              "- กระดาษห่อ\n" +
              "- รูปแบบช่อ",
          },
        ],
      }),
    });
  }

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Flower Art Love LINE API is running 🌸");
});

app.listen(3000, () => console.log("Server running"));