# OpenTelemetry Integration for Scopecraft Event Sourcing

## Overview

This document explores using OpenTelemetry (OTel) for collecting telemetry data (logs, metrics, traces) in Scopecraft's event sourcing architecture.

## Why Consider OpenTelemetry?

### Advantages

1. **Industry Standard**: OTel is becoming the de facto standard for observability
2. **Vendor Neutral**: Can export to any backend (Jaeger, Prometheus, Grafana, etc.)
3. **Rich Ecosystem**: Many tools already support OTel format
4. **Structured Data**: Built-in semantic conventions for common operations
5. **Low Overhead**: Designed for production use with minimal performance impact
6. **Correlation**: Built-in trace/span relationships for distributed tracing

### Potential Challenges for Scopecraft

1. **Complexity**: OTel might be overkill for Scopecraft's file-based approach
2. **Dependencies**: Adds external dependencies to the project
3. **Learning Curve**: Developers need to understand OTel concepts
4. **Storage**: OTel doesn't provide storage, just collection and export

## Hybrid Approach: OTel + Event Sourcing

### Architecture

```typescript
// Use OTel for telemetry collection
import { trace, metrics, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Custom exporter that converts OTel data to domain events
class EventSourcingExporter implements SpanExporter {
  constructor(private eventStore: EventStore) {}
  
  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    spans.forEach(span => {
      // Convert OTel span to domain event
      const event: DomainEvent = {
        id: span.spanContext().spanId,
        streamId: `session-${span.attributes.sessionId || 'unknown'}`,
        type: this.mapSpanToEventType(span),
        version: 1,
        timestamp: new Date(span.startTime[0] * 1000),
        data: {
          name: span.name,
          attributes: span.attributes,
          duration: span.duration,
          status: span.status,
          events: span.events
        },
        metadata: {
          traceId: span.spanContext().traceId,
          parentSpanId: span.parentSpanId
        }
      };
      
      this.eventStore.append(event);
    });
    
    resultCallback({ code: ExportResultCode.SUCCESS });
  }
  
  private mapSpanToEventType(span: ReadableSpan): string {
    // Map OTel operations to domain events
    const operationMap: Record<string, string> = {
      'task.create': 'TaskCreated',
      'task.status.update': 'TaskStatusChanged',
      'session.start': 'SessionStarted',
      'session.tool.use': 'SessionToolUsed',
      'worktree.create': 'WorktreeCreated'
    };
    
    return operationMap[span.name] || 'GenericOperation';
  }
}
```

### Instrumentation Example

```typescript
// Instrument existing services with OTel
class InstrumentedTaskService {
  private tracer = trace.getTracer('scopecraft.tasks', '1.0.0');
  private meter = metrics.getMeter('scopecraft.tasks', '1.0.0');
  private taskCounter = this.meter.createCounter('tasks.created');
  
  constructor(private taskService: TaskService) {}
  
  async create(options: TaskCreateOptions): Promise<Task> {
    return this.tracer.startActiveSpan('task.create', async (span) => {
      try {
        // Add semantic attributes
        span.setAttributes({
          'task.type': options.type,
          'task.priority': options.priority,
          'task.workflow_state': options.workflowState,
          'user.id': options.userId
        });
        
        const task = await this.taskService.create(options);
        
        // Record metrics
        this.taskCounter.add(1, {
          type: options.type,
          workflow: options.workflowState
        });
        
        // Add result to span
        span.setAttributes({
          'task.id': task.metadata.id,
          'task.parent_id': task.metadata.parentTask
        });
        
        span.setStatus({ code: SpanStatusCode.OK });
        return task;
        
      } catch (error) {
        span.recordException(error);
        span.setStatus({ 
          code: SpanStatusCode.ERROR,
          message: error.message 
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

## OTel Components for Scopecraft

### 1. Traces
- Track complete request flows through the system
- Parent-child relationships between operations
- Distributed tracing across async operations

```typescript
// Example: Tracing a complex operation
async function executeWorkflow(taskId: string) {
  const tracer = trace.getTracer('scopecraft.workflow');
  
  return tracer.startActiveSpan('workflow.execute', async (parentSpan) => {
    parentSpan.setAttribute('task.id', taskId);
    
    // Create worktree span
    await tracer.startActiveSpan('worktree.setup', async (span) => {
      span.setAttribute('worktree.branch', branch);
      await createWorktree(branch);
    });
    
    // Start session span
    await tracer.startActiveSpan('session.run', async (span) => {
      span.setAttribute('session.mode', 'interactive');
      await runSession(taskId);
    });
  });
}
```

### 2. Metrics
- Performance counters and gauges
- Resource utilization tracking
- Business metrics

```typescript
const meter = metrics.getMeter('scopecraft.metrics');

// Counters
const taskCounter = meter.createCounter('tasks.total');
const sessionCounter = meter.createCounter('sessions.total');
const toolUseCounter = meter.createCounter('tools.usage');

// Histograms
const sessionDuration = meter.createHistogram('session.duration');
const taskCompletionTime = meter.createHistogram('task.completion_time');

// Gauges
const activeSessionsGauge = meter.createObservableGauge('sessions.active');
activeSessionsGauge.addCallback((observableResult) => {
  observableResult.observe(getActiveSessionCount());
});
```

### 3. Logs
- Structured logging with trace context
- Automatic correlation with traces

```typescript
// Use OTel-aware logger
import { logs } from '@opentelemetry/api-logs';

const logger = logs.getLogger('scopecraft');

logger.emit({
  severityText: 'INFO',
  body: 'Task status changed',
  attributes: {
    'task.id': taskId,
    'task.old_status': oldStatus,
    'task.new_status': newStatus
  }
});
```

## Storage Strategy

### Option 1: Pure OTel Approach
```
OTel SDK → OTLP Exporter → OTel Collector → Multiple Backends
                                           ├── Prometheus (metrics)
                                           ├── Jaeger (traces)
                                           └── Loki (logs)
```

### Option 2: Hybrid Event Sourcing
```
OTel SDK → Custom Exporter → Event Store (JSONL files)
                           → OTel Collector (optional)
```

### Option 3: Dual Export
```
OTel SDK ├── Event Store Exporter → JSONL files
         └── OTLP Exporter → External backends
```

## Implementation for Scopecraft

### Phase 1: Basic OTel Setup
```typescript
// otel-setup.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

// Custom exporter that writes to event store
const eventStoreExporter = new EventSourcingExporter(eventStore);

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'scopecraft',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: eventStoreExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: new EventSourcingMetricExporter(eventStore),
    exportIntervalMillis: 10000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: true,
      },
    }),
  ],
});

sdk.start();
```

### Phase 2: Domain-Specific Instrumentation
```typescript
// Scopecraft-specific semantic conventions
export const ScopecraftAttributes = {
  TASK_ID: 'scopecraft.task.id',
  TASK_TYPE: 'scopecraft.task.type',
  WORKFLOW_STATE: 'scopecraft.workflow.state',
  SESSION_ID: 'scopecraft.session.id',
  SESSION_MODE: 'scopecraft.session.mode',
  WORKTREE_PATH: 'scopecraft.worktree.path',
  TOOL_NAME: 'scopecraft.tool.name',
};

// Instrument core operations
class OTelInstrumentation {
  static instrumentTaskOperation<T>(
    operationName: string,
    taskId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return tracer.startActiveSpan(operationName, async (span) => {
      span.setAttributes({
        [ScopecraftAttributes.TASK_ID]: taskId,
        [SemanticAttributes.CODE_FUNCTION]: operationName
      });
      
      try {
        const result = await operation();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

## Benefits for Scopecraft

1. **Professional Observability**: Industry-standard telemetry
2. **Distributed Tracing**: Track operations across worktrees and sessions
3. **Performance Insights**: Built-in performance metrics
4. **Debugging**: Rich context for troubleshooting
5. **Future-Proof**: Can export to any monitoring backend
6. **AI Integration**: Structured data perfect for ML analysis

## Concerns and Mitigations

### Complexity
**Concern**: OTel adds complexity to a simple system
**Mitigation**: Start with basic instrumentation, expand gradually

### Dependencies
**Concern**: External dependencies go against Unix philosophy
**Mitigation**: Make OTel optional, core functionality works without it

### Performance
**Concern**: Telemetry overhead
**Mitigation**: Use sampling, async exports, configurable levels

### Storage
**Concern**: OTel doesn't handle storage
**Mitigation**: Custom exporters to JSONL maintain file-based approach

## Recommendation

For Scopecraft, I recommend a **Hybrid Approach**:

1. **Use OTel SDK** for instrumentation (standardized API)
2. **Custom Exporters** that write to event store (JSONL files)
3. **Optional OTLP Export** for users who want external backends
4. **Gradual Adoption** - start with key operations

This gives you:
- Professional telemetry collection
- File-based storage (maintaining Unix philosophy)
- Option to integrate with any monitoring stack
- Rich data for event sourcing

## Example Configuration

```yaml
# .scopecraft/config.yaml
telemetry:
  enabled: true
  level: info  # trace, debug, info, warn, error
  
  exporters:
    # Primary: Event store (always enabled when telemetry is on)
    event_store:
      type: jsonl
      path: ~/.scopecraft/events
      
    # Optional: External backends
    otlp:
      enabled: false
      endpoint: http://localhost:4318
      
    # Optional: Console (for debugging)
    console:
      enabled: false
      pretty: true
  
  sampling:
    # Sample 100% for development, less for production
    probability: 1.0
    
  metrics:
    # Metrics collection interval
    interval: 30s
```

## Conclusion

OpenTelemetry provides a robust foundation for telemetry in Scopecraft while maintaining flexibility. The hybrid approach allows you to leverage OTel's strengths without abandoning the file-based philosophy that makes Scopecraft unique.