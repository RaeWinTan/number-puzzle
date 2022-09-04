import {EventEmitter,Output, ViewChild,ElementRef,AfterViewInit , Component, OnDestroy} from '@angular/core';
import { fromEvent, Observable, Subscription} from 'rxjs';
import {
  filter,
  tap,
  switchMap,
  map,
  scan,
} from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
@Component({
  selector: 'app-board-input',
  templateUrl: './board-input.component.html',
  styleUrls: ['./board-input.component.css']
})

export class BoardInputComponent implements AfterViewInit, OnDestroy{
  cx: CanvasRenderingContext2D;
  matrix:number[][];
  errors:Set<string>;
  subscription:Subscription[];
  readonly n:number = 4;
  readonly cellSide:number = 50;

  @Output() inputBoard = new EventEmitter<number[][]>();
  @ViewChild("inputId", {static:false}) myCanvas: ElementRef;
  @ViewChild("rdmBtn", {static:false}) rdmBtn: ElementRef;
  constructor(private httpClient:HttpClient) {
    this.subscription = [];
    this.errors = new Set<string>();
    this.matrix = [];
    for(var r = 0; r < this.n; r++){
      this.matrix.push([]);
      for(var c = 0; c < this.n; c++){
        this.matrix[r].push(null);
      }
    }
  }

  drawBorder(){
    this.cx.strokeStyle = "black";
    this.cx.lineWidth = 1;
    for(let i=1; i<4; i++){
        this.cx.moveTo(i*this.cellSide, 0);
        this.cx.lineTo(i*this.cellSide, this.cellSide*this.n);
        this.cx.stroke();
    }
    for(let i=1; i<this.n; i++){
        this.cx.moveTo(0 , i*this.cellSide);
        this.cx.lineTo(this.cellSide*this.n, i * this.cellSide);
        this.cx.stroke();
    }
  }
  ngAfterViewInit(){
    //initialing canvas drawing material
    const canvasEl: HTMLCanvasElement = this.myCanvas.nativeElement;
    this.cx = canvasEl.getContext('2d');
    this.myCanvas.nativeElement.width = this.n * this.cellSide;
    this.myCanvas.nativeElement.height = this.n * this.cellSide;
    this.drawBorder();
    const keyUp$:Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document, 'keyup');
    //observable to fill up grid
    const fillBox$=(acc:any):Observable<KeyboardEvent>=>keyUp$.pipe(
        //only read number inputs from user
        filter((k:KeyboardEvent)=>Number(k.key)==0 || !!Number(k.key)),
        tap((k:KeyboardEvent)=>{
          //writing number on canvas
          if(this.matrix[acc.y][acc.x] == 0 || !this.matrix[acc.y][acc.x]){//first number on cell
            this.erase(acc);
            this.write(k.key, acc);
            this.shade(acc.x, acc.y);
            this.matrix[acc.y][acc.x] = Number(k.key);
          } else{
            //subsequent numbesr on cells
            if (this.matrix[acc.y][acc.x] > 0 && this.matrix[acc.y][acc.x] < 10){
              this.erase(acc);
              this.matrix[acc.y][acc.x] *= 10;
              this.matrix[acc.y][acc.x] += Number(k.key);
              this.write(''+this.matrix[acc.y][acc.x], acc);
              this.shade(acc.x, acc.y);
            } else {
              this.erase(acc);
              this.write(k.key, acc);
              this.shade(acc.x, acc.y);
              this.matrix[acc.y][acc.x] = Number(k.key);
            }
          }
        })
      );
    const mouseDown$ = fromEvent(this.myCanvas.nativeElement, 'mousedown');
    this.subscription.push(
      mouseDown$.pipe(
          map((e: MouseEvent) => {
            return {
              x: Math.floor(e.offsetX / 50),
              y: Math.floor(e.offsetY / 50),
            };
          }),
          scan((acc: any, e: any) => {
            //remove the light blue shade from the previously clicked cell
            this.erase(acc);
            if(!!this.matrix[acc.y][acc.x] || this.matrix[acc.y][acc.x] == 0) this.write(this.matrix[acc.y][acc.x]+'', acc);
            acc = e;
            return e;
          }),
          tap((e: any) => {
            //shade light blue for grid cell user is currently working on
            var x: number = e.x;
            var y: number = e.y;
            this.shade(x, y);
            this.checkFillBoard();
          }),
          switchMap((e:KeyboardEvent)=>fillBox$(e))
      ).subscribe()
    );
    this.subscription.push(
      fromEvent(this.rdmBtn.nativeElement, "click").pipe(
        switchMap(()=>{
          var num = (Math.floor(Math.random() * 20) + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
          //getting random unsolved puzzles from asset folder
          return this.httpClient.get(`assets/puzzle4x4-${num}.txt`, {responseType: 'text'}).pipe(
            tap((data:string)=>{
              //parsing txt file to matrix form
              var d:any = data.trim().split('\n').splice(1).map(l=>l.trim().split(/\s+/));
              for(var r = 0; r<this.n; r++){
                for(var c = 0; c < this.n; c++){
                  //drawing matrix to grid
                  this.matrix[r][c] = Number(d[r][c]);
                  this.erase({x:c, y:r});
                  this.write(d[r][c], {x:c, y:r});
                }
              }
            })
          );
        })
      ).subscribe()
    );
  }
  ngOnDestroy(){//destroy subscriptions
    for(const sub of this.subscription){
      sub.unsubscribe();
    }
    this.subscription = null;
  }
  start(){
    if (this.checkFillBoard()){
      this.inputBoard.emit(this.matrix);
    }
  }
  //validate the board, pretty self explainitory since error messages in string form
  checkFillBoard():boolean{
    let nums = new Set<number>();
    let es = new Set<string>();
    var ans:boolean = true;
    for (var r = 0; r < this.n; r++){
      for (var c = 0; c < this.n; c++){
        if (!!this.matrix[r][c] || this.matrix[r][c] == 0){
          if (this.matrix[r][c] > 15){
            es.add("numbers must be between 0-15 only");
            ans = false;
          }
          else if(nums.has(this.matrix[r][c])){
            es.add("no duplicate numbers allowed");
            ans = false;
          }
          nums.add(this.matrix[r][c]);
        }else{
          es.add("all boxes must be filled");
          ans = false;
        }
      }
    }
    this.errors = es;
    return ans;
  }
  write(k:string, acc:any){
    this.cx.font = '40px san-serif';
    this.cx.textAlign = 'start';
    this.cx.textBaseline = 'ideographic';
    this.cx.fillText(k, acc.x * 50, (acc.y + 1) * 50);
  }
  erase(acc:any){
    this.cx.clearRect(acc.x*this.cellSide+1,acc.y*this.cellSide+1, this.cellSide-2, this.cellSide-2);
  }
  shade(x:number, y:number){
    this.cx.globalAlpha = 0.2;
    this.cx.fillStyle = '#33FFD0';
    this.cx.fillRect(
      x * this.cellSide + 1,
      y * this.cellSide+1,
      this.cellSide-2,
      this.cellSide-2
    );
    //set context back to usual settings
    this.cx.globalAlpha = 1;
    this.cx.fillStyle = 'black';
  }
}
