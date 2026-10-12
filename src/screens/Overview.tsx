import { ArrowUpRight } from "lucide-react";
import { demoData as d } from "../data";
import { Card, Label, Scoreboard, FantasyScores, fmt } from "../components/UI";
import TeamLogo from "../components/TeamLogo";
import PlayerHeadshot from "../components/PlayerHeadshot";
import SeahawksPlayer from "../components/SeahawksPlayer";

export default function Overview() {
  const top = d.fantasy.players[0];

  // Temporary Sleeper player IDs for testing
  const sleeperIds: Record<string, string> = {
    "Sam Darnold": "4943",
    "Jalen Milroe": "12510",
    "Drew Lock": "5854",
  };

  const playerId = sleeperIds[top.name];

  return (
    <div className="screen overview">
      <Card className="score-hero">
        <div className="card-heading">
          <Label>SEATTLE SEAHAWKS · GAME CENTER</Label>
          <span className="tag">SAMPLE GAME</span>
        </div>

        {/* Test the Sleeper team logos */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
            marginBottom: 12,
          }}
        >
          <TeamLogo team="SEA" size={64} />
          <span style={{ opacity: 0.5, fontWeight: 700 }}>VS</span>
          <TeamLogo team="SF" size={64} />
        </div>

        <Scoreboard />

        <div className="subline">
          <span>SEATTLE · LUMEN FIELD</span>
          <span>GAME DATA DEMO</span>
        </div>
      </Card>

      <div className="overview-bottom">
        <Card>
          <div className="card-heading">
            <Label>YOUR FANTASY MATCHUP</Label>
            <ArrowUpRight size={17} />
          </div>
          <FantasyScores />
        </Card>

        <Card className="top-player">
          <Label>SEAHAWKS PLAYER SPOTLIGHT</Label>
          <SeahawksPlayer />
        </Card>
      </div>
    </div>
  );
}
