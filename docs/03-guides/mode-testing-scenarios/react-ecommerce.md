# React E-commerce App Testing Scenario

## Project Context

**Type**: Frontend-heavy business application  
**Domain**: E-commerce platform  
**Tech Stack**: React, TypeScript, Next.js, Tailwind CSS, Stripe, Analytics  
**Team Size**: 3-5 developers  
**Business Focus**: Conversion optimization, user experience, mobile-first  

## Project Characteristics

### Business Priorities
- Conversion rate optimization
- Mobile experience (70% of traffic)
- A/B testing and experimentation
- Performance (Core Web Vitals)
- Accessibility compliance (WCAG)

### Technical Concerns
- React component architecture
- State management (Context/Redux)
- Payment integration (Stripe, PayPal)
- Analytics integration (GA4, Mixpanel)
- Image optimization and CDN
- SEO and performance monitoring

### Team Workflow
- Feature flags for gradual rollouts
- Component-driven development
- Storybook for component library
- Jest/RTL for testing
- Cypress for E2E testing

## Testing Instructions

### Step 1: Project Setup Simulation
Create project structure that simulates a real e-commerce app:

```
/src
  /components
    /checkout
    /product
    /cart
  /pages
    /api
  /styles
  /utils
/tests
/storybook
package.json (with React, Next.js, Stripe, etc.)
```

### Step 2: Mode Initialization
Execute mode-init command:
```
@mode-init "ShopEasy E-commerce Platform"
```

### Step 3: Mode Customization
Follow placeholder guidance to customize modes for e-commerce context. Look for:

**Expected External Tools**:
- WebSearch for current React patterns, performance best practices
- Context7 for React/Next.js documentation (if available)
- External analytics documentation

**Expected Project Rules**:
- Component testing requirements
- Performance benchmarks (Core Web Vitals)
- Accessibility compliance checks
- Mobile-first responsive design

**Expected Process Requirements**:
- Feature flag integration
- A/B testing considerations
- Analytics tracking requirements

### Step 4: Sample Task Execution
Create and execute this sample task using the customized exploration mode:

**Task**: "Research and design product recommendation system to increase cart conversion rates"

**Expected Flow**:
1. **Planning**: Break down into UX research, technical implementation, analytics tracking
2. **Orchestration**: Route to exploration → design → implementation phases
3. **Autonomous**: Execute exploration with proper external tool usage

### Step 5: Evaluation

#### Mode Customization Quality (Target: 4-5)
**Look For**:
- E-commerce specific business metrics (conversion, AOV, cart abandonment)
- Mobile-first considerations throughout
- Performance optimization guidance (Core Web Vitals)
- User experience research patterns
- A/B testing methodology

**Red Flags**:
- Generic "research the problem" guidance
- No mention of business metrics or conversion impact
- Missing mobile/performance considerations
- Overly technical without business context

#### Cross-Mode Workflow (Target: 4-5)
**Look For**:
- Planning creates tasks with proper business context
- Orchestration understands frontend vs backend work
- Autonomous execution includes external research requirements
- Metadata includes performance and UX considerations

**Red Flags**:
- Missing metadata for orchestration routing
- No distinction between frontend/backend concerns
- Broken handoffs between planning and execution

#### Tool Recommendations (Target: 4-5)
**Look For**:
- Clear WebSearch requirements for current React patterns
- External documentation emphasis (training data staleness)
- Analytics and performance monitoring tools
- User research and testing tools

**Red Flags**:
- Relying on outdated React patterns from training
- Missing external validation requirements
- No business/analytics tool recommendations

#### Philosophy Alignment (Target: 4-5)
**Look For**:
- Principles not rigid workflows
- Business context without being prescriptive about strategy
- Technical guidance without over-engineering
- Progressive enhancement approach

**Red Flags**:
- Overly rigid step-by-step processes
- Too much or too little technical detail
- Missing business context
- Token inefficiency (verbose explanations)

#### Real-World Applicability (Target: 4-5)
**Look For**:
- Actionable business insights (conversion optimization strategies)
- Practical technical approaches (React component patterns)
- Realistic constraints (performance, mobile, accessibility)
- Consideration of team workflows (testing, deployment)

**Red Flags**:
- Academic research without business application
- Impractical technical recommendations
- Missing real-world constraints
- No consideration of team dynamics

## Success Criteria

### Excellent Customization (Rating 5)
- Mode produces e-commerce-specific conversion optimization research
- Includes mobile-first and performance considerations
- Balances business metrics with technical implementation
- Provides actionable insights for product recommendations

### Good Customization (Rating 4)
- Mode addresses e-commerce domain concerns
- Includes some business context and technical guidance
- Mentions performance or mobile considerations
- Better than generic research template

### Poor Customization (Rating 1-2)
- Generic research guidance unchanged
- No e-commerce or business context
- Missing performance/mobile considerations
- Indistinguishable from default template

## Documentation Requirements

### Evidence to Collect
1. **Before/After**: Screenshots of mode templates before and after customization
2. **Sample Output**: Generated exploration results for the sample task
3. **Workflow Trace**: Metadata flow through planning → orchestration → autonomous
4. **Tool Usage**: Evidence of external tool requirements being followed
5. **Business Relevance**: Assessment of business value in generated insights

### Key Questions to Answer
1. Would an e-commerce PM find the exploration results useful?
2. Do the technical recommendations align with modern React practices?
3. Are business metrics and conversion optimization properly addressed?
4. Does the mode guide toward current best practices vs stale training data?
5. Would a new e-commerce project benefit from these customized modes?

This scenario tests the mode system's ability to provide domain-specific business value while maintaining technical quality and current best practices.