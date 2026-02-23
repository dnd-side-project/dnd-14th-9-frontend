import { SessionPageContent } from "@/features/session/components/SessionPageContent";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  return <SessionPageContent sessionId={sessionId} />;
}
