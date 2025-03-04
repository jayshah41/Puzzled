import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './component/dashboard/dashboard/dashboard.component';
import { DashboardHomeComponent } from './component/dashboard/dashboardHome.component';
import { ContactUsComponent } from './component/landingPage/contactUs/contactUs.component';
import { LandingPageHomeComponent } from './component/landingPage/home/landingPageHome.component';
import { LandingPageComponent } from './component/landingPage/landingPage.component';
import { PricingComponent } from './component/landingPage/pricing/pricing.component';
import { ProductsComponent } from './component/landingPage/products/products.component';
import { LoginComponent } from './component/modals/login/login.component';
import { CompanyDetailsComponent } from './component/dashboard/dashboard/company-details/company-details.component';
import { MarketDataComponent } from './component/dashboard/dashboard/market-data/market-data.component';
import { DirectorsComponent } from './component/dashboard/dashboard/directors/directors.component';
import { ShareholdersComponent } from './component/dashboard/dashboard/shareholders/shareholders.component';
import { CapitalRaisesComponent } from './component/dashboard/dashboard/capital-raises/capital-raises.component';
import { ProjectsComponent } from './component/dashboard/dashboard/projects/projects.component';
import { FinancialsComponent } from './component/dashboard/dashboard/financials/financials.component';
import { PaymentsComponent } from './component/dashboard/dashboard/payments/payments.component';
import { SettingsComponent } from './component/dashboard/dashboard/settings/settings.component';
import { SignupComponent } from './component/modals/signup/signup.component';
import { ProjectsJorcsComponent } from './component/dashboard/dashboard/projects_jorcs/projects_jorcs.component';
import { MarketNewDataComponent } from './component/dashboard/dashboard/market-new-data/market-new-data.component';
import { SignupVerificationComponent } from './component/modals/signup-verification/signup-verification.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    LandingPageHomeComponent,
    PricingComponent,
    ProductsComponent,
    ContactUsComponent,
    LoginComponent,
    DashboardHomeComponent,
    DashboardComponent,
    CompanyDetailsComponent,
    MarketDataComponent,
    DirectorsComponent,
    ShareholdersComponent,
    CapitalRaisesComponent,
    ProjectsComponent,
    ProjectsJorcsComponent,
    FinancialsComponent,
    PaymentsComponent,
    SettingsComponent,
    SignupComponent,
    MarketNewDataComponent,
    SignupVerificationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
		HttpClientModule,
    BrowserAnimationsModule,
		DragDropModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })		
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
