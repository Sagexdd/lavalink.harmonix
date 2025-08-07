export default async function handler(req, res) {
  const lavalinkHost = "http://pnode1.danbot.host:1186/v4/stats";
  const password = "Yuvraj.apk#001";

  try {
    const response = await fetch(lavalinkHost, {
      headers: {
        Authorization: password
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch Lavalink stats" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching Lavalink stats" });
  }
}
