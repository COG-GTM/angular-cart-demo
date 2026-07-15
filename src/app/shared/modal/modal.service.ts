import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalButton, ModalContentComponent } from './modal-content.component';

type DeleteCallback = (...args: unknown[]) => void;

interface ModalScope {
  title?: string;
  text?: string;
  html?: string;
  dismissable?: boolean;
  buttons?: ModalButton[];
}

/**
 * Ported from the AngularJS `Modal` factory (client/components/modal/modal.service.js).
 * Replaces `ui.bootstrap $modal` with `@ng-bootstrap/ng-bootstrap` `NgbModal`
 * while preserving the original public API shape (`confirm.delete(cb)`).
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor(private ngbModal: NgbModal) {}

  /**
   * Opens a modal populated with the given scope.
   * @param scope       - properties merged onto the modal content component
   * @param modalClass  - class(es) applied to the modal window element
   */
  private openModal(scope: ModalScope = {}, modalClass = 'modal-default'): NgbModalRef {
    const modalRef = this.ngbModal.open(ModalContentComponent, { windowClass: modalClass });
    Object.assign(modalRef.componentInstance as ModalContentComponent, scope);
    return modalRef;
  }

  /** Confirmation modals. */
  readonly confirm = {
    /**
     * Create a function to open a delete confirmation modal.
     * @param del - callback, run when delete is confirmed
     * @return    - a function `(name, ...args)` that opens the modal
     */
    delete: (del: DeleteCallback = () => {}) => {
      return (name: string, ...args: unknown[]): void => {
        const deleteModal = this.openModal(
          {
            dismissable: true,
            title: 'Confirm Delete',
            html: `<p>Are you sure you want to delete <strong>${name}</strong> ?</p>`,
            buttons: [
              { text: 'Delete', classes: 'btn-danger', confirm: true },
              { text: 'Cancel', classes: 'btn-default', confirm: false }
            ]
          },
          'modal-danger'
        );

        deleteModal.result.then(
          () => del(...args),
          () => {
            /* dismissed — no-op */
          }
        );
      };
    }
  };
}
