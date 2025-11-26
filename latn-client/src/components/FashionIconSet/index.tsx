
import React from "react";
import mapping from "./mapping.json";

type Props = {
  name: string;
  size?: number;
  color?: string; // apply as CSS filter for monochrome if needed
  className?: string;
};

export default function FashionIconSet({ name, size = 36, className }: Props) {
  const lower = (name || "").toLowerCase();
  const key = Object.keys(mapping).find(k => lower.includes(k));
  const file = key ? (mapping as Record<string, string>)[key] : "tshirt.svg";

  return (
    <img
      src={new URL(`./assets/icons/fashion/${file}`, import.meta.url).toString()}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
