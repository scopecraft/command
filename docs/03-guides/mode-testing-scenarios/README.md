# Mode Testing Scenarios

This directory contains comprehensive testing scenarios for validating Scopecraft execution modes across diverse project types.

## Overview

Three carefully designed scenarios test the mode system's ability to provide domain-specific value:

1. **[React E-commerce App](./react-ecommerce.md)** - Frontend business application
2. **[Python Data Pipeline](./python-data-pipeline.md)** - Data processing and ML pipeline  
3. **[Node.js API Service](./nodejs-api-service.md)** - Backend integration service

## Why These Three Scenarios

### Domain Diversity
- **Business Application**: User experience, conversion optimization, business metrics
- **Data Processing**: Analytics, ML workflows, data quality, pipeline reliability
- **System Integration**: API contracts, reliability, performance, compliance

### Technical Stack Diversity
- **Frontend**: React, TypeScript, browser testing, performance optimization
- **Data**: Python, pandas, jupyter, ML libraries, data validation
- **Backend**: Node.js, databases, API design, system monitoring

### Concern Diversity
- **User-Focused**: UX research, accessibility, mobile-first, A/B testing
- **Data-Focused**: Data quality, model performance, experiment tracking
- **System-Focused**: Reliability, scalability, integration patterns, compliance

## Testing Philosophy

### Comprehensive Coverage
Each scenario tests different aspects of the mode system:
- **Mode Customization**: How well placeholders adapt to domain needs
- **Cross-Mode Workflow**: Planning → Orchestration → Autonomous integration
- **Tool Recommendations**: External tool usage and project-specific guidance
- **Philosophy Alignment**: Guide vs prescriptive balance
- **Real-World Value**: Practical applicability for actual projects

### Evidence-Based Evaluation
Each scenario includes:
- **Quantitative Metrics**: 1-5 rating scale across 5 evaluation criteria
- **Qualitative Assessment**: Success stories and failure patterns
- **Artifact Collection**: Screenshots, sample outputs, workflow traces
- **Comparative Analysis**: Cross-scenario patterns and differences

### Iterative Improvement
Testing results drive mode refinement:
- **Pattern Recognition**: What works across all scenarios vs specific domains
- **Gap Identification**: Where modes fail to provide value
- **Targeted Improvements**: Focus on lowest-rated areas
- **Regression Prevention**: Ensure improvements don't break other scenarios

## Usage Instructions

### For Mode Developers

#### Establish Baseline First
```bash
# Before making any changes
@mode-baseline "current-state"
```

#### Test Specific Improvements
```bash
# Test all scenarios after changes
@mode-test "all" "TestProjects" "round1-improvements"

# Test single scenario during development
@mode-test "react-ecommerce" "ShopEasy" "debugging-issue"
```

#### Compare Results
1. **Compare against baseline** from previous test runs
2. **Identify patterns** across scenarios
3. **Document findings** using generated reports
4. **Iterate based on data** - target lowest-rated areas

### For Quality Assurance

#### Validation Workflow
```bash
# 1. Establish baseline
@mode-baseline "pre-release"

# 2. Validate all scenarios
@mode-test "all" "QA-Testing" "release-candidate"
```

#### Quality Gates
1. **Minimum 4.0 average rating** across all scenarios
2. **No regressions** vs baseline performance  
3. **Evidence collection** - all artifacts preserved
4. **Cross-scenario consistency** - patterns work universally

### For Future AI Execution

#### Command Usage
The testing commands are designed for autonomous execution:

```bash
# Comprehensive baseline testing
@mode-baseline "YYYY-MM-DD-baseline"

# Targeted scenario testing
@mode-test "react-ecommerce" "TestProject" "experiment-name"

# Full comparative testing
@mode-test "all" "TestProjects" "version-comparison"
```

#### Execution Requirements
1. **Follow scenario instructions exactly** - they contain full context
2. **Use provided evaluation criteria** - 5-point scales with specific definitions
3. **Collect all required evidence** - screenshots, outputs, workflow traces
4. **Generate standardized reports** - use templates in testing commands

#### Auto-Loading Context
Commands automatically load scenario context from:
- `/docs/03-guides/mode-testing-scenarios/react-ecommerce.md`
- `/docs/03-guides/mode-testing-scenarios/python-data-pipeline.md`  
- `/docs/03-guides/mode-testing-scenarios/nodejs-api-service.md`

No manual scenario reading required - commands handle context loading.

## Expected Outcomes

### High-Quality Modes (Rating 4-5)
- **Domain-Specific Value**: Modes provide specialized guidance for each project type
- **Workflow Integration**: Seamless handoffs between planning, orchestration, and execution
- **Current Best Practices**: Up-to-date tool recommendations and methodology
- **Practical Applicability**: Real teams would find the modes immediately useful

### Quality Issues (Rating 1-3)
- **Generic Guidance**: Modes indistinguishable from default templates
- **Broken Workflows**: Metadata handoffs fail between modes
- **Outdated Practices**: Reliance on stale training data vs current tools
- **Academic Results**: Theoretical output without practical application

## Continuous Improvement Process

### Baseline Establishment
- **Initial Testing**: Run all scenarios with current modes
- **Performance Benchmark**: Establish baseline ratings across all criteria
- **Issue Documentation**: Record specific failure patterns and limitations

### Change Validation
- **Pre-Change Testing**: Test current state before modifications
- **Post-Change Testing**: Validate improvements after changes
- **Regression Detection**: Ensure changes don't break other scenarios
- **Progress Tracking**: Measure improvement trends over time

### Knowledge Evolution
- **Anti-Pattern Library**: Document what doesn't work across scenarios
- **Best Practice Collection**: Record successful patterns and approaches
- **Scenario Expansion**: Add new scenarios as project types evolve
- **Tool Evolution**: Update scenarios as technology stacks change

This testing framework ensures Scopecraft modes provide genuine value across the diverse landscape of software development projects.