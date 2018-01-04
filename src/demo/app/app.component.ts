import { Component } from '@angular/core';
import { AdaptiveService } from '@betadigitalproduction/ngx-adaptive-service';

@Component({
  selector: 'demo-app',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public adaptive: AdaptiveService) {
    console.log(this.adaptive.getOrientationState());
    console.log(this.adaptive.getAdaptiveState());
  }
}
