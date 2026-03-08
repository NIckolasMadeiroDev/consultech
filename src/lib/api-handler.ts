import { ZodError } from "zod";

export async function apiHandler<T>(
  fn: () => Promise<T>
): Promise<Response> {
  try {
    const data = await fn();
    return Response.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map((e) => e.message).join("; ");
      return Response.json({ error: message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Internal error";
    let status = 500;
    if (
      message === "Form not found" ||
      message === "Form does not accept responses" ||
      message === "Dashboard not found"
    ) {
      status = 404;
    } else if (message === "XAI_API_KEY not configured") {
      status = 503;
    }
    return Response.json({ error: message }, { status });
  }
}
