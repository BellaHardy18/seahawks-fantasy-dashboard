import { useEffect, useState } from "react";
import PlayerHeadshot from "./PlayerHeadshot";

type SleeperPlayer = {
  id: string;
  name: string;
  team: string;
  position: string | null;
  number: number | null;
  status: string | null;
  injuryStatus: string | null;
  depthChartOrder: number | null;
};

export default function SeahawksPlayer() {
  const [player, setPlayer] = useState<SleeperPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlayer() {
      try {
        const response = await fetch("/api/players?team=SEA", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        const starter = data.players.find(
          (p: SleeperPlayer) =>
            p.position === "QB" &&
            p.depthChartOrder === 1 &&
            p.status === "Active",
        );

        if (starter) {
          setPlayer(starter);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Unable to load Seahawks player:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPlayer();

    return () => controller.abort();
  }, []);

  if (loading) return <p>Loading player...</p>;
  if (!player) return <p>Player unavailable</p>;

  return (
    <div className="player-feature">
      <PlayerHeadshot playerId={player.id} name={player.name} size={64} />

      <div>
        <h2>{player.name}</h2>
        <p>
          #{player.number ?? "—"} · {player.position} · {player.team}
        </p>
        <strong className="green">{player.status}</strong>
      </div>
    </div>
  );
}
