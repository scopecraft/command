# Node.js API Service Testing Scenario

## Project Context

**Type**: Backend API microservice  
**Domain**: Financial services integration platform  
**Tech Stack**: Node.js, Express, TypeScript, PostgreSQL, Redis, Docker, AWS  
**Team Size**: 4-6 backend engineers  
**Business Focus**: System reliability, integration contracts, regulatory compliance  

## Project Characteristics

### Business Priorities
- Service reliability and uptime (99.9% SLA)
- API contract stability for external integrations
- Regulatory compliance (PCI DSS, SOX)
- Performance under load (10k+ RPS)
- Security and audit trails

### Technical Concerns
- API design and versioning
- Database performance and scaling
- Error handling and circuit breakers
- Monitoring and observability
- Service mesh integration
- Rate limiting and throttling

### Team Workflow
- API-first development (OpenAPI specs)
- Integration testing with contract testing
- Blue-green deployments
- Comprehensive logging and monitoring
- Infrastructure as code

## Testing Instructions

### Step 1: Project Setup Simulation
Create project structure that simulates a real API service:

```
/src
  /controllers
  /services
  /middleware
  /models
  /routes
  /utils
/tests
  /integration
  /unit
  /contract
/infrastructure
  /terraform
  /docker
/docs
  /openapi
package.json (express, typescript, postgres, redis, etc.)
tsconfig.json
```

### Step 2: Mode Initialization
Execute mode-init command:
```
@mode-init "FinanceConnect API Platform"
```

### Step 3: Mode Customization
Follow placeholder guidance to customize modes for API service context. Look for:

**Expected External Tools**:
- WebSearch for current API design patterns, microservice best practices
- Context7 for Express/Node.js documentation (if available)
- External service integration documentation

**Expected Project Rules**:
- API contract testing requirements
- Performance benchmarking standards
- Security and compliance checks
- Error handling and logging standards

**Expected Process Requirements**:
- API versioning strategy
- Service monitoring and alerting
- Integration testing protocols

### Step 4: Sample Task Execution
Create and execute this sample task using the customized exploration mode:

**Task**: "Research and design payment webhook processing system with guaranteed delivery and deduplication"

**Expected Flow**:
1. **Planning**: Break down into webhook design, reliability patterns, monitoring
2. **Orchestration**: Route to exploration → design → implementation phases
3. **Autonomous**: Execute exploration with proper system design methodology

### Step 5: Evaluation

#### Mode Customization Quality (Target: 4-5)
**Look For**:
- API design and contract stability emphasis
- System reliability patterns (retries, circuit breakers, timeouts)
- Performance and scalability considerations
- Security and compliance requirements
- Error handling and observability patterns

**Red Flags**:
- Generic "research the problem" without system context
- No mention of reliability or performance requirements
- Missing security or compliance considerations
- Overly simplistic without distributed system concerns

#### Cross-Mode Workflow (Target: 4-5)
**Look For**:
- Planning creates tasks with system design methodology
- Orchestration understands API vs infrastructure concerns
- Autonomous execution includes proper architectural analysis
- Metadata includes performance and reliability considerations

**Red Flags**:
- Missing API contract and versioning considerations
- No distinction between development and production concerns
- Broken handoffs between design and implementation phases

#### Tool Recommendations (Target: 4-5)
**Look For**:
- Clear WebSearch requirements for current microservice patterns
- External documentation for integration patterns (webhooks, APIs)
- Monitoring and observability tools
- Performance testing and load testing tools

**Red Flags**:
- Relying on outdated API patterns from training
- Missing external validation for integration approaches
- No monitoring or performance tool recommendations

#### Philosophy Alignment (Target: 4-5)
**Look For**:
- Principled system design approach
- Practical reliability patterns without over-engineering
- Iterative API development approach
- Balance of performance and maintainability

**Red Flags**:
- Overly rigid system design workflows
- Too much theoretical architecture without practical constraints
- Missing operational and monitoring considerations
- Token inefficiency (verbose architecture explanations)

#### Real-World Applicability (Target: 4-5)
**Look For**:
- Actionable system insights (webhook reliability patterns, deduplication strategies)
- Practical API architecture (rate limiting, error handling, monitoring)
- Realistic constraints (performance, security, compliance)
- Consideration of operational workflows (deployment, monitoring, debugging)

**Red Flags**:
- Academic system design without operational reality
- Impractical integration recommendations
- Missing security and compliance considerations
- No consideration of production constraints

## Success Criteria

### Excellent Customization (Rating 5)
- Mode produces API-specific webhook processing methodology
- Includes reliability patterns and monitoring considerations
- Balances system performance with operational simplicity
- Provides actionable insights for guaranteed delivery systems

### Good Customization (Rating 4)
- Mode addresses API service domain concerns
- Includes some system design and reliability guidance
- Mentions monitoring or performance considerations
- Better than generic research template

### Poor Customization (Rating 1-2)
- Generic research guidance unchanged
- No API or system design context
- Missing reliability/performance considerations
- Indistinguishable from default template

## Documentation Requirements

### Evidence to Collect
1. **Before/After**: Screenshots of mode templates before and after customization
2. **Sample Output**: Generated exploration results for the webhook system task
3. **Workflow Trace**: Metadata flow through planning → orchestration → autonomous
4. **Tool Usage**: Evidence of external tool requirements being followed
5. **Technical Depth**: Assessment of system design methodology quality

### Key Questions to Answer
1. Would a senior backend engineer find the exploration results architecturally sound?
2. Do the technical recommendations align with current microservice practices?
3. Are reliability and performance requirements properly addressed?
4. Does the mode guide toward current best practices vs outdated patterns?
5. Would a new API team benefit from these customized modes?

## API-Specific Evaluation Points

### System Reliability Focus
- Are error handling and retry patterns emphasized?
- Is monitoring and alerting coverage addressed?
- Are performance and scalability considerations included?

### API Design Quality
- Is API contract design and versioning covered?
- Are integration testing and contract testing addressed?
- Is backwards compatibility and migration strategy included?

### Operational Excellence
- Are deployment and rollback strategies covered?
- Is observability (logging, metrics, tracing) addressed?
- Are security and compliance requirements included?

### Integration Patterns
- Are webhook and event-driven patterns covered?
- Is service-to-service communication addressed?
- Are data consistency and transaction patterns included?

This scenario tests the mode system's ability to provide domain-specific backend engineering value while maintaining system design rigor and current best practices.