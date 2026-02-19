import { JoinSessionModal } from "@/features/session/components/JoinSessionModal";

interface SessionModalPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function Page({ params }: SessionModalPageProps) {
  const { sessionId } = await params;

  return <JoinSessionModal sessionId={sessionId} />;
}
