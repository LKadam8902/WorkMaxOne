import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-in-account', // The selector to use this component in other templates
  standalone: true, // <--- this matters
  templateUrl: './sign-in-account.component.html', // Path to the HTML template
  styleUrls: ['./sign-in-account.component.css'], // Path to the CSS stylesheet

  imports: [CommonModule, ReactiveFormsModule]
})
export class SignInAccountComponent implements OnInit {

  signInForm!: FormGroup; // Declare signInForm as a FormGroup

  constructor() { }

  ngOnInit(): void {
    // Initialize the FormGroup when the component initializes
    this.signInForm = new FormGroup({
      username: new FormControl('', Validators.required), // Username is required
      password: new FormControl('', [
        Validators.required,        // Password is required
        Validators.minLength(6)     // Password must be at least 6 characters
      ])
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.signInForm.controls; }

  onSubmit(): void {
    // Stop here if form is invalid
    if (this.signInForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.signInForm.markAllAsTouched();
      console.log('Form is invalid. Please check the fields.');
      return;
    }

    // Form is valid, proceed with submission
    const username = this.signInForm.value.username;
    const password = this.signInForm.value.password;

    console.log('Sign In Data:', { username, password });

    // In a real application, you would typically send this data to an API
    // using an Angular HttpClient service, e.g.:
    // this.authService.login(username, password).subscribe(
    //   response => {
    //     console.log('Login successful!', response);
    //     // Handle successful login (e.g., navigate to dashboard, store token)
    //   },
    //   error => {
    //     console.error('Login failed!', error);
    //     // Handle login error (e.g., display error message to user)
    //   }
    // );

    alert('Sign In successful! (Check console for data)');
    // You might want to reset the form after successful submission
    // this.signInForm.reset();
  }
}