export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init);
}

export function fail(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}