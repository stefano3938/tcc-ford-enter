import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService } from '../../../core/services/user.service';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../button/button.component';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { LangSwitcherComponent } from '../lang-switcher/lang-switcher.component';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'rm-header',
  standalone: true,
  imports: [RouterLink, ButtonComponent, BadgeComponent, IconComponent, AvatarComponent, LangSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly userService = inject(UserService);
  readonly taskService = inject(TaskService);
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);

  readonly toggleMenu = output<void>();

  openAiPaywall(): void {
    if (!this.userService.isPro()) {
      this.userService.openPaywall('Acesso ilimitado à inteligência generativa e expansão de ideias.');
    }
  }
}
