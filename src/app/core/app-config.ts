import { InjectionToken } from '@angular/core';

export interface AppConfig {
  userRoles: string[];
}

/** Ported from the AngularJS `appConfig` constant. */
export const APP_CONFIG_VALUE: AppConfig = {
  userRoles: ['guest', 'user', 'admin']
};

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => APP_CONFIG_VALUE
});
