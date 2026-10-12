import type {ReactNode} from 'react';
import {demoData as d} from '../data';
export const fmt=(n:number)=>n.toFixed(1);
export function Card({children,className=''}:{children:ReactNode;className?:string}){return <section className={'card '+className}>{children}</section>}
export function Label({children}:{children:ReactNode}){return <span className="label">{children}</span>}
export function Scoreboard(){const g=d.seahawks;return <div className="scoreboard"><div className="team-id"><div className="logo sea">SEA</div><span>SEAHAWKS</span></div><div className="score-center"><strong>{g.score}<i>–</i>{g.opponentScore}</strong><span>{g.state}</span></div><div className="team-id"><div className="logo rival">{g.opponentAbbr}</div><span>{g.opponent.toUpperCase()}</span></div></div>}
export function FantasyScores(){const f=d.fantasy;return <div className="fantasy-scores"><div><Label>YOUR TEAM</Label><strong className="green">{fmt(f.myScore)}</strong><span>{f.myTeam}</span><small>Proj. {fmt(f.myProjected)}</small></div><b>VS</b><div><Label>OPPONENT</Label><strong>{fmt(f.opponentScore)}</strong><span>{f.opponent}</span><small>Proj. {fmt(f.opponentProjected)}</small></div></div>}
