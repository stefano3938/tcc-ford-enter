import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PublicShellComponent } from '../../shared/layout/public-shell/public-shell.component';

type ResourcePreviewType = 'kanban' | 'assistant' | 'ideas' | 'focus' | 'progress' | 'trust';

interface ResourceItem {
  readonly icon: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly previewType: ResourcePreviewType;
}

@Component({
  selector: 'rm-recursos',
  standalone: true,
  imports: [IconComponent, PublicShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recursos.component.html',
  styleUrl: './recursos.component.css'
})
export class RecursosComponent {
  readonly i18n = inject(I18nService);
  readonly carouselIndex = signal(0);
  readonly carouselPage = this.carouselIndex;

  readonly carouselItems = computed<ReadonlyArray<ResourceItem>>(() => [
    {
      icon: 'kanban',
      label: this.i18n.t('resources.item.kanban.label'),
      title: this.i18n.t('resources.item.kanban.title'),
      description: this.i18n.t('resources.item.kanban.body'),
      previewType: 'kanban'
    },
    {
      icon: 'message-square',
      label: this.i18n.t('resources.item.assistant.label'),
      title: this.i18n.t('resources.item.assistant.title'),
      description: this.i18n.t('resources.item.assistant.body'),
      previewType: 'assistant'
    },
    {
      icon: 'layers',
      label: this.i18n.t('resources.item.ideas.label'),
      title: this.i18n.t('resources.item.ideas.title'),
      description: this.i18n.t('resources.item.ideas.body'),
      previewType: 'ideas'
    },
    {
      icon: 'clock',
      label: this.i18n.t('resources.item.focus.label'),
      title: this.i18n.t('resources.item.focus.title'),
      description: this.i18n.t('resources.item.focus.body'),
      previewType: 'focus'
    },
    {
      icon: 'check-circle',
      label: this.i18n.t('resources.item.progress.label'),
      title: this.i18n.t('resources.item.progress.title'),
      description: this.i18n.t('resources.item.progress.body'),
      previewType: 'progress'
    },
    {
      icon: 'shield',
      label: this.i18n.t('resources.item.trust.label'),
      title: this.i18n.t('resources.item.trust.title'),
      description: this.i18n.t('resources.item.trust.body'),
      previewType: 'trust'
    }
  ]);

  get carouselPages(): number[] {
    const perPage = 3;
    return Array.from({ length: Math.ceil(this.carouselItems().length / perPage) }, (_, index) => index);
  }

  @ViewChild('carouselViewport') carouselViewport?: ElementRef<HTMLElement>;

  scrollCarousel(direction: number): void {
    const element = this.carouselViewport?.nativeElement;
    if (!element) return;

    const slide = element.querySelector('.rm-carousel-slide') as HTMLElement | null;
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : element.clientWidth * 0.85;
    element.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  scrollToIndex(index: number): void {
    const element = this.carouselViewport?.nativeElement;
    if (!element) return;

    const slide = element.querySelector('.rm-carousel-slide') as HTMLElement | null;
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : element.clientWidth * 0.85;
    element.scrollTo({ left: index * amount, behavior: 'smooth' });
  }

  scrollToPage(page: number): void {
    this.scrollToIndex(page * 3);
  }

  onCarouselScroll(): void {
    const element = this.carouselViewport?.nativeElement;
    if (!element) return;

    const slide = element.querySelector('.rm-carousel-slide') as HTMLElement | null;
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : element.clientWidth * 0.85;
    if (amount > 0) {
      const index = Math.round(element.scrollLeft / amount);
      this.carouselIndex.set(Math.max(0, Math.min(index, this.carouselItems().length - 1)));
    }
  }
}
