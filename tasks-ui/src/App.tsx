import { Route, Switch } from 'wouter';
import { AppProviders } from './context/AppProviders';
import { AppLayout } from './components/layout/AppLayout';
import { ToastContainer } from './components/layout/Toast';
import { TaskListView } from './components/task-list/TaskListView';
import { TaskFormView } from './components/task-form/TaskFormView';
import { TaskDetailView } from './components/task-detail/TaskDetailView';
import { HomePage } from './components/pages/HomePage';
import { GraphPage } from './components/pages/GraphPage';
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
          <Route path={routes.graph} component={GraphPage} />
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