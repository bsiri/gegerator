import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { WizardConfiguration, WizardConfigurationJSON } from '../ngrx/appstate-models/wizardconfiguration.model';

const wizconfUrl = "./api/configuration/wizard"

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private http = inject(HttpClient);

  getWizardConfiguration(): Observable<WizardConfiguration>{
    return this.http.get<WizardConfigurationJSON>(wizconfUrl)
    .pipe(
      map(WizardConfiguration.fromJSON)
    )
  }

  updateWizardConfiguration(wizconf: WizardConfiguration): Observable<WizardConfiguration>{
    return this.http.put<WizardConfigurationJSON>(wizconfUrl, wizconf.toJSON())
    .pipe(
      map(WizardConfiguration.fromJSON)
    )
  }

}
