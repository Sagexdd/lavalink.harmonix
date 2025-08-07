export default async function handler(req, res) {
  const url = "http://pnode1.danbot.host:1186/v4/stats";

  try {
    const response = await fetch(url, {
      headers: { Authorization: "Yuvraj.apk#001" },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "Failed to load stats" });
  }
}
