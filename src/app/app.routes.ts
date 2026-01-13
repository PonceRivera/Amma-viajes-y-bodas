import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { Blog } from './blog/blog';
import { LoginComponent } from './auth/login.component';
import { SignupComponent } from './auth/signup.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'blog', component: Blog },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
];
