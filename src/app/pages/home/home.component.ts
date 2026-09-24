import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ParticleFieldComponent } from '../../shared/components/particle-field/particle-field.component';
import { PublicShellComponent } from '../../shared/layout/public-shell/public-shell.component';

@Component({
  selector: 'rm-home',
  standalone: true,
  imports: [ButtonComponent, ParticleFieldComponent, PublicShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.activatedRoute.fragment.pipe(take(1)).subscribe(fragment => {
      if (fragment === 'recursos') {
        this.router.navigate(['/recursos'], { replaceUrl: true });
      } else if (fragment === 'como-funciona') {
        this.router.navigate(['/como-funciona'], { replaceUrl: true });
      }
    });
  }

  goToResources(): void {
    this.router.navigate(['/recursos']);
  }

  onStartNow(): void {
    this.router.navigate([this.authService.isAuthenticated() ? '/dashboard' : '/login']);
  }
}
