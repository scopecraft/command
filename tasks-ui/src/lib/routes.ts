// Define the application routes
export const routes = {
  home: '/',
  taskList: '/tasks',
  taskCreate: '/tasks/create',
  taskDetail: (id: string) => `/tasks/${id}`,
  taskEdit: (id: string) => `/tasks/${id}/edit`,
  featureDetail: (id: string) => `/features/${id}`,
  featureEdit: (id: string) => `/features/${id}/edit`,
  featureCreate: '/features/create',
  areaDetail: (id: string) => `/areas/${id}`,
  areaEdit: (id: string) => `/areas/${id}/edit`,
  areaCreate: '/areas/create',
  phaseDetail: (id: string) => `/phases/${id}`,
  comparison: '/comparison',
  graph: '/graph',
  prompt: '/prompt',
  promptWithId: (id: string) => `/prompt/${id}`,
};

// Get route path by name
export function getRoutePath(name: keyof typeof routes, params?: Record<string, string>): string {
  const route = routes[name];
  if (typeof route === 'function' && params) {
    return route(params.id);
  }
  return route as string;
}