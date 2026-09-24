import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'rm-public-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.css'
})
export class PublicFooterComponent {
  readonly i18n = inject(I18nService);
}
