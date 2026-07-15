import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface ModalButton {
  text: string;
  classes: string;
  /** true → resolves the modal (close), false → rejects it (dismiss). */
  confirm: boolean;
}

/**
 * Generic confirmation modal content, ported from the AngularJS
 * `components/modal/modal.html` template. Rendered inside an ng-bootstrap modal;
 * `ViewEncapsulation.None` so the `.modal-*` contextual styles apply to the
 * modal window element (which lives outside this component).
 */
@Component({
  selector: 'app-modal-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './modal.scss',
  template: `
    <div class="modal-header">
      @if (dismissable) {
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
          <span aria-hidden="true">&times;</span>
        </button>
      }
      @if (title) {
        <h4 class="modal-title">{{ title }}</h4>
      }
    </div>
    <div class="modal-body">
      @if (text) {
        <p>{{ text }}</p>
      }
      @if (html) {
        <div [innerHTML]="html"></div>
      }
    </div>
    <div class="modal-footer">
      @for (button of buttons; track button.text) {
        <button
          type="button"
          class="btn"
          [class]="button.classes"
          (click)="onButtonClick(button)"
        >
          {{ button.text }}
        </button>
      }
    </div>
  `
})
export class ModalContentComponent {
  @Input() title = '';
  @Input() text = '';
  @Input() html = '';
  @Input() dismissable = true;
  @Input() buttons: ModalButton[] = [];

  constructor(public activeModal: NgbActiveModal) {}

  onButtonClick(button: ModalButton): void {
    if (button.confirm) {
      this.activeModal.close();
    } else {
      this.activeModal.dismiss();
    }
  }
}
