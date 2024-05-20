import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, interval, switchMap, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService implements OnDestroy{

  private stop$ = new Subject<void>();
  private statusUpdate$ = new Subject<string>();

  constructor(private http: HttpClient,private settingsService: SettingsService) { }

  startBackgroundProcess() {
    interval(3000) // Adjust the interval as per your requirements
      .pipe(
        takeUntil(this.stop$)
      )
      .subscribe(() => {
        this.checkValue();
      });
  }

  checkValue() {
    this.settingsService.statusOfReq().subscribe(
      response => {
        if (response === true) {
          this.statusUpdate$.next('accepted');
          this.ngOnDestroy();
        }
      }
    )
  }

  subscribeToStatusUpdate() {
    return this.statusUpdate$.asObservable();
  }

  ngOnDestroy() {
    this.stop$.next();
    this.stop$.complete();
  }
}
