import { getPrograms } from "@/lib/api.server";
import { ProgramsList } from "@/components/ProgramsList";

export default async function ProgramsPage() {
  const { programs } = await getPrograms();

  return <ProgramsList initialPrograms={programs} />;
}
