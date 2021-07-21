import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { CallService } from './call.service';
import {
  CallInfoDialogComponents,
  DialogData,
} from './dialog/callinfo-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  public isCallStarted$: Observable<boolean>;
  private peerId: string;

  @ViewChild('localVideo') localVideo: any;
  @ViewChild('remoteVideo') remoteVideo: any;

  constructor(public dialog: MatDialog, private callService: CallService) {
    this.isCallStarted$ = this.callService.isCallStarted$;
    this.peerId = this.callService.initPeer();
  }

  ngOnInit(): void {
    this.callService.localStream$
      .pipe(filter((res) => !!res))
      .subscribe(
        (stream: any) => (this.localVideo.nativeElement.srcObject = stream)
      );
    this.callService.remoteStream$
      .pipe(filter((res) => !!res))
      .subscribe(
        (stream: any) => (this.remoteVideo.nativeElement.srcObject = stream)
      );
  }

  ngOnDestroy(): void {
    this.callService.destroyPeer();
  }

  public showModal(joinCall: boolean): void {
    let dialogData: any = joinCall
      ? { peerId: null, joinCall: true }
      : { peerId: this.peerId, joinCall: false };
    const dialogRef = this.dialog.open(CallInfoDialogComponents, {
      width: '250px',
      data: dialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((peerId) => {
          if (joinCall) {
            console.log(peerId);
            return of(this.callService.establishMediaCall(peerId));
          } else {
            console.log('enableCallAnswer');
            return of(this.callService.enableCallAnswer());
          }
        })
      )
      .subscribe((_) => {});
  }

  public endCall() {
    this.callService.closeMediaCall();
  }
}
