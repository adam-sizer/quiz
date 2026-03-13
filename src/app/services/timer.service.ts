import { Injectable } from '@angular/core';
import { Observable, timer, map, takeWhile, endWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService {
  countdown(seconds: number): Observable<number> {
    return timer(0, 1000).pipe(
      map((tick) => seconds - tick),
      takeWhile((remaining) => remaining > 0),
      endWith(0),
    );
  }
}
