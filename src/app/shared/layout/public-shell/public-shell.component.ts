import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { PublicHeaderComponent } from '../public-header/public-header.component';

@Component({
  selector: 'rm-public-shell',
  standalone: true,
  imports: [PublicHeaderComponent, PublicFooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.css'
})
export class PublicShellComponent {}
