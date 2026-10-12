const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/sea/schedule";

const CACHE_DURATION = 60 * 1000;

let cachedSchedule = null;
let lastUpdated = 0;

export async function getSeahawksGame() {
  const now = Date.now();

  if (cachedSchedule && now - lastUpdated < CACHE_DURATION) {
    return cachedSchedule;
  }

  try {
    const response = await fetch(ESPN_URL, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data = await response.json();

    const games = (data.events || [])
      .map((event) => {
        const competition = event.competitions?.[0];
        const competitors = competition?.competitors || [];

        const seahawks = competitors.find(
          (team) => team.team?.abbreviation?.toUpperCase() === "SEA",
        );

        const opponent = competitors.find(
          (team) => team.team?.abbreviation?.toUpperCase() !== "SEA",
        );

        if (!seahawks || !opponent) return null;

        const status = competition?.status || event.status || {};
        const state = status.type?.state || "pre";

        return {
          id: event.id,
          date: event.date,
          name: event.name,
          status: state,
          statusDetail: status.type?.shortDetail || "",
          quarter: status.period || 0,
          clock: status.displayClock || "",
          venue: competition?.venue?.fullName || "TBD",
          homeAway: seahawks.homeAway,
          seahawks: {
            name: seahawks.team?.displayName || "Seattle Seahawks",
            abbreviation: "SEA",
            score: seahawks.score ?? null,
          },
          opponent: {
            name: opponent.team?.displayName || "Opponent TBD",
            abbreviation: opponent.team?.abbreviation || "",
            score: opponent.score ?? null,
          },
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const currentTime = Date.now();

    // Prefer a game currently in progress.
    const liveGame = games.find((game) => game.status === "in");

    // Otherwise, select the next upcoming game.
    const nextGame = games.find(
      (game) =>
        game.status === "pre" &&
        new Date(game.date).getTime() >= currentTime - 3600000,
    );

    // If no upcoming game exists, show the most recent completed game.
    const completedGames = games.filter(
      (game) =>
        game.status === "post" && new Date(game.date).getTime() <= currentTime,
    );

    const latestGame = completedGames.at(-1);

    const result = {
      game: liveGame || nextGame || latestGame || null,
      totalGames: games.length,
      source: "ESPN",
      updatedAt: new Date().toISOString(),
    };

    cachedSchedule = result;
    lastUpdated = Date.now();

    return result;
  } catch (error) {
    if (cachedSchedule) return cachedSchedule;
    throw error;
  }
}
