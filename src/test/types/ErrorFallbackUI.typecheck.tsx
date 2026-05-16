import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";

const handleRetry = () => {};

const retryFallback = (
  <ErrorFallbackUI
    title="Error"
    description="다시 시도해주세요."
    buttonLabel="다시 시도"
    onRetry={handleRetry}
  />
);

const linkFallback = (
  <ErrorFallbackUI
    title="Page not found"
    description="다른 페이지로 이동하세요."
    buttonLabel="이동"
    href="/"
  />
);

const fallbackWithBothActions = (
  // @ts-expect-error ErrorFallbackUI는 href와 onRetry를 동시에 받을 수 없다.
  <ErrorFallbackUI
    title="Error"
    description="잘못된 액션 조합"
    buttonLabel="이동"
    href="/"
    onRetry={handleRetry}
  />
);

const fallbackWithoutAction = (
  // @ts-expect-error ErrorFallbackUI는 href 또는 onRetry 중 하나를 반드시 받아야 한다.
  <ErrorFallbackUI title="Error" description="액션 없음" buttonLabel="확인" />
);

void retryFallback;
void linkFallback;
void fallbackWithBothActions;
void fallbackWithoutAction;
