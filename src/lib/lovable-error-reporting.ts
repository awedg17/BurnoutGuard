export function reportLovableError(error: Error, context?: Record<string, unknown>) {
  console.error("[BurnoutGuard Error]", error, context);
}
