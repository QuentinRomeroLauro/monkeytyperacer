export type RaceShare = {
  wpm: number;
  accuracy: number;
  place: number;
  racers: number;
};
export function resultText(result: RaceShare) {
  return `I typed ${Math.round(result.wpm)} WPM with ${Math.round(result.accuracy)}% accuracy on Monkeytype Racer. Race me: https://monkeytyperacer.com/typing-race-with-friends`;
}
export async function raceCard(result: RaceShare): Promise<Blob> {
  await document.fonts.load('24px "Roboto Mono"');
  await document.fonts.load('24px "Space Grotesk"');
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export is unavailable in this browser.");
  ctx.fillStyle = "#323437";
  ctx.fillRect(0, 0, 1200, 630);
  const logo = new Image();
  logo.src = "/brand/mtr-roadster.svg";
  await logo.decode();
  ctx.drawImage(logo, 60, 48, 60, 60);
  ctx.fillStyle = "#d7e0e7";
  ctx.font = '32px "Space Grotesk", sans-serif';
  ctx.fillText("monkeytype racer", 136, 88);
  ctx.fillStyle = "#a1aab3";
  ctx.font = '18px "Roboto Mono", monospace';
  ctx.fillText(
    `QUOTE RACE / FINISHED ${result.place} OF ${result.racers}`,
    68,
    167,
  );
  ctx.fillStyle = "#4da8e8";
  ctx.font = '148px "Space Grotesk", sans-serif';
  ctx.fillText(String(Math.round(result.wpm)), 60, 334);
  ctx.font = '24px "Roboto Mono", monospace';
  ctx.fillText("words per minute", 68, 384);
  ctx.fillStyle = "#d7e0e7";
  ctx.font = '76px "Space Grotesk", sans-serif';
  ctx.fillText(`${Math.round(result.accuracy)}%`, 750, 318);
  ctx.fillStyle = "#a1aab3";
  ctx.font = '24px "Roboto Mono", monospace';
  ctx.fillText("accuracy", 752, 384);
  ctx.strokeStyle = "#50565c";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(68, 448);
  ctx.lineTo(1132, 448);
  ctx.stroke();
  ctx.fillStyle = "#d7e0e7";
  ctx.font = '30px "Space Grotesk", sans-serif';
  ctx.fillText("Your turn. Race me?", 68, 513);
  ctx.fillStyle = "#4da8e8";
  ctx.font = '20px "Roboto Mono", monospace';
  ctx.fillText("monkeytyperacer.com", 68, 558);
  ctx.fillStyle = "#a1aab3";
  ctx.font = '16px "Roboto Mono", monospace';
  ctx.fillText("same quote / shared start", 800, 554);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not create the image. Please try again.")),
      "image/png",
    ),
  );
}
