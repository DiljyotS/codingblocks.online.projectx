import Component from '@ember/component';
import { computed, action } from 'ember-decorators/object'
import { service } from 'ember-decorators/service'
import { task } from 'ember-concurrency'

export default class otpEnrollComponent extends Component {
  @service api

  otpSent = false
  otpVerified = false
  userInput = ''
  email = null
  errorString = null

  sendOtpTask = task (function * () {
    return this.get('api').request('otp/request', {
      method: 'POST',
      data: {
        email: this.get('userInput')
      }
    })
    .then( () => {
      this.set('email', this.get('userInput'))
      this.set('userInput', '');
      this.set('errorString', null)
      this.set('otpSent', true);
    })
    .catch(err => {
      console.error(err)
      this.set('errorString', 'Cannot Send OTP to that email. Please use your registered email.')
    })
  })

  verifyOtpTask = task (function * () {
    return this.get('api').request('otp/verify', {
      method: "POST",
      data: {
        email: this.get('email'),
        otp: this.get('userInput')
      }
    }).then( () => {
      window.location.reload()
    }).catch(err => {
      console.error(err)
      this.set('errorString', 'Incorrect OTP');
    })
  })

  @computed ('otpSent')
  get placeholderText () {
    return this.get('otpSent') ? 'Enter OTP' : 'Enter your registered Email'
  }

  @computed ('otpSent')
  get buttonText () {
    return this.get('otpSent') ? 'Enroll Now' : 'Send OTP'
  }

  @action
  handleClick () {
    if (this.get('otpSent'))
      return this.get('verifyOtpTask').perform()
    else
      return this.get('sendOtpTask').perform()
  }
  
}