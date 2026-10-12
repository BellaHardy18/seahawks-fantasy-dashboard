const SLEEPER_URL = "https://api.sleeper.app/v1/players/nfl";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

let cachedPlayers = null;
let lastUpdated = 0;
let pendingRequest = null;

export async function getSleeperPlayers() {
  const now = Date.now();

  if (cachedPlayers && now - lastUpdated < CACHE_DURATION) {
    return cachedPlayers;
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = (async () => {
    const response = await fetch(SLEEPER_URL);

    if (!response.ok) {
      throw new Error(`Sleeper API error: ${response.status}`);
    }

    const players = await response.json();

    cachedPlayers = players;
    lastUpdated = Date.now();

    return players;
  })();

  try {
    return await pendingRequest;
  } catch (error) {
    if (cachedPlayers) return cachedPlayers;
    throw error;
  } finally {
    pendingRequest = null;
  }
}

export async function getPlayersByTeam(team) {
  const players = await getSleeperPlayers();
  const teamCode = team.toUpperCase();

  return Object.values(players)
    .filter((player) => player.team === teamCode)
    .map((player) => ({
      id: player.player_id,
      name: player.full_name,
      team: player.team,
      position: player.position,
      number: player.number,
      status: player.status,
      injuryStatus: player.injury_status,
      depthChartOrder: player.depth_chart_order,
      headshotUrl: `https://sleepercdn.com/content/nfl/players/thumb/${player.player_id}.jpg`,
    }))
    .sort((a, b) => {
      return (a.depthChartOrder ?? 99) - (b.depthChartOrder ?? 99);
    });
}
