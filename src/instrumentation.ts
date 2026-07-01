export async function register() {
  const { ensureMockServer } = await import("./mocks/server-control");

  await ensureMockServer();
}
