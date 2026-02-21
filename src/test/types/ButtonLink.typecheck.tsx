import { ButtonLink } from "@/components/Button/ButtonLink";

const softNavigateWithObjectHref = (
  <ButtonLink href={{ pathname: "/session", query: { page: "2" }, hash: "top" }}>
    세션 보기
  </ButtonLink>
);

const hardNavigateWithStringHref = (
  <ButtonLink href="/login?from=header#cta" hardNavigate>
    로그인
  </ButtonLink>
);

const hardNavigateWithObjectHref = (
  // @ts-expect-error hardNavigate=true에서는 string href만 허용한다.
  <ButtonLink href={{ pathname: "/login", query: { from: "header" } }} hardNavigate>
    로그인
  </ButtonLink>
);

void softNavigateWithObjectHref;
void hardNavigateWithStringHref;
void hardNavigateWithObjectHref;
