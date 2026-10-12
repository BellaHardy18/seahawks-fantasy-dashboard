type TeamLogoProps = {
  team: string;
  size?: number;
};

export default function TeamLogo({ team, size = 64 }: TeamLogoProps) {
  const teamCode = team.toLowerCase();

  return (
    <img
      src={`https://sleepercdn.com/images/team_logos/nfl/${teamCode}.png`}
      alt={`${team} logo`}
      width={size}
      height={size}
      style={{
        objectFit: "contain",
      }}
    />
  );
}
