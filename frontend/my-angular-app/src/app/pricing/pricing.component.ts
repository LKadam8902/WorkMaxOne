import { Component } from '@angular/core';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent {
  monthlyPlan = {
    price: '$12/month',
    features: [
      'feature 1',
      'feature 2',
      'feature 3',
      'feature 4'
    ]
  };

  yearlyPlan = {
    price: '$130/yearly',
    features: [
      'feature 1',
      'feature 2',
      'feature 3',
      'feature 4'
    ]
  };

  onContinue(planType: string) {
    // You can implement navigation to a checkout/order page here
    // For example, using Angular Router:
    // this.router.navigate(['/checkout', planType]);
    console.log(`Continue with ${planType} plan`);
    alert(`You selected the ${planType} plan! (This would navigate to a checkout page)`);
  }
}