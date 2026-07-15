import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

/**
 * Thin, globally reusable utility functions.
 * Ported from the AngularJS `Util` factory (client/components/util/util.service.js).
 */
@Injectable({ providedIn: 'root' })
export class UtilService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Return the provided callback if it is a function, otherwise a no-op.
   */
  safeCb<T extends (...args: never[]) => unknown>(cb: T | undefined | null): T | (() => void) {
    return typeof cb === 'function' ? cb : () => {};
  }

  /**
   * Parse a given url with the use of an anchor element.
   */
  urlParse(url: string): HTMLAnchorElement {
    const a = this.document.createElement('a');
    a.href = url;
    return a;
  }

  /**
   * Test whether or not a given url is same origin.
   *
   * @param url     - url to test
   * @param origins - additional origin(s) to test against
   */
  isSameOrigin(url: string, origins?: string | string[]): boolean {
    const parsedUrl = this.urlParse(url);
    const extra = origins ? ([] as string[]).concat(origins) : [];
    const parsedOrigins: Array<HTMLAnchorElement | Location> = extra.map((o) => this.urlParse(o));

    const location = this.document.defaultView?.location ?? this.document.location;
    parsedOrigins.push(location);

    return parsedOrigins.some(
      (o) =>
        parsedUrl.hostname === o.hostname &&
        parsedUrl.port === o.port &&
        parsedUrl.protocol === o.protocol
    );
  }
}
