import { useEffect, useState } from "react";
import { Card, Label } from "../components/UI";
import TeamLogo from "../components/TeamLogo";

type Team = {
  name: string;
  abbreviation: string;
  score: string | number | null;
};

type Game = {
  id: string;
  date: string;
  name: string;
  status: "pre" | "in" | "post";
  statusDetail: string;
  quarter: number;
  clock: string;
  venue: string;
  homeAway: string;
  seahawks: Team;
  opponent: Team;
};

type GameResponse = {
  game: Game | null;
  source: string;
  updatedAt: string;
};

function formatKickoff(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(date));
}

export default function Seahawks() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    let active = true;

    async function loadGame() {
      try {
        const response = await fetch("/api/seahawks/game");

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: GameResponse = await response.json();

        if (!active) return;

        setGame(data.game);
        setUpdatedAt(data.updatedAt);
        setError(null);
      } catch (err) {
        if (!active) return;

        console.error("Unable to load Seahawks game:", err);
        setError("Unable to update game information");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGame();

    // Refresh every 60 seconds.
    const interval = window.setInterval(loadGame, 60000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="screen seahawks">
        <Card className="game-center">
          <Label>SEATTLE SEAHAWKS</Label>
          <p>Loading game information...</p>
        </Card>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="screen seahawks">
        <Card className="game-center">
          <Label>SEATTLE SEAHAWKS</Label>
          <h2>No game currently available</h2>
          <p>{error || "Check back when the schedule is available."}</p>
        </Card>
      </div>
    );
  }

  const isLive = game.status === "in";
  const isFinal = game.status === "post";
  const isUpcoming = game.status === "pre";

  const statusText = isLive
    ? `LIVE · Q${game.quarter} · ${game.clock}`
    : isFinal
      ? "FINAL"
      : "UPCOMING";

  const seahawksScore = game.seahawks.score == null ? "—" : game.seahawks.score;

  const opponentScore = game.opponent.score == null ? "—" : game.opponent.score;

  return (
    <div className="screen seahawks">
      <Card className="game-center">
        <div className="card-heading">
          <Label>SEATTLE SEAHAWKS · GAME CENTER</Label>
          <span className="tag">{statusText}</span>
        </div>

        <div className="live-scoreboard">
          <div className="live-team">
            <TeamLogo team="SEA" size={76} />
            <strong>SEAHAWKS</strong>
            <span>SEA</span>
          </div>

          <div className="live-score-center">
            {isUpcoming ? (
              <>
                <div className="live-vs">VS</div>
                <div className="live-kickoff">{formatKickoff(game.date)}</div>
              </>
            ) : (
              <>
                <div className="live-score">
                  <span>{seahawksScore}</span>
                  <span className="score-divider">–</span>
                  <span>{opponentScore}</span>
                </div>
                <div className="live-kickoff">
                  {game.statusDetail || statusText}
                </div>
              </>
            )}
          </div>

          <div className="live-team">
            <TeamLogo team={game.opponent.abbreviation} size={76} />
            <strong>{game.opponent.name}</strong>
            <span>{game.opponent.abbreviation}</span>
          </div>
        </div>

        <div className="subline">
          <span>
            {game.homeAway === "home" ? "HOME" : "AWAY"} · {game.venue}
          </span>
          <span>ESPN GAME DATA</span>
        </div>
      </Card>

      <div className="seahawks-bottom">
        <Card>
          <Label>GAME STATUS</Label>
          <div className="status-large">{statusText}</div>
          <p>
            {isLive
              ? game.statusDetail || "Game in progress"
              : isFinal
                ? "The game has finished."
                : `Kickoff: ${formatKickoff(game.date)}`}
          </p>
        </Card>

        <Card>
          <Label>GAME DETAILS</Label>
          <div className="schedule-list">
            <div>
              <strong>Opponent</strong>
              <span>{game.opponent.name}</span>
            </div>
            <div>
              <strong>Location</strong>
              <span>{game.venue}</span>
            </div>
            <div>
              <strong>Kickoff</strong>
              <span>{formatKickoff(game.date)}</span>
            </div>
          </div>
          {updatedAt && (
            <p style={{ fontSize: 11, opacity: 0.5 }}>
              Last updated: {new Date(updatedAt).toLocaleTimeString()}
            </p>
          )}
          {error && <p>{error}</p>}
        </Card>
      </div>
    </div>
  );
}
