import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CapitalRaisesComponent } from './component/dashboard/dashboard/capital-raises/capital-raises.component';
import { CompanyDetailsComponent } from './component/dashboard/dashboard/company-details/company-details.component';
import { DashboardComponent } from './component/dashboard/dashboard/dashboard.component';
import { DirectorsComponent } from './component/dashboard/dashboard/directors/directors.component';
import { FinancialsComponent } from './component/dashboard/dashboard/financials/financials.component';
import { MarketDataComponent } from './component/dashboard/dashboard/market-data/market-data.component';
import { MarketNewDataComponent } from './component/dashboard/dashboard/market-new-data/market-new-data.component';

import { PaymentsComponent } from './component/dashboard/dashboard/payments/payments.component';
import { ProjectsComponent } from './component/dashboard/dashboard/projects/projects.component';
import { ProjectsJorcsComponent } from './component/dashboard/dashboard/projects_jorcs/projects_jorcs.component';
import { SettingsComponent } from './component/dashboard/dashboard/settings/settings.component';
import { ShareholdersComponent } from './component/dashboard/dashboard/shareholders/shareholders.component';
import { DashboardHomeComponent } from './component/dashboard/dashboardHome.component';
import { ContactUsComponent } from './component/landingPage/contactUs/contactUs.component';
import { LandingPageHomeComponent } from './component/landingPage/home/landingPageHome.component';
import { LandingPageComponent } from './component/landingPage/landingPage.component';
import { PricingComponent } from './component/landingPage/pricing/pricing.component';
import { ProductsComponent } from './component/landingPage/products/products.component';
import { SignupVerificationComponent } from './component/modals/signup-verification/signup-verification.component';

const routes: Routes = [
  {
    path: '', component: LandingPageComponent, children: [
      { path: '', component: LandingPageHomeComponent },
      { path: 'pricing', component: PricingComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'contactus', component: ContactUsComponent },
      { path: 'verification', component: SignupVerificationComponent },
    ]
  },
  {
    path: 'home', component: DashboardHomeComponent, children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'company_details', component: CompanyDetailsComponent },
      { path: 'marketdata', component: MarketDataComponent },
			{ path: 'marketnewdata', component: MarketNewDataComponent },
      { path: 'directors', component: DirectorsComponent },
      { path: 'shareholders', component: ShareholdersComponent },
      { path: 'capitalraises', component: CapitalRaisesComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'projects_jorcs', component: ProjectsJorcsComponent },
      { path: 'financials', component: FinancialsComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
