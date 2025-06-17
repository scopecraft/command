# Python Data Pipeline Testing Scenario

## Project Context

**Type**: Backend data processing system  
**Domain**: Data analytics and ML pipeline  
**Tech Stack**: Python, pandas, Apache Airflow, PostgreSQL, Jupyter, scikit-learn, Docker  
**Team Size**: 2-4 data engineers + 1-2 data scientists  
**Business Focus**: Data quality, pipeline reliability, ML model performance  

## Project Characteristics

### Business Priorities
- Data quality and validation
- Pipeline reliability and monitoring
- ML model performance and drift detection
- Cost optimization (compute resources)
- Regulatory compliance (data privacy)

### Technical Concerns
- ETL pipeline architecture
- Data validation and schema management
- Model training and deployment
- Monitoring and alerting
- Resource optimization
- Data lineage and governance

### Team Workflow
- Jupyter notebooks for exploration
- Airflow DAGs for production pipelines
- Git-based model versioning
- Automated testing for data quality
- Infrastructure as code (Terraform)

## Testing Instructions

### Step 1: Project Setup Simulation
Create project structure that simulates a real data pipeline:

```
/airflow
  /dags
  /plugins
/notebooks
  /exploration
  /analysis
/src
  /data_processing
  /models
  /validation
/tests
  /data_quality
  /integration
/infrastructure
requirements.txt (pandas, airflow, scikit-learn, etc.)
pyproject.toml
```

### Step 2: Mode Initialization
Execute mode-init command:
```
@mode-init "DataFlow Analytics Pipeline"
```

### Step 3: Mode Customization
Follow placeholder guidance to customize modes for data pipeline context. Look for:

**Expected External Tools**:
- WebSearch for current data engineering practices, MLOps patterns
- Context7 for pandas/airflow documentation (if available)
- External library documentation (scikit-learn, tensorflow)

**Expected Project Rules**:
- Data quality validation requirements
- Pipeline testing standards
- Model performance monitoring
- Code quality for data processing

**Expected Process Requirements**:
- Data lineage tracking
- Experiment tracking (MLflow, Weights & Biases)
- Pipeline orchestration metadata

### Step 4: Sample Task Execution
Create and execute this sample task using the customized exploration mode:

**Task**: "Research and design customer churn prediction model with automated retraining pipeline"

**Expected Flow**:
1. **Planning**: Break down into data exploration, model development, pipeline automation
2. **Orchestration**: Route to exploration → design → implementation phases
3. **Autonomous**: Execute exploration with proper data analysis methodology

### Step 5: Evaluation

#### Mode Customization Quality (Target: 4-5)
**Look For**:
- Data quality and validation emphasis
- ML model lifecycle considerations (training, evaluation, deployment, monitoring)
- Pipeline reliability and monitoring patterns
- Data exploration methodology (EDA, statistical analysis)
- Experiment tracking and reproducibility

**Red Flags**:
- Generic "research the problem" without data context
- No mention of data quality or validation
- Missing ML model lifecycle considerations
- Overly theoretical without practical data constraints

#### Cross-Mode Workflow (Target: 4-5)
**Look For**:
- Planning creates tasks with data science methodology
- Orchestration understands data processing vs model development
- Autonomous execution includes proper data analysis tools
- Metadata includes data quality and model performance considerations

**Red Flags**:
- Missing data lineage tracking
- No distinction between exploration and production code
- Broken handoffs between data analysis and model deployment

#### Tool Recommendations (Target: 4-5)
**Look For**:
- Clear WebSearch requirements for current MLOps practices
- External documentation for data libraries (pandas changes frequently)
- Data validation and monitoring tools
- Experiment tracking and model versioning tools

**Red Flags**:
- Relying on outdated ML practices from training
- Missing external validation for library versions
- No data quality or monitoring tool recommendations

#### Philosophy Alignment (Target: 4-5)
**Look For**:
- Principled data science methodology
- Practical pipeline considerations without over-engineering
- Iterative model development approach
- Balance of exploration and production concerns

**Red Flags**:
- Overly rigid data science workflows
- Too much theoretical ML without practical constraints
- Missing production pipeline considerations
- Token inefficiency (verbose statistical explanations)

#### Real-World Applicability (Target: 4-5)
**Look For**:
- Actionable data insights (feature engineering, model selection)
- Practical pipeline architecture (monitoring, alerting, scaling)
- Realistic constraints (data quality, computational resources)
- Consideration of data team workflows (notebooks → production)

**Red Flags**:
- Academic ML without business application
- Impractical data infrastructure recommendations
- Missing data governance and compliance
- No consideration of operational constraints

## Success Criteria

### Excellent Customization (Rating 5)
- Mode produces data-specific churn prediction methodology
- Includes data quality validation and pipeline monitoring
- Balances ML model performance with operational reliability
- Provides actionable insights for automated retraining

### Good Customization (Rating 4)
- Mode addresses data pipeline domain concerns
- Includes some ML methodology and data quality guidance
- Mentions monitoring or reliability considerations
- Better than generic research template

### Poor Customization (Rating 1-2)
- Generic research guidance unchanged
- No data science or ML context
- Missing data quality/pipeline considerations
- Indistinguishable from default template

## Documentation Requirements

### Evidence to Collect
1. **Before/After**: Screenshots of mode templates before and after customization
2. **Sample Output**: Generated exploration results for the churn prediction task
3. **Workflow Trace**: Metadata flow through planning → orchestration → autonomous
4. **Tool Usage**: Evidence of external tool requirements being followed
5. **Technical Depth**: Assessment of data science methodology quality

### Key Questions to Answer
1. Would a data scientist find the exploration results methodologically sound?
2. Do the technical recommendations align with current MLOps practices?
3. Are data quality and pipeline reliability properly addressed?
4. Does the mode guide toward current best practices vs outdated ML approaches?
5. Would a new data team benefit from these customized modes?

## Data-Specific Evaluation Points

### Data Quality Focus
- Are data validation patterns emphasized?
- Is schema management and evolution addressed?
- Are data quality metrics and monitoring included?

### ML Lifecycle Management
- Is model training/evaluation/deployment covered?
- Are experiment tracking and reproducibility addressed?
- Is model monitoring and drift detection included?

### Pipeline Reliability
- Are error handling and retry mechanisms covered?
- Is pipeline monitoring and alerting addressed?
- Are resource optimization and scaling considerations included?

This scenario tests the mode system's ability to provide domain-specific data science value while maintaining engineering rigor and current best practices.