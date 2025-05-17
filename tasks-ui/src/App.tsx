import { Route, Switch } from 'wouter';
import { AppProviders } from './context/AppProviders';
import { AppLayout } from './components/layout/AppLayout';
import { ToastContainer } from './components/layout/Toast';
import { TaskListView } from './components/task-list/TaskListView';
import { TaskFormView } from './components/task-form/TaskFormView';
import { TaskDetailView } from './components/task-detail/TaskDetailView';
import { HomePage } from './components/pages/HomePage';
import { FeatureDetailView } from './components/pages/FeatureDetailPage';
import { AreaDetailView } from './components/pages/AreaDetailPage';
import { PhaseDetailView } from './components/pages/PhaseDetailPage';
import { ProgressComparisonView } from './components/pages/ProgressComparisonView';
import { FeatureFormView } from './components/feature-form/FeatureFormView';
import { AreaFormView } from './components/area-form/AreaFormView';
import { PromptPage } from './components/pages/PromptPage';
import { routes } from './lib/routes';

// Main App component with routing
function App() {
  return (
    <AppProviders>
      <AppLayout>
        <Switch>
          <Route path={routes.home} component={HomePage} />
          <Route path={routes.taskList} component={TaskListView} />
          <Route path={routes.taskCreate} component={TaskFormView} />
          <Route path={routes.taskDetail(':id')} component={TaskDetailView} />
          <Route path={routes.taskEdit(':id')}>
            {params => <TaskFormView taskId={params.id} />}
          </Route>
          <Route path={routes.featureDetail(':id')} component={FeatureDetailView} />
          <Route path={routes.featureEdit(':id')}>
            {params => <FeatureFormView featureId={`FEATURE_${params.id}`} isEdit={true} />}
          </Route>
          <Route path={routes.featureCreate} component={FeatureFormView} />
          
          <Route path={routes.areaDetail(':id')} component={AreaDetailView} />
          <Route path={routes.areaEdit(':id')}>
            {params => <AreaFormView areaId={`AREA_${params.id}`} isEdit={true} />}
          </Route>
          <Route path={routes.areaCreate} component={AreaFormView} />
          
          <Route path={routes.phaseDetail(':id')} component={PhaseDetailView} />
          
          <Route path={routes.comparison} component={ProgressComparisonView} />
          
          <Route path={routes.prompt} component={PromptPage} />
          <Route path={routes.promptWithId(':id')} component={PromptPage} />
          
          {/* Fallback route */}
          <Route>
            <div className="p-4 text-center">
              <h1 className="text-xl font-bold mb-4">404: Page Not Found</h1>
              <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
            </div>
          </Route>
        </Switch>
      </AppLayout>
      <ToastContainer />
    </AppProviders>
  );
}

export default App;