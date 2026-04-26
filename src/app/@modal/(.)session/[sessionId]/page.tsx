import { SessionDialog } from "@/features/session/components/SessionDialog/SessionDialog";

interface SessionModalPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function Page({ params }: SessionModalPageProps) {
  const { sessionId } = await params;

  return <SessionDialog sessionId={sessionId} />;
}
