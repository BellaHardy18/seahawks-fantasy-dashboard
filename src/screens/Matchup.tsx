import { demoData as d } from "../data";
import { Card, Label, FantasyScores, fmt } from "../components/UI";
export default function Matchup() {
  const f = d.fantasy;
  const projectionShare = Math.round(
    (100 * f.myProjected) / (f.myProjected + f.opponentProjected),
  );
  return (
    <div className="screen matchup">
      <Card className="matchup-head">
        <div className="card-heading">
          <Label>WEEK {d.meta.week} · HEAD TO HEAD</Label>
          <span className="tag">{f.league}</span>
        </div>
        <FantasyScores />
        <div className="projection-track">
          <span style={{ width: `${projectionShare}%` }} />
        </div>
        <div className="subline">
          <span>PROJECTED SCORE SHARE · {projectionShare}%</span>
          <span>NOT WIN PROBABILITY</span>
        </div>
      </Card>
      <div className="player-strip">
        {f.players.map((p) => (
          <Card className="player-tile" key={p.name}>
            <span className="position">{p.position}</span>
            <h3>{p.name}</h3>
            <p>
              {p.team} · PROJ {fmt(p.projected)}
            </p>
            <strong className="green">{fmt(p.points)}</strong>
          </Card>
        ))}
      </div>
    </div>
  );
}
