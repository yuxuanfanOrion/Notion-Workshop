import * as vscode from "vscode";

export interface LogEntry {
  time: string;
  message: string;
  level: "info" | "error";
}

export class Logger {
  private readonly entries: LogEntry[] = [];
  private readonly emitter = new vscode.EventEmitter<LogEntry[]>();

  readonly onDidChange = this.emitter.event;

  add(message: string, level: "info" | "error" = "info"): void {
    const entry: LogEntry = {
      time: new Date().toLocaleTimeString(),
      message,
      level
    };
    this.entries.unshift(entry);
    if (this.entries.length > 200) {
      this.entries.pop();
    }
    this.emitter.fire([...this.entries]);
  }

  list(): LogEntry[] {
    return [...this.entries];
  }
}
