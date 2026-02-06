import { cookies } from "next/headers";

/**
 * 서버 사이드에서 쿠키를 읽어 인증 상태 확인
 * - RSC, Server Actions, Route Handlers에서 사용 가능
 * - accessToken 쿠키 존재 여부로 인증 여부 판단
 */
export async function getServerAuthState(): Promise<boolean> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  return !!accessToken;
}
