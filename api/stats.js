export default async function handler(req, res) {
  try {
    const stats = await fetch("http://pnode1.danbot.host:1186/v4/stats", {
      headers: {
        Authorization: "Yuvraj.apk#001"
      }
    }).then(r => r.json());

    res.setHeader("Cache-Control", "no-cache");
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Lavalink stats." });
  }
}
