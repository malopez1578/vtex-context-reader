/**
 * VTEX Context Types
 * Defines the structure of VTEX-specific files and configurations
 */

/**
 * VTEX App Manifest structure
 */
export interface VTEXManifest {
  vendor: string;
  name: string;
  version: string;
  title: string;
  description: string;
  builders: {
    [key: string]: string;
  };
  dependencies: {
    [key: string]: string;
  };
  peerDependencies?: {
    [key: string]: string;
  };
  policies?: VTEXPolicy[];
  billingOptions?: VTEXBillingOptions;
  registries?: string[];
  credentialType?: string;
  categories?: string[];
  $schema?: string;
}

/**
 * VTEX Service configuration
 */
export interface VTEXService {
  memory: number;
  ttl: number;
  timeout: number;
  minReplicas: number;
  maxReplicas: number;
  workers: number;
  events?: {
    [key: string]: any;
  };
  routes?: {
    [key: string]: any;
  };
}

/**
 * VTEX Policy structure
 */
export interface VTEXPolicy {
  name: string;
  attrs?: {
    [key: string]: string;
  };
}

/**
 * VTEX Billing Options
 */
export interface VTEXBillingOptions {
  termsURL: string;
  support?: {
    url?: string;
    email?: string;
  };
  free?: boolean;
  type?: string;
  availableCountries?: string[];
  plans?: VTEXBillingPlan[];
}

/**
 * VTEX Billing Plan
 */
export interface VTEXBillingPlan {
  id: string;
  currency: string;
  price: number;
  commitment?: string;
  itemMetrics?: {
    [key: string]: any;
  };
}

/**
 * VTEX Schema structure
 */
export interface VTEXSchema {
  type: string;
  properties: {
    [key: string]: any;
  };
  required?: string[];
  additionalProperties?: boolean;
  $schema?: string;
}

/**
 * VTEX Project Context
 */
export interface VTEXProjectContext {
  isVTEXProject: boolean;
  manifest?: VTEXManifest;
  service?: VTEXService;
  schema?: VTEXSchema;
  builders: string[];
  dependencies: string[];
  projectType: VTEXProjectType;
  workspaceRoot: string;
  contextFiles: VTEXContextFile[];
}

/**
 * VTEX Project Types
 */
export enum VTEXProjectType {
  APP = 'app',
  STORE_THEME = 'store-theme',
  REACT_APP = 'react-app',
  NODE_SERVICE = 'node-service',
  GRAPHQL_SERVICE = 'graphql-service',
  PIXEL_APP = 'pixel-app',
  UNKNOWN = 'unknown'
}

/**
 * VTEX Context File information
 */
export interface VTEXContextFile {
  path: string;
  type: VTEXFileType;
  content?: any;
  lastModified: number;
}

/**
 * VTEX File Types
 */
export enum VTEXFileType {
  MANIFEST = 'manifest',
  SERVICE = 'service',
  SCHEMA = 'schema',
  REACT_COMPONENT = 'react-component',
  GRAPHQL_SCHEMA = 'graphql-schema',
  NODE_SERVICE = 'node-service',
  STOREFRONT_CONFIG = 'storefront-config',
  METADATA = 'metadata'
}
