import roundTo from "./roundTo.js";

export function formatNumber(num, decimals = 2) {
  if (!Number.isFinite(num)) return "∞";

  if (Math.abs(num) < 1000) {
    return roundTo(num, decimals);
  }

  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  const tier = Math.floor(Math.log10(Math.abs(num)) / 3);

  if (tier >= suffixes.length) {
    return num.toExponential(decimals);
  }

  const scale = 10 ** (tier * 3);
  const scaled = num / scale;

  return (
    `${roundTo(scaled, decimals)}${suffixes[tier]}`
  );
}

export function toSeconds(num, decimals = 2){
    return `${roundTo(num / 1000, decimals)}s`;
}