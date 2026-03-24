export class FormPausedError extends Error {
  readonly pausedMessage: string | null;

  constructor(pausedMessage: string | null) {
    super("Form is paused");
    this.name = "FormPausedError";
    this.pausedMessage = pausedMessage;
  }
}
