import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ToastItem, ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rm-toast-container',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
  readonly visibleToasts = computed(() => {
    const all = this.toastService.toasts();
    if (all.length <= 4) return all;
    return all.slice(all.length - 4);
  });
}
