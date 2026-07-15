import { TestBed } from '@angular/core/testing';
import { UtilService } from './util.service';

describe('UtilService', () => {
  let service: UtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('safeCb', () => {
    it('returns the callback when given a function', () => {
      const cb = () => 42;
      expect(service.safeCb(cb)).toBe(cb);
    });

    it('returns a no-op when given a non-function', () => {
      const result = service.safeCb(undefined);
      expect(typeof result).toBe('function');
      expect(result()).toBeUndefined();
    });
  });

  describe('urlParse', () => {
    it('parses a url into an anchor element', () => {
      const a = service.urlParse('https://example.com:8080/path?q=1');
      expect(a.hostname).toBe('example.com');
      expect(a.port).toBe('8080');
      expect(a.protocol).toBe('https:');
    });
  });

  describe('isSameOrigin', () => {
    it('returns true for a same-origin url', () => {
      const sameOrigin = `${location.protocol}//${location.host}/some/path`;
      expect(service.isSameOrigin(sameOrigin)).toBe(true);
    });

    it('returns false for a different-origin url', () => {
      expect(service.isSameOrigin('https://not-the-same-origin.example.com:1234/x')).toBe(false);
    });

    it('returns true when the url matches an extra allowed origin', () => {
      expect(
        service.isSameOrigin('https://allowed.example.com/a', 'https://allowed.example.com/b')
      ).toBe(true);
    });
  });
});
