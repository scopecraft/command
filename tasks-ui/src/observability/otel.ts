// otel.ts
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { LoggerProvider, BatchLogRecordProcessor, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

// Simple file exporter for now
import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";

// Console exporter for development
class ConsoleLogExporter {
  export(logs: any[], resultCallback: (result: any) => void): void {
    logs.forEach(log => {
      console.log("[OTel]", {
        timestamp: new Date(log.hrTime[0] * 1000).toISOString(),
        name: log.instrumentationScope.name,
        body: log.body,
        attributes: log.attributes,
      });
    });
    resultCallback({ code: 0 });
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

class SimpleFileLogRecordExporter {
  private logDir: string;
  private logFile: string;

  constructor(options: { directory: string }) {
    this.logDir = options.directory;
    this.logFile = join(this.logDir, `logs-${new Date().toISOString().split('T')[0]}.log`);
    
    // Ensure log directory exists
    mkdirSync(this.logDir, { recursive: true });
  }

  export(logs: any[], resultCallback: (result: any) => void): void {
    logs.forEach(log => {
      const timestamp = new Date(log.hrTime[0] * 1000).toISOString();
      const logLine = JSON.stringify({
        timestamp,
        name: log.instrumentationScope.name,
        body: log.body,
        attributes: log.attributes,
      }) + '\n';
      
      try {
        appendFileSync(this.logFile, logLine);
      } catch (error) {
        console.error('Failed to write log:', error);
      }
    });
    resultCallback({ code: 0 });
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

// 0. Verbose SDK diagnostics in dev
if (process.env.NODE_ENV !== "production") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

// 1. Describe this service
const resource = {
  [SemanticResourceAttributes.SERVICE_NAME]: "scopecraft-ui",
  [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
};

// 2. Pick local exporter(s)
const consoleExporter = new ConsoleLogExporter();
const fileExporter = new SimpleFileLogRecordExporter({
  directory: "./logs",
});

// 3. Build provider
const provider = new LoggerProvider({ resource });
provider.addLogRecordProcessor(new SimpleLogRecordProcessor(consoleExporter));
provider.addLogRecordProcessor(new BatchLogRecordProcessor(fileExporter));

// 4. Get logger directly from provider
export const logger = provider.getLogger("scopecraft-ui");