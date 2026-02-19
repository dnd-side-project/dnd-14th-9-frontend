import { SessionDetailModal } from "@/features/session/components/SessionDetailModal/SessionDetailModal";

interface SessionModalPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function Page({ params }: SessionModalPageProps) {
  const { sessionId } = await params;

  return <SessionDetailModal sessionId={sessionId} />;
}
