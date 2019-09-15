import { RackifyServer } from '../types';

const ConfigKey = Symbol('rackify-config');

type AnyObj = { [key: string]: any };
type GlobString = string;
type RoutableClass = Function;
type RouteConfig = GlobString | RoutableClass;

type BeforeControllersHook = (app: RackifyServer) => void
export interface RackifyAppConfig {
  /**
   * Port for the server to listen on
   *
   * @type {number}
   *
   * @defaultValue 3000
   */
  port: number;

  /**
   * Override options to pass into the fastify instance
   *
   * @type {fastify.Options}
   *
   * @defaultValue {}
   */
  fastify: {}

  /**
   * The working directory for the app.
   *
   * @type {string}
   *
   * @defaultValue process.cwd()
   */
  cwd: string;

  db: {

  }
  /**
   * Array of Route Controllers to be registered on app startup.
   * Array items can be the following format
   *
   * @type {string} a globstring to use to search for routes at startup
   * @type {class} a reference to a class decorated with the Route decorator
   *
   * @defaultValue ['**\/*.controller.{ts, js}']
   */
  controllers: RouteConfig[],
  /**
   * A hook to be executed before rackify adds the controller routes to the server
   * Ideal for setting up plugins or hooks on the fastify instance
   *
   * @type {function beforeControllers(app: RackifyServer) {}}
   *
   * @defaultValue null
   */
  beforeControllers: null | BeforeControllersHook
}

export type RackifyAppConfigOptions = Partial<RackifyAppConfig>;

const defaultConfig: RackifyAppConfig = {
  port: 3000,
  db: {},
  cwd: process.cwd(),
  fastify: {},
  controllers: ['**/*.controller.{ts, js}'],
  beforeControllers: null
};

const isObject = (obj: any) => typeof obj === 'object' && !(obj instanceof Array) && obj !== null;

export const buildConfig = (...sources: AnyObj[]): RackifyAppConfig => {
  const obj: AnyObj = {};

  sources.forEach((source) => {
    for (const key in source) {
      const originalVal = obj[key];
      const newVal = source[key];
      if (typeof originalVal === 'undefined') {
        obj[key] = source[key];
      } else if (isObject(originalVal) && isObject(source)) {
        obj[key] = buildConfig(originalVal, newVal);
      }
    }
  });

  return obj as RackifyAppConfig;
};

export const getConfig = (appInstance: any) => {
  let config = appInstance[ConfigKey];
  if (!config) {
    config = defaultConfig;
  }

  return config as RackifyAppConfig;
};

export const setConfig = (appInstance: any, configToSet: Partial<RackifyAppConfig>) => {
  const config = getConfig(appInstance);
  const newConfig = buildConfig({}, configToSet, config);

  appInstance[ConfigKey] = newConfig;

  return newConfig;
};
