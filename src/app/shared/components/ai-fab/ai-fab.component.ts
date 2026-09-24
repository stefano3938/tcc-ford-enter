import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { StorageService } from '../../../core/services/storage.service';
import { UserService } from '../../../core/services/user.service';
import { IconComponent } from '../icon/icon.component';

const TEASER_DISMISSED_KEY = 'redmindme_ai_fab_teaser_dismissed';
const TEASER_DELAY_MS = 1500;

/** Floating shortcut to the AI assistant, with a one-time teaser inviting people to try it. */
@Component({
  selector: 'rm-ai-fab',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-fab.component.html',
  styleUrl: './ai-fab.component.css'
})
export class AiFabComponent {
  readonly i18n = inject(I18nService);
  readonly userService = inject(UserService);
  private readonly storage = inject(StorageService);

  readonly showTeaser = signal(false);

  constructor() {
    if (!this.storage.getItem<boolean>(TEASER_DISMISSED_KEY, false)) {
      const timer = setTimeout(() => this.showTeaser.set(true), TEASER_DELAY_MS);
      inject(DestroyRef).onDestroy(() => clearTimeout(timer));
    }
  }

  dismissTeaser(): void {
    this.showTeaser.set(false);
    this.storage.setItem(TEASER_DISMISSED_KEY, true);
  }
}
