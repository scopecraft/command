# Mode Testing Guide

This guide provides methodology and scenarios for validating Scopecraft execution modes. Use this when testing mode changes or creating new modes.

## Testing Methodology

### Three-Scenario Validation

Every mode system change must be tested against three diverse project scenarios:

1. **Frontend Business App** (`react-ecommerce.md`)
2. **Data Processing Pipeline** (`python-data-pipeline.md`) 
3. **Backend API Service** (`nodejs-api-service.md`)

### Testing Process

1. **Execute Scenario**: Follow scenario instructions exactly
2. **Evaluate Results**: Use evaluation criteria checklist
3. **Document Findings**: Record what worked/failed
4. **Compare Across Scenarios**: Identify patterns and gaps
5. **Iterate**: Make targeted improvements based on findings

## Evaluation Criteria

### 1. Mode Customization Quality
- **Placeholder Effectiveness**: How well do placeholders guide customization?
- **Domain Relevance**: Does customized mode provide domain-specific value?
- **Completeness**: Are all necessary project concerns addressed?
- **Clarity**: Would a human find the customized mode useful?

**Rating Scale**: 1-5 (1=Generic, 5=Highly Specialized)

### 2. Cross-Mode Workflow Integration
- **Metadata Handoffs**: Does planning create proper metadata for orchestration?
- **Execution Flow**: Does orchestration → autonomous work smoothly?
- **Status Tracking**: Can you follow progress through the workflow?
- **Error Handling**: What happens when metadata is missing/incorrect?

**Rating Scale**: 1-5 (1=Broken, 5=Seamless)

### 3. Tool Recommendation Appropriateness
- **External Tools**: Are WebSearch/Context7 requirements clear and justified?
- **Project Tools**: Do tool recommendations match project type?
- **Fallback Guidance**: What happens if recommended tools aren't available?
- **Adoption Path**: Does it guide new projects toward good practices?

**Rating Scale**: 1-5 (1=Irrelevant, 5=Essential)

### 4. Philosophy Alignment
- **Guide vs Prescriptive Balance**: Right level of flexibility vs enforcement?
- **Token Efficiency**: Concise but complete guidance?
- **Progressive Enhancement**: Can projects start simple and add complexity?
- **Universal vs Specific**: Good balance of general principles and project specifics?

**Rating Scale**: 1-5 (1=Poor Balance, 5=Perfect Balance)

### 5. Real-World Applicability
- **Actionable Output**: Would the mode produce useful task results?
- **Business Value**: Does it address real project concerns?
- **Technical Depth**: Appropriate level of technical guidance?
- **Practical Constraints**: Does it consider real-world limitations?

**Rating Scale**: 1-5 (1=Academic, 5=Immediately Useful)

## Reporting Template

```markdown
# Mode Testing Report - [Date]

## Scenarios Tested
- [ ] React E-commerce App
- [ ] Python Data Pipeline  
- [ ] Node.js API Service

## Results Summary

### Scenario 1: React E-commerce App
**Mode Customization Quality**: [1-5] - [Brief reason]
**Cross-Mode Workflow**: [1-5] - [Brief reason]
**Tool Recommendations**: [1-5] - [Brief reason]  
**Philosophy Alignment**: [1-5] - [Brief reason]
**Real-World Applicability**: [1-5] - [Brief reason]

**Key Findings**: [What worked well, what didn't]

### Scenario 2: Python Data Pipeline
[Same format]

### Scenario 3: Node.js API Service  
[Same format]

## Cross-Scenario Analysis

### Strengths (Consistent across scenarios)
- [What worked well in all scenarios]

### Weaknesses (Common issues)
- [What failed or was poor in multiple scenarios]

### Scenario-Specific Issues
- [Issues unique to certain project types]

## Recommendations
1. [Specific changes needed]
2. [Priority of improvements]
3. [Follow-up testing required]

## Overall Assessment
**Ready for Production**: Yes/No
**Confidence Level**: [1-5]
**Next Steps**: [What to do next]
```

## Quality Gates

### Before Promoting Modes to Production

**Minimum Requirements**:
- All three scenarios tested
- Average rating ≥4.0 across all criteria
- No critical workflow breaks (Cross-Mode rating ≥3)
- Clear documentation of any limitations

**Red Flags** (require fixing before promotion):
- Any scenario rating ≤2 in multiple criteria
- Broken metadata handoffs between modes
- Confusing or contradictory guidance
- Token inefficiency (overly verbose modes)

## Testing Commands

