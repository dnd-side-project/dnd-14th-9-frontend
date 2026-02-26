export const SITE_NAME = "GAK";
export const SITE_TITLE = `${SITE_NAME} - 모여서 각자 작업`;
export const SITE_DESCRIPTION =
  "혼자 하면 흐트러지기 쉬운 작업 시간, 링크 하나로 모여서 함께 집중하세요. 시간 제한, 목표 설정, 상호 검증으로 밀도 있는 작업 세션을 제공합니다.";
export const SITE_SHORT_DESCRIPTION = "링크 하나로 모여서 함께 집중하는 모각작 플랫폼";
export const SITE_URL = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || "https://gak.today";

export const OG_IMAGES = [
  { url: "/og-image.png", width: 1200, height: 630 },
  { url: "/og-image-square.png", width: 600, height: 600 },
] as const;
