import { RaceRoom } from "@/components/race-room";
export default async function RacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RaceRoom key={id} id={id} />;
}