### Available Testing Commands

#### `@mode-baseline [suffix]`
Establishes baseline performance across all three scenarios:
```bash
@mode-baseline "current-state"
```
- Runs all 3 scenarios automatically
- Creates separate test directories for each scenario
- Generates comprehensive baseline report
- Use this before making any mode improvements

#### `@mode-test [scenario] [project_name] [test_suffix]`
Targeted scenario testing:
```bash
# Single scenario testing
@mode-test "react-ecommerce" "ShopEasy Platform" "round1-fix"

# All scenarios for comparison  
@mode-test "all" "TestProjects" "external-tools-improvement"
```
- Scenarios: `react-ecommerce`, `python-data-pipeline`, `nodejs-api-service`, `all`
- Auto-loads scenario context from documentation
- Generates detailed evaluation reports

#### `@mode-init [project_name] [test_directory]`
Enhanced mode initialization:
```bash
@mode-init "ProjectName" "react-ecommerce-test"
```
- Creates modes in `.tasks/.modes-test-{test_directory}/`
- Supports parallel testing with separate directories

## Testing Automation

### Baseline Establishment
```bash
# Step 1: Establish baseline before improvements
@mode-baseline "pre-improvements"
```

### Round-by-Round Testing
```bash
# Step 2: Test specific improvements
@mode-test "all" "TestProjects" "round1-external-tools"

# Step 3: Test next iteration
@mode-test "all" "TestProjects" "round2-metadata-fixes"
```

### Single Scenario Focus
```bash
# Test specific scenario during development
@mode-test "react-ecommerce" "ShopEasy" "debugging-placeholders"
```

### Evidence Collection
- **Screenshots**: Mode customization results
- **Task Examples**: Sample tasks created with modes
- **Workflow Traces**: Metadata flow through planning → orchestration → autonomous
- **Timing Data**: Token usage and execution time
- **Error Logs**: Any failures or confusion points

## Continuous Improvement

### Mode Evolution Process
1. **Test Current State**: Baseline measurement
2. **Identify Issues**: Use evaluation criteria to find gaps
3. **Target Improvements**: Focus on lowest-rated areas
4. **Make Changes**: Incremental mode improvements
5. **Re-test**: Validate improvements across all scenarios
6. **Compare**: Measure improvement vs baseline

### Learning Documentation
- **Anti-patterns**: Document what doesn't work
- **Best Practices**: Record what works well across scenarios
- **Scenario Insights**: Project-specific learnings
- **Tool Evolution**: How tool recommendations evolve

## Complete Testing Workflow

### Step-by-Step Process for AI Agents

#### Phase 1: Baseline Establishment
```bash
# 1. Establish comprehensive baseline
@mode-baseline "YYYY-MM-DD-initial"
```
**Expected Output**: Baseline report with ratings across all 3 scenarios

#### Phase 2: Targeted Improvements
```bash
# 2a. Test single scenario during development
@mode-test "react-ecommerce" "TestProject" "external-tools-fix"

# 2b. Test all scenarios after major changes  
@mode-test "all" "TestProjects" "round1-improvements"
```
**Expected Output**: Detailed evaluation reports with before/after comparison

#### Phase 3: Validation and Iteration
```bash
# 3. Re-baseline after improvements
@mode-baseline "post-round1-improvements"
```
**Expected Output**: New baseline showing improvement vs initial baseline

### Command Reference for AI Execution

All commands are designed for autonomous execution with full context auto-loading:

| Command | Purpose | Example | Output Location |
|---------|---------|---------|----------------|
| `@mode-baseline` | Comprehensive testing | `@mode-baseline "current"` | `.modes-test-baseline-current/` |
| `@mode-test` | Targeted testing | `@mode-test "all" "Test" "v1"` | `.modes-test-*-v1/` |
| `@mode-init` | Mode initialization | `@mode-init "Proj" "test1"` | `.modes-test-test1/` |

### Success Criteria for Each Command

#### @mode-baseline Success
- ✅ All 3 scenarios executed completely
- ✅ Evaluation report generated with 5-criteria ratings
- ✅ Cross-scenario analysis completed
- ✅ Improvement priorities identified
- ✅ Test artifacts preserved

#### @mode-test Success  
- ✅ Scenario context auto-loaded correctly
- ✅ Mode customization completed
- ✅ Sample task executed successfully
- ✅ Evidence collected (screenshots, outputs)
- ✅ Detailed evaluation report generated

This testing framework ensures modes provide real value across diverse project types while maintaining quality and consistency.