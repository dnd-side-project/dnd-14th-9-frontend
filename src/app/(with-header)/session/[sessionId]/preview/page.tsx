import { redirect } from "next/navigation";

interface SessionPreviewPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPreviewPage({ params }: SessionPreviewPageProps) {
  const { sessionId } = await params;

  redirect(`/session/${sessionId}`);
}
