import { Button } from "@/components/Button/Button";

const softNavigateWithObjectHref = (
  <Button href={{ pathname: "/session", query: { page: "2" }, hash: "top" }}>세션 보기</Button>
);

const hardNavigateWithStringHref = (
  <Button href="/login?from=header#cta" hardNavigate>
    로그인
  </Button>
);

const hardNavigateWithObjectHref = (
  // @ts-expect-error hardNavigate=true에서는 string href만 허용한다.
  <Button href={{ pathname: "/login", query: { from: "header" } }} hardNavigate>
    로그인
  </Button>
);

const buttonTypeCheck = (
  <Button type="submit" variant="solid" disabled>
    제출
  </Button>
);

void softNavigateWithObjectHref;
void hardNavigateWithStringHref;
void hardNavigateWithObjectHref;
void buttonTypeCheck;
