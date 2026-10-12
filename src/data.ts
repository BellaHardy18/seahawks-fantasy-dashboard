// All UI views consume this normalized data shape. Replace demoData with a provider later.
export type Player = { name: string; position: string; team: string; points: number; projected: number; active: boolean };
export type Standing = { rank: number; name: string; wins: number; losses: number; points: number; isMine?: boolean };
export type DashboardData = {
  meta: { demo: boolean; week: number; season: number; updated: string };
  seahawks: { opponent: string; opponentAbbr: string; home: boolean; score: number; opponentScore: number; state: string; kickoff: string; record: string; opponentRecord: string; nextGames: { opponent: string; when: string; location: string }[] };
  fantasy: { league: string; myTeam: string; opponent: string; myScore: number; opponentScore: number; myProjected: number; opponentProjected: number; myRecord: string; rank: number; players: Player[]; standings: Standing[] };
};
export const demoData: DashboardData = {
  meta: { demo: true, week: 6, season: 2026, updated: 'Sample data' },
  seahawks: { opponent: 'San Francisco 49ers', opponentAbbr: 'SF', home: true, score: 24, opponentScore: 17, state: 'DEMO · Q4 08:42', kickoff: 'Sun · 1:25 PM', record: '4–1', opponentRecord: '3–2', nextGames: [{ opponent: '49ers', when: 'Sun · 1:25 PM', location: 'Home' }, { opponent: 'Rams', when: 'Next Sun · 1:05 PM', location: 'Away' }, { opponent: 'Cardinals', when: 'Following Sun · 1:25 PM', location: 'Home' }] },
  fantasy: { league: 'Sunday Legends', myTeam: 'Dad’s Dynasty', opponent: 'Fourth & Long', myScore: 128.64, opponentScore: 114.22, myProjected: 142.8, opponentProjected: 133.1, myRecord: '4–1', rank: 2,
    players: [{ name: 'J. Smith-Njigba', position: 'WR', team: 'SEA', points: 24.8, projected: 18.5, active: true }, { name: 'J. Allen', position: 'QB', team: 'BUF', points: 22.6, projected: 23.1, active: true }, { name: 'B. Robinson', position: 'RB', team: 'ATL', points: 19.4, projected: 17.8, active: true }, { name: 'T. Kelce', position: 'TE', team: 'KC', points: 14.2, projected: 12.6, active: false }],
    standings: [{ rank: 1, name: 'The Gridiron Kings', wins: 5, losses: 0, points: 728.4 }, { rank: 2, name: 'Dad’s Dynasty', wins: 4, losses: 1, points: 701.6, isMine: true }, { rank: 3, name: 'Fourth & Long', wins: 3, losses: 2, points: 682.3 }, { rank: 4, name: 'Sunday Scaries', wins: 3, losses: 2, points: 657.8 }, { rank: 5, name: 'End Zone Empire', wins: 2, losses: 3, points: 641.2 }] }
};
