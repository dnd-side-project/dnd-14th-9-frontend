import { SessionHeader } from "@/features/session/components/SessionHeader";
import { SessionTimerSection } from "@/features/session/components/SessionTimerSection";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  return (
    <div className="p-3xl flex flex-col">
      <SessionHeader />
      <SessionTimerSection sessionId={sessionId} className="mt-xl" />
    </div>
  );
}
