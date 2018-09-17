import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';

import { AuthService } from '../auth.service';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  signupForm: FormGroup;
  isLoading = false;
  private authStatusSub: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });

    this.signupForm = new FormGroup({
      'username': new FormControl(null, {validators: [Validators.required]}),
      'firstName': new FormControl(null, {validators: [Validators.required]}),
      'lastName': new FormControl(null, {validators: [Validators.required]}),
      'email': new FormControl(null, {validators: [Validators.required, Validators.email]}),
      'userPassword': new FormGroup({
        'password': new FormControl(null, {validators: [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,20}/)]}),
        'rePassword': new FormControl(null, {validators: [Validators.required]})
      }, {validators: this.passwordValidator})
    });
  }

  onSignup() {
    if (this.signupForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(
      this.signupForm.value.username,
      this.signupForm.value.firstName,
      this.signupForm.value.lastName,
      this.signupForm.value.email,
      this.signupForm.value.userPassword.password);
  }

  passwordValidator(group: FormGroup): {[s: string]: boolean} {
    if (group.controls.password.value !== group.controls.rePassword.value) {
      console.log('not matched');
      return {'passwordsNotMatched': true};
    }
    console.log('matched');
    return null;
  }

  usernameValidator(control: FormControl): Promise<any> | Observable<any> {
    console.log('in here');
    const promise = new Promise<any>((resolve, reject) => {
      this.authService.findUsername(control.value)
        .subscribe(result => {
          if (result.message === 'invalid') {
            resolve({'usernameAlreadyExist': true});
          } else {
            resolve(null);
          }
        });
    });
    return promise;
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
