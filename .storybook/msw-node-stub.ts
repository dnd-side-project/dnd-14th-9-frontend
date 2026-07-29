// Storybook(Vite 브라우저 빌드) 전용 stub.
// api.ts → server-control → server 로 이어지는 동적 import 체인 때문에 서버 전용
// msw/node 가 번들 그래프에 포함되지만, 런타임 가드(isServer / typeof window)로 인해
// 브라우저에서는 실행되지 않는다. 해석만 되면 되므로 no-op 으로 대체한다.
export const setupServer = () => {};
