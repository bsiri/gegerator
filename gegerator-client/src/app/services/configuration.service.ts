import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { WizardConfiguration, WizardConfigurationJSON } from '../models/wizardconfiguration.model';

const wizconfUrl = "/gegerator/configuration/wizard"

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor(private http: HttpClient) { }
  
  getWizardConfiguration(): Observable<WizardConfiguration>{
    return this.http.get<WizardConfigurationJSON>(wizconfUrl)
    .pipe(
      map(WizardConfiguration.fromJSON)
    )
  }

  updateWizardConfiguration(wizconf: WizardConfiguration): Observable<WizardConfiguration>{
    return this.http.put<WizardConfigurationJSON>(wizconfUrl, wizconf)
    .pipe(
      map(WizardConfiguration.fromJSON)
    )
  }

}
