const express = require("express");
const fs = require("fs");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const WEBHOOK = "https://discord.com/api/webhooks/1450715708525641812/1PNHBTwGcRmSjgi9DVMakaHtp3ismNAds8rxnfCD-7sKuND56kc8q1ca4zSBBa3ZmYxo";

app.post("/enviar", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  let data = [];

  if (fs.existsSync("postulaciones.json")) {
    data = JSON.parse(fs.readFileSync("postulaciones.json"));
  }

  if (data.find(p => p.ip === ip || p.correo === req.body.correo)) {
    return res.send("❌ Ya enviaste una postulación.");
  }

  const post = { ...req.body, ip };
  data.push(post);
  fs.writeFileSync("postulaciones.json", JSON.stringify(data, null, 2));

  const embed = {
    title: "📩 Nueva Postulación | Ivonia",
    color: 16744192,
    fields: Object.entries(req.body).map(([k, v]) => ({
      name: k.toUpperCase(),
      value: v || "N/A",
      inline: false
    }))
  };

  await fetch(WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] })
  });

  res.send("✅ Postulación enviada correctamente.");
});

app.listen(3000, () => console.log("🔥 Ivonia Postulaciones ON"));
