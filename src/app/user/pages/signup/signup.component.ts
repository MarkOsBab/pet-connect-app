import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { faExclamationCircle, faEye, faEyeSlash, faSpinner, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FormValidationService } from 'src/app/shared/services/form-validation.service';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { NominatimService } from 'src/app/shared/services/nominatim.service';
import { Subject } from 'rxjs';
import { User } from 'src/app/shared/interfaces/user.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthResponse } from 'src/app/shared/interfaces/auth-response.interface';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit {
  faExclamationCircle = faExclamationCircle;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faSpinner = faSpinner;
  faChevronRight = faChevronRight;

  @Output() next: EventEmitter<void> = new EventEmitter<void>();

  signupForm!: FormGroup;
  loaderForEmailExists: boolean = false;
  emailExists: boolean = false;
  addressSuggestions: any[] = [];
  selectingSuggestion = false;

  showLoader = true;
  show: boolean = false;
  submitting: boolean = false;
  unknowError: boolean = false;
  errorMessage!: string;
  btnValue: string = 'Siguiente';
  private destroy$ = new Subject<void>();


  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private formValidationService: FormValidationService,
    private nominatimService: NominatimService
  ) {
    this.signupForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(16), Validators.pattern("^[a-zA-ZáÁéÉíÍóÓúÚñÑ]+$")]],
      lastname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(16), Validators.pattern("^[a-zA-ZáÁéÉíÍóÓúÚñÑ]+$")]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern("^(?=.*[A-Z]).{6,}$")]],
      phone: ['', [Validators.required, Validators.minLength(8), Validators.pattern("^[0-9]{8,}$")]],
      address: ['', [Validators.required]],
      birth_date: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
      this.signupForm.get('email')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        this.validateEmail();
      });

      this.signupForm.get('address')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (this.selectingSuggestion) {
            this.selectingSuggestion = false;
            return [];
          } else {
            return this.nominatimService.getAddressSuggestions(value);
          }
        })
      )
      .subscribe((suggestions: string[]) => {
        this.addressSuggestions = suggestions;
      });

      this.setMinDate();
  }

  ngAfterViewInit(): void {
    this.showLoader = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isFieldInvalid(fieldName: string): boolean {
    const formControl = this.signupForm.get(fieldName);
    return !!formControl && formControl.invalid && formControl.touched;
  }
  
  isFieldValid(fieldName: string): boolean {
    const formControl = this.signupForm.get(fieldName);
    return !!formControl && formControl.valid && formControl.touched;
  }

  getErrorMessage(fieldName: string): string {
    const formControl = this.signupForm.get(fieldName);
    if (!formControl?.errors) {
      return '';
    }

    const errorKey = Object.keys(formControl.errors)[0];
    return this.formValidationService.getErrorMessage(errorKey, formControl.errors[errorKey]);
  }

  validateEmail(): void {
    const emailControl = this.signupForm.get('email');
    if (emailControl?.valid) {
      this.loaderForEmailExists = true;
      this.userService.checkEmailExists(emailControl.value).then((exists) => {
        this.emailExists = exists;
        this.loaderForEmailExists = false;
      });
    } else {
      this.emailExists = false;
      this.loaderForEmailExists = false;
    }
  }

  toggleShow() {
    this.show = !this.show;
  }

  selectAddressSuggestion(suggestion: string): void {
    this.signupForm.get('address')?.setValue(suggestion);
    this.addressSuggestions = [];
    this.selectingSuggestion = true;
  }

  setMinDate(): void {
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - 12);
  
    this.signupForm.get('birth_date')?.setValidators([this.formValidationService.minDateValidator(currentDate)]);
    this.signupForm.get('birth_date')?.updateValueAndValidity();
  }

  register() {
    this.submitting = true;
    this.unknowError = false;
    const oldBtnValue = this.btnValue;

    const { firstname, lastname, email, password, phone, address, birth_date } = this.signupForm.value;
    const formData = new FormData();

    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('birth_date', birth_date);

    if(this.signupForm.valid) {
      this.userService.register(formData).subscribe({
        next: (res: User) => {
          this.authService.login(email, password).subscribe({
            next: (loginResult: AuthResponse) => {
              this.unknowError = false;
              this.submitting = false;
              this.next.emit();
            },
            error: (error: HttpErrorResponse) => {
              this.unknowError = true;
              this.submitting = false;
              this.errorMessage = 'Ocurrió un error al iniciar sesión de forma automática.';
            }
          })
        },
        error: (error: HttpErrorResponse) => {
          this.submitting = false;
          this.unknowError = true;
          this.btnValue = oldBtnValue;
          this.errorMessage = 'Ocurrió un error al registrar el usuario.';
        }
      });
    }
  }
}
