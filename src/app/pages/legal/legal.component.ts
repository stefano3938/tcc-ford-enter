import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { I18nService } from '../../core/services/i18n.service';
import { FREE_AI_QUERIES_PER_DAY, FREE_IDEAS_MAX, FREE_TASKS_MAX } from '../../core/services/user.service';

type LegalTab = 'privacidade' | 'termos';

@Component({
  selector: 'rm-legal',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.css'
})
export class LegalComponent {
  readonly i18n = inject(I18nService);
  private readonly data = toSignal(inject(ActivatedRoute).data);

  // The active tab comes from the route, so /termos and /privacidade stay linkable
  readonly tab = computed<LegalTab>(() => (this.data()?.['tab'] === 'termos' ? 'termos' : 'privacidade'));

  readonly limits = { tasks: FREE_TASKS_MAX, ideas: FREE_IDEAS_MAX, ai: FREE_AI_QUERIES_PER_DAY };
}
