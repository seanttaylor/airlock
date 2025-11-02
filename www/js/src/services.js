// Low-level functionality essential for basic operation of the application
export const core = [
    'Config',
    'Events',
  ];
  
  // Main services that contain the application business logic
  export const services = [
    'Database',
    'PolicyService',
    'NOOPService',
    'RouteService',
    'HTTPService',
  ];
  
  // Objects containing generalized functionality consumed by the services above 
  export const providers = [
    'ElectronProvider',
    'ProcessProvider'
  ];