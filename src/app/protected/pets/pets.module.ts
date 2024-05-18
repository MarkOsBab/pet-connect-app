import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PetsRoutingModule } from './pets-routing.module';
import { IndexComponent } from './pages/index/index.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from 'src/app/shared/shared.module';
import { PhonePipe } from 'src/app/shared/pipes/phone.pipe';
import { MapComponent } from './components/map/map.component';
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { PetFoundModalComponent } from './components/pet-found-modal/pet-found-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbToast, NgbToastModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { RecaptchaFormsModule, RecaptchaV3Module } from "ng-recaptcha";
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    IndexComponent,
    PhonePipe,
    MapComponent,
    ImageModalComponent,
    PetFoundModalComponent
  ],
  imports: [
    CommonModule,
    PetsRoutingModule,
    FontAwesomeModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbTypeaheadModule,
    RecaptchaV3Module,
    RecaptchaFormsModule,
    NgbToastModule,
    MatMenuModule,
  ],
  providers: [],
})
export class PetsModule { }
