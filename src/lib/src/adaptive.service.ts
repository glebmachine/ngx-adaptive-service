import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/observable/combineLatest';
import { PlatformService } from '@betadigitalproduction/ngx-platform-service';
import { ViewportService } from '@betadigitalproduction/ngx-viewport-service';

declare const require: any;

@Injectable()
export class AdaptiveService {
  adaptive: BehaviorSubject<string>;
  orientation: BehaviorSubject<string>;
  signature: Observable<string>;
  device: any;
  isDeviceLibraryLoaded: Promise<any>;

  constructor(
    private platform: PlatformService,
    private viewport: ViewportService
  ) {
    let prevWidth = 0;
    let prevOrientationState = this.getOrientationState();
    let prevAdaptiveState = this.getAdaptiveState();

    this.adaptive = new BehaviorSubject(prevAdaptiveState);
    this.orientation = new BehaviorSubject(prevOrientationState);


    this.platform.runExternal(() => {

      this.isDeviceLibraryLoaded = new Promise((resolve) => {
        // Временно сделал синхронным, чтобы systemjs хавал
        this.device = require('current-device');
        resolve();
      });

      window.addEventListener('resize', () => {
        const viewportWidth = this.viewport.get().width;
        const isFiltrate = viewportWidth === prevWidth;

        const orientationState = this.getOrientationState();
        const adaptiveState = this.getAdaptiveState();

        // Чекаем изменилась-ли ориентация
        if (prevOrientationState !== orientationState) {
          prevOrientationState = orientationState;
          this.orientation.next(orientationState);
        }

        // Чекаем изменилась адаптивность
        if (!isFiltrate) {
          prevWidth = viewportWidth;

          if (prevAdaptiveState !== adaptiveState) {
            prevAdaptiveState = adaptiveState;
            this.adaptive.next(adaptiveState);
          }
        }
      });
    });

    if (this.platform.isPlatformServer) {
      this.isDeviceLibraryLoaded = Promise.resolve('');
    }

    // Делаем комибинированный обсервер
    this.signature = Observable.combineLatest(this.adaptive, this.orientation, (a, o) => `${a}-${o}`);
  }

  getAdaptiveState() {
    if (this.viewport.get().width >= 1024) {
      return 'desktop';
    }

    if (this.viewport.get().width >= 768) {
      return 'tablet';
    }

    return 'mobile';
  }

  getOrientationState() {
    return this.viewport.get().width > this.viewport.get().height ? 'landscape' : 'portrait';
  }
}
