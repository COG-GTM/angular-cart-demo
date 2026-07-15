import { Injectable } from '@angular/core';
import type { Socket } from 'socket.io-client/dist/socket.io.js';

/** Any model that can be live-synced must be identified by `_id`. */
export interface SyncItem {
  _id: string;
}

export type SyncEvent = 'created' | 'updated' | 'deleted';

export type SyncCallback<T extends SyncItem> = (
  event: SyncEvent,
  item: T,
  array: T[]
) => void;

/**
 * Angular port of the AngularJS `socket` factory (btford.socket-io helper).
 * Wraps `socket.io-client`, connecting with `path: '/socket.io-client'` to match
 * the server, and keeps an in-memory array in sync with `model:save` /
 * `model:remove` events.
 *
 * The client library is loaded lazily so the (large, Node-tainted) bundle is only
 * pulled in when the socket is actually used.
 */
@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly socket: Promise<Socket> = this.connect();

  private async connect(): Promise<Socket> {
    const { default: io } = await import('socket.io-client/dist/socket.io.js');
    return io('', { path: '/socket.io-client' });
  }

  /**
   * Register listeners to sync an array with updates on a model.
   *
   * @param modelName the model the socket updates are sent from
   * @param array the array to keep in sync (mutated in place)
   * @param cb optional callback invoked after each create/update/remove
   */
  syncUpdates<T extends SyncItem>(
    modelName: string,
    array: T[],
    cb?: SyncCallback<T>
  ): void {
    const callback: SyncCallback<T> = cb ?? (() => undefined);

    void this.socket.then((socket) => {
      // Syncs item creation/updates on 'model:save'
      socket.on(`${modelName}:save`, (data: unknown) => {
        const item = data as T;
        const oldItem = array.find((entry) => entry._id === item._id);
        let event: SyncEvent = 'created';

        if (oldItem) {
          array.splice(array.indexOf(oldItem), 1, item);
          event = 'updated';
        } else {
          array.push(item);
        }

        callback(event, item, array);
      });

      // Syncs removed items on 'model:remove'
      socket.on(`${modelName}:remove`, (data: unknown) => {
        const item = data as T;
        const index = array.findIndex((entry) => entry._id === item._id);
        if (index !== -1) {
          array.splice(index, 1);
        }
        callback('deleted', item, array);
      });
    });
  }

  /** Removes the listeners registered for a model's updates on the socket. */
  unsyncUpdates(modelName: string): void {
    void this.socket.then((socket) => {
      socket.removeAllListeners(`${modelName}:save`);
      socket.removeAllListeners(`${modelName}:remove`);
    });
  }
}
