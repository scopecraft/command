// Define the application routes
export const routes = {
  home: '/',
  taskList: '/tasks',
  taskCreate: '/tasks/create',
  taskDetail: (id: string) => `/tasks/${id}`,
  taskEdit: (id: string) => `/tasks/${id}/edit`,
  graph: '/graph',
};

// Get route path by name
export function getRoutePath(name: keyof typeof routes, params?: Record<string, string>): string {
  const route = routes[name];
  if (typeof route === 'function' && params) {
    return route(params.id);
  }
  return route as string;
}