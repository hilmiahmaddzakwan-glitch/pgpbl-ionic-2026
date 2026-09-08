import { setAssetPath } from '@stencil/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

setAssetPath(`${window.location.origin}/`);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
