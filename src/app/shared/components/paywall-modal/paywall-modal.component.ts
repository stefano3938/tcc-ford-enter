import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rm-paywall-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paywall-modal.component.html',
  styleUrl: './paywall-modal.component.css'
})
export class PaywallModalComponent {
  readonly userService = inject(UserService);
  readonly billingCycle = signal<'monthly' | 'yearly'>('yearly');
  readonly isUpgrading = signal<boolean>(false);

  confirmUpgrade(): void {
    this.isUpgrading.set(true);
    setTimeout(() => {
      this.userService.upgradeToPro();
      this.isUpgrading.set(false);
    }, 600);
  }
}
