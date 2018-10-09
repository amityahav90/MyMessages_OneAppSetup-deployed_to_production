import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthValidators {
  constructor(private authService: AuthService) {
  }

  passwordValidator(group: FormGroup): {[s: string]: boolean} {
    if (group.controls.password.value !== group.controls.rePassword.value) {
      return {'passwordsNotMatched': true};
    }
    return null;
  }

  usernameValidator(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
      this.authService.findUsername(control.value)
        .subscribe(result => {
          console.log('##@@' + result.message);
          if (result.message === 'invalid') {
            if (result.userId === this.authService.getUserId()) {
              resolve(null);
            } else {
              resolve({'usernameAlreadyExist': true});
            }
          } else {
            resolve(null);
          }
        });
    });
    return promise;
  }
}
