import { useState } from "react";

type PlayerHeadshotProps = {
  playerId: string;
  name: string;
  size?: number;
};

export default function PlayerHeadshot({
  playerId,
  name,
  size = 64,
}: PlayerHeadshotProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = `https://sleepercdn.com/content/nfl/players/thumb/${encodeURIComponent(playerId)}.jpg`;

  if (imageFailed) {
    return (
      <div
        aria-label={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#243746",
          display: "grid",
          placeItems: "center",
          fontSize: size * 0.4,
        }}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      width={size}
      height={size}
      onError={() => setImageFailed(true)}
      style={{
        borderRadius: "50%",
        objectFit: "cover",
        background: "#243746",
      }}
    />
  );
}
