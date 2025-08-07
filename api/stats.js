export default async function handler(req, res) {
  try {
    const response = await fetch("http://pnode1.danbot.host:1186/v4/stats", {
      headers: {
        Authorization: "Yuvraj.apk#001",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Lavalink error" });
    }

    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal error", details: err.message });
  }
}
