# Mode Testing Command: $ARGUMENTS

Arguments: [scenario] [project_name] [test_folder_suffix]
- scenario: react-ecommerce | python-data-pipeline | nodejs-api-service | all
- project_name: Name of the project to test with
- test_folder_suffix: Optional suffix for test directory (default: timestamp)

🚨 **TESTING COMMAND** 🚨
This command runs comprehensive mode testing following `/docs/03-guides/mode-testing-scenarios/`

## Your Task

### If scenario = "all"
Run all three scenarios in parallel for comparison:

1. **Create separate test directories**:
   ```bash
   mkdir -p .tasks/.modes-test-react-ecommerce-{suffix}
   mkdir -p .tasks/.modes-test-python-data-{suffix}  
   mkdir -p .tasks/.modes-test-nodejs-api-{suffix}
   ```

2. **Execute all three scenarios**:
   - Follow react-ecommerce.md instructions → save to `.modes-test-react-ecommerce-{suffix}/`
   - Follow python-data-pipeline.md instructions → save to `.modes-test-python-data-{suffix}/`
   - Follow nodejs-api-service.md instructions → save to `.modes-test-nodejs-api-{suffix}/`

3. **Generate comparative report**:
   - Rate each scenario across 5 evaluation criteria
   - Identify patterns across scenarios
   - Document strengths/weaknesses by domain
   - Provide recommendations for improvements

### If specific scenario
Run single scenario testing:

1. **Load scenario context**:
   Read `/docs/03-guides/mode-testing-scenarios/{scenario}.md` for full context

2. **Create test directory**:
   ```bash
   mkdir -p .tasks/.modes-test-{scenario}-{suffix}
   ```

3. **Follow scenario instructions exactly**:
   - Create simulated project structure  
   - Run mode-init with project context
   - Customize modes following scenario guidance
   - Execute sample task
   - Collect evaluation evidence

4. **Generate detailed report**:
   - Rate across all 5 evaluation criteria
   - Document evidence and artifacts
   - Provide specific improvement recommendations

## Scenario Auto-Loading

### React E-commerce Context
**Project Type**: Frontend business application
**Tech Stack**: React, TypeScript, Next.js, Tailwind, Stripe
**Business Focus**: Conversion optimization, mobile-first, A/B testing
**Sample Task**: "Research product recommendation system for cart conversion"

### Python Data Pipeline Context  
**Project Type**: Data processing and ML pipeline
**Tech Stack**: Python, pandas, Airflow, PostgreSQL, scikit-learn
**Business Focus**: Data quality, pipeline reliability, ML performance
**Sample Task**: "Research customer churn prediction with automated retraining"

### Node.js API Service Context
**Project Type**: Backend integration service
**Tech Stack**: Node.js, Express, TypeScript, PostgreSQL, Redis
**Business Focus**: System reliability, API contracts, compliance
**Sample Task**: "Research payment webhook processing with guaranteed delivery"

## Evaluation Framework

Rate each scenario 1-5 across:

### 1. Mode Customization Quality
- Are modes domain-specific vs generic?
- Do placeholders provide relevant guidance?
- Is business context properly addressed?

### 2. Cross-Mode Workflow Integration  
- Does planning create proper metadata for orchestration?
- Do handoffs work seamlessly?
- Is execution routing correct?

### 3. Tool Recommendation Appropriateness
- Are external tools (WebSearch, Context7) properly emphasized?
- Do tool recommendations match project type?
- Is training data staleness addressed?

### 4. Philosophy Alignment
- Right balance of guide vs prescriptive?
- Token efficient but complete?
- Progressive enhancement supported?

### 5. Real-World Applicability
- Would real teams find this useful?
- Are practical constraints considered?
- Is output actionable?

## Report Format

```markdown
# Mode Testing Report - [Date] - [Scenario(s)]

## Test Configuration
- Scenarios: [list]
- Project Names: [list]  
- Test Directories: [list]

## Results Summary

### [Scenario Name]
**Mode Customization Quality**: [1-5] - [Brief reason]
**Cross-Mode Workflow**: [1-5] - [Brief reason] 
**Tool Recommendations**: [1-5] - [Brief reason]
**Philosophy Alignment**: [1-5] - [Brief reason]
**Real-World Applicability**: [1-5] - [Brief reason]
**Average**: [calculated average]

**Key Findings**: [What worked, what didn't]
**Evidence**: [Screenshots, outputs, artifacts]

### Cross-Scenario Analysis (if multiple)
**Consistent Strengths**: [What works across all scenarios]
**Common Weaknesses**: [What fails across scenarios] 
**Domain-Specific Issues**: [Scenario-unique problems]

## Recommendations
1. [Priority improvements needed]
2. [Specific changes to make]
3. [Follow-up testing required]

## Quality Gate Assessment
**Ready for Production**: Yes/No
**Average Rating**: [X.X/5.0]
**Minimum Met**: [4.0+ average] Yes/No
```

## Usage Examples

```bash
# Test single scenario
@mode-test "react-ecommerce" "ShopEasy Platform" "baseline"

# Test all scenarios for comparison  
@mode-test "all" "TestProjects" "v2-improvements"

# Test specific improvements
@mode-test "python-data-pipeline" "DataFlow Analytics" "external-tools-fix"
```

## Output Requirements

1. **Test directories created** with scenario-specific modes
2. **Detailed evaluation report** with evidence
3. **Artifact collection** (screenshots, sample outputs)
4. **Specific recommendations** for improvements
5. **Quality gate assessment** for production readiness

This enables systematic, parallel testing of mode improvements across diverse project types.