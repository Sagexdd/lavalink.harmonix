export async function getLavalinkStats() {
  const API_URL = "http://pnode1.danbot.host:1186/v4/stats";
  const AUTH_HEADER = "Yuvraj.apk#001";

  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: AUTH_HEADER },
    });

    if (!res.ok) throw new Error("Request failed");

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching Lavalink stats:", error);
    return null;
  }
}
