# Mode Baseline Testing: $ARGUMENTS

Arguments: [suffix] (optional - defaults to current timestamp)

🔍 **BASELINE ESTABLISHMENT COMMAND** 🔍
This command establishes baseline performance across all three testing scenarios.

## Your Task

This command runs comprehensive baseline testing to establish current mode system performance before making improvements.

### 1. Create Baseline Test Directories
```bash
mkdir -p .tasks/.modes-test-baseline-{suffix}/react-ecommerce
mkdir -p .tasks/.modes-test-baseline-{suffix}/python-data  
mkdir -p .tasks/.modes-test-baseline-{suffix}/nodejs-api
```

### 2. Execute All Three Scenarios

#### React E-commerce Scenario
**Context**: Frontend business app (ShopEasy Platform)
- Follow `/docs/03-guides/mode-testing-scenarios/react-ecommerce.md` exactly
- Save modes to `.modes-test-baseline-{suffix}/react-ecommerce/`
- Execute sample task: "Research product recommendation system for cart conversion"
- Collect all evidence and artifacts

#### Python Data Pipeline Scenario  
**Context**: Data processing pipeline (DataFlow Analytics)
- Follow `/docs/03-guides/mode-testing-scenarios/python-data-pipeline.md` exactly
- Save modes to `.modes-test-baseline-{suffix}/python-data/`
- Execute sample task: "Research customer churn prediction with automated retraining"
- Collect all evidence and artifacts

#### Node.js API Service Scenario
**Context**: Backend integration service (FinanceConnect API)
- Follow `/docs/03-guides/mode-testing-scenarios/nodejs-api-service.md` exactly  
- Save modes to `.modes-test-baseline-{suffix}/nodejs-api/`
- Execute sample task: "Research payment webhook processing with guaranteed delivery"
- Collect all evidence and artifacts

### 3. Comprehensive Evaluation

Rate each scenario 1-5 across all criteria:
- Mode Customization Quality
- Cross-Mode Workflow Integration
- Tool Recommendation Appropriateness  
- Philosophy Alignment
- Real-World Applicability

### 4. Baseline Report Generation

Create comprehensive baseline report:

```markdown
# Mode System Baseline Report - [Date]

## Test Configuration
- **Baseline ID**: baseline-{suffix}
- **Scenarios Tested**: All 3 (react-ecommerce, python-data-pipeline, nodejs-api-service)
- **Mode System Version**: [current git commit]
- **Test Directories**: .modes-test-baseline-{suffix}/

## Baseline Results

### React E-commerce (Frontend Business App)
**Mode Customization Quality**: [1-5] - [Detailed assessment]
**Cross-Mode Workflow**: [1-5] - [Workflow evaluation]
**Tool Recommendations**: [1-5] - [Tool usage assessment]
**Philosophy Alignment**: [1-5] - [Balance evaluation]  
**Real-World Applicability**: [1-5] - [Practical value assessment]
**AVERAGE**: [X.X/5.0]

**Evidence Collected**:
- Mode templates before/after customization
- Sample task execution results
- Workflow metadata traces
- Tool usage examples

**Key Strengths**: [What works well]
**Key Weaknesses**: [What needs improvement]

### Python Data Pipeline (Data Processing)
[Same format as above]

### Node.js API Service (Backend Integration)  
[Same format as above]

## Cross-Scenario Analysis

### Overall System Performance
**Average Across All Scenarios**: [X.X/5.0]
**Meets Quality Gate (4.0+)**: Yes/No
**Ready for Production**: Yes/No

### Consistent Patterns
**Universal Strengths**: [What works across all scenarios]
**Universal Weaknesses**: [What fails across all scenarios]
**Philosophy Issues**: [Guide vs prescriptive balance problems]

### Domain-Specific Insights
**Frontend-Specific Issues**: [React e-commerce unique problems]
**Data-Specific Issues**: [Python pipeline unique problems]  
**Backend-Specific Issues**: [Node.js API unique problems]

## Improvement Priorities

Based on baseline results, prioritize improvements:

### Priority 1 (Critical - Rating <3.0)
- [Issues that are critical across scenarios]
- [Specific fixes needed]

### Priority 2 (Important - Rating 3.0-3.9)  
- [Important improvements needed]
- [Targeted enhancements]

### Priority 3 (Enhancement - Rating 4.0+)
- [Nice-to-have improvements]
- [Polish and refinement]

## Baseline Artifacts

### Evidence Archive
- **Screenshots**: Mode customization results for each scenario
- **Sample Outputs**: Generated exploration results
- **Workflow Traces**: Metadata flow documentation
- **Comparison Data**: Side-by-side scenario differences

### Regression Prevention
- **Baseline Commit**: [git commit hash]
- **Test Configuration**: [Exact commands used]
- **Environment**: [System and tool versions]
- **Success Criteria**: [What future tests must maintain/improve]

## Next Steps

1. **Address Priority 1 Issues**: [Critical fixes needed before production]
2. **Plan Round 1 Improvements**: [Focus area for first iteration]
3. **Establish Testing Cadence**: [How often to re-baseline]
4. **Define Success Metrics**: [Improvement targets for next test]
```

## Success Criteria

### Comprehensive Coverage
- ✅ All 3 scenarios executed completely
- ✅ All 5 evaluation criteria rated for each scenario  
- ✅ Evidence collected for each scenario
- ✅ Cross-scenario analysis completed

### Quality Assessment
- ✅ Honest evaluation of current state
- ✅ Clear identification of improvement areas
- ✅ Prioritized action plan
- ✅ Regression prevention measures

### Actionable Output
- ✅ Specific recommendations for improvements
- ✅ Clear success criteria for next iteration
- ✅ Baseline preserved for future comparison
- ✅ Ready to start methodical improvements

## Usage

```bash
# Establish baseline with timestamp
@mode-baseline

# Establish baseline with custom suffix  
@mode-baseline "pre-external-tools-fix"
```

This establishes a comprehensive baseline for measuring all future mode system improvements.