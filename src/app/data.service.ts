import { Injectable } from '@angular/core';
import {
  ref,
  push,
  remove,
  get,
  update,
} from 'firebase/database';
import { database } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  savePoint(point: { name: string; coordinates: string }) {
    const pointsRef = ref(database, 'points');
    return push(pointsRef, point);
  }

  getPoints() {
    const pointsRef = ref(database, 'points');
    return get(pointsRef).then(snapshot => snapshot.val());
  }

  async getPoint(key: string): Promise<{ name: string; coordinates: string } | null> {
    const pointRef = ref(database, `points/${key}`);
    const snapshot = await get(pointRef);
    return snapshot.val();
  }

  updatePoint(key: string, point: { name: string; coordinates: string }) {
    const pointRef = ref(database, `points/${key}`);
    return update(pointRef, point);
  }

  deletePoint(key: string) {
    const pointRef = ref(database, `points/${key}`);
    return remove(pointRef);
  }
}
