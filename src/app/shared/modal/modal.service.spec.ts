import { TestBed } from '@angular/core/testing';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentComponent } from './modal-content.component';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;
  let ngbModalSpy: jasmine.SpyObj<NgbModal>;
  let modalRef: { componentInstance: Record<string, unknown>; result: Promise<unknown> };
  let resolveResult: (value?: unknown) => void;
  let rejectResult: (reason?: unknown) => void;

  beforeEach(() => {
    modalRef = {
      componentInstance: {},
      result: new Promise((resolve, reject) => {
        resolveResult = resolve;
        rejectResult = reject;
      })
    };
    ngbModalSpy = jasmine.createSpyObj<NgbModal>('NgbModal', ['open']);
    ngbModalSpy.open.and.returnValue(modalRef as unknown as NgbModalRef);

    TestBed.configureTestingModule({
      providers: [ModalService, { provide: NgbModal, useValue: ngbModalSpy }]
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('exposes a confirm.delete factory returning a function', () => {
    const opener = service.confirm.delete(() => {});
    expect(typeof opener).toBe('function');
  });

  it('opens a danger modal with the ModalContentComponent and delete config', () => {
    service.confirm.delete()('Shirt');

    expect(ngbModalSpy.open).toHaveBeenCalledTimes(1);
    const [component, options] = ngbModalSpy.open.calls.mostRecent().args;
    expect(component).toBe(ModalContentComponent);
    expect(options).toEqual(jasmine.objectContaining({ windowClass: 'modal-danger' }));

    const instance = modalRef.componentInstance;
    expect(instance['title']).toBe('Confirm Delete');
    expect(instance['html']).toContain('Shirt');
    const buttons = instance['buttons'] as Array<{ text: string; confirm: boolean }>;
    expect(buttons.map((b) => b.text)).toEqual(['Delete', 'Cancel']);
    expect(buttons.find((b) => b.text === 'Delete')?.confirm).toBe(true);
  });

  it('invokes the callback with extra args when confirmed', async () => {
    const del = jasmine.createSpy('del');
    service.confirm.delete(del)('Shirt', 1, 'two');

    resolveResult();
    await modalRef.result;

    expect(del).toHaveBeenCalledWith(1, 'two');
  });

  it('does not invoke the callback when dismissed', async () => {
    const del = jasmine.createSpy('del');
    service.confirm.delete(del)('Shirt');

    rejectResult();
    try {
      await modalRef.result;
    } catch {
      /* expected dismissal */
    }

    expect(del).not.toHaveBeenCalled();
  });
});
