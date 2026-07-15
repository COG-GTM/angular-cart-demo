import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentComponent } from './modal-content.component';

describe('ModalContentComponent', () => {
  let activeModalSpy: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    activeModalSpy = jasmine.createSpyObj<NgbActiveModal>('NgbActiveModal', ['close', 'dismiss']);
    await TestBed.configureTestingModule({
      imports: [ModalContentComponent],
      providers: [{ provide: NgbActiveModal, useValue: activeModalSpy }]
    }).compileComponents();
  });

  it('closes the modal for a confirm button', () => {
    const fixture = TestBed.createComponent(ModalContentComponent);
    fixture.componentInstance.onButtonClick({ text: 'Delete', classes: 'btn-danger', confirm: true });
    expect(activeModalSpy.close).toHaveBeenCalled();
    expect(activeModalSpy.dismiss).not.toHaveBeenCalled();
  });

  it('dismisses the modal for a non-confirm button', () => {
    const fixture = TestBed.createComponent(ModalContentComponent);
    fixture.componentInstance.onButtonClick({ text: 'Cancel', classes: 'btn-default', confirm: false });
    expect(activeModalSpy.dismiss).toHaveBeenCalled();
    expect(activeModalSpy.close).not.toHaveBeenCalled();
  });

  it('renders the title and buttons', () => {
    const fixture = TestBed.createComponent(ModalContentComponent);
    fixture.componentInstance.title = 'Confirm Delete';
    fixture.componentInstance.buttons = [
      { text: 'Delete', classes: 'btn-danger', confirm: true },
      { text: 'Cancel', classes: 'btn-default', confirm: false }
    ];
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.modal-title')?.textContent?.trim()).toBe('Confirm Delete');
    expect(el.querySelectorAll('.modal-footer .btn').length).toBe(2);
  });
});
