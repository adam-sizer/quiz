import { Component, input, output, OnInit, OnDestroy, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { TimerService } from '../services/timer.service';

@Component({
  selector: 'app-countdown-timer',
  template: `
    <div class="timer-container">
      <div class="timer-bar">
        <div class="timer-fill" [style.width.%]="percentage()"></div>
      </div>
      <div class="timer-text">{{ remaining() }}s</div>
    </div>
  `,
  styles: `
    .timer-container {
      width: 100%;
      text-align: center;
    }
    .timer-bar {
      width: 100%;
      height: 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      overflow: hidden;
    }
    .timer-fill {
      height: 100%;
      background: linear-gradient(90deg, #e21b3c, #ff6b35);
      border-radius: 6px;
      transition: width 1s linear;
    }
    .timer-text {
      font-size: 2rem;
      font-weight: bold;
      margin-top: 0.5rem;
    }
  `,
})
export class CountdownTimer implements OnInit, OnDestroy {
  seconds = input.required<number>();
  expired = output<void>();

  remaining = signal(0);
  percentage = signal(100);

  private sub?: Subscription;

  constructor(private timerService: TimerService) {}

  ngOnInit(): void {
    const total = this.seconds();
    this.remaining.set(total);
    this.percentage.set(100);

    this.sub = this.timerService.countdown(total).subscribe({
      next: (val) => {
        this.remaining.set(val);
        this.percentage.set((val / total) * 100);
      },
      complete: () => {
        this.expired.emit();
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
