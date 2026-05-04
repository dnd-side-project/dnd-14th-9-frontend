import { Button } from "@/components/Button/Button";

const softNavigateWithObjectHref = (
  <Button href={{ pathname: "/session", query: { page: "2" }, hash: "top" }}>세션 보기</Button>
);

const hardNavigateWithStringHref = (
  <Button href="/login?from=header#cta" hardNavigate>
    로그인
  </Button>
);

const softNavigateWithExplicitFalse = (
  <Button href={{ pathname: "/session", query: { page: "3" } }} hardNavigate={false}>
    세션 보기
  </Button>
);

const hardNavigateWithObjectHref = (
  // @ts-expect-error hardNavigate=true에서는 string href만 허용한다.
  <Button href={{ pathname: "/login", query: { from: "header" } }} hardNavigate>
    로그인
  </Button>
);

const hardNavigateWithoutHref = (
  // @ts-expect-error hardNavigate는 href와 함께 사용해야 한다.
  <Button hardNavigate>로그인</Button>
);

const buttonTypeCheck = (
  <Button type="submit" variant="solid" disabled>
    제출
  </Button>
);

const nativeButtonWithLinkProp = (
  // @ts-expect-error href가 없는 native button은 Link 전용 prop을 받을 수 없다.
  <Button prefetch={false}>제출</Button>
);

const linkButtonWithDisabled = (
  // @ts-expect-error Link variant는 native button 전용 disabled를 받을 수 없다.
  <Button href="/" disabled>
    이동
  </Button>
);

const linkButtonWithButtonType = (
  // @ts-expect-error Link variant에서 type은 native button 전용으로 예약한다.
  <Button href="/" type="button">
    이동
  </Button>
);

void softNavigateWithObjectHref;
void hardNavigateWithStringHref;
void softNavigateWithExplicitFalse;
void hardNavigateWithObjectHref;
void hardNavigateWithoutHref;
void buttonTypeCheck;
void nativeButtonWithLinkProp;
void linkButtonWithDisabled;
void linkButtonWithButtonType;
