import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Edge, Node, MiniMapPosition } from '@swimlane/ngx-graph';
import { Subject, Subscription,  of, Observable } from 'rxjs';
import { tap,  concatMap, delay , scan, switchMap} from 'rxjs/operators';

import { Board } from './astar_algorithm/Board';
import { Solver, SearchNode, usrRtn } from './astar_algorithm/Solver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit, OnDestroy{
  title = 'number-puzzle';
  update$: Subject<boolean> = new Subject();
  zoomToFit$:Subject<boolean> = new Subject();
  matrix$:Subject<number[][]> = new Subject<number[][]>();
  subscripion: Subscription[];
  pos:MiniMapPosition = MiniMapPosition.UpperLeft;
  l:Edge[];
  n:Node[];
  hm:Map<string, BoardColor> = new Map<string, BoardColor>();
  private addN(id:number){
    if(!this.hm.has(id+'')){
      this.n.push({id:id+'', label:'s', dimension:{width:200, height:200}});
    }
  }
  ngAfterViewInit(){
    var green:string = "#75FF33";
    var yellow = "#FFB633";
    var grey = "#808080";
    var orange = "#E77500";


    var alg$:Observable<any> = this.matrix$.pipe(
      tap(()=>{
        this.hm = new Map<string, BoardColor>();
        this.l = [];
        this.n = [];
      }),
      switchMap((m:number[][])=>{
      var b:Board = new Board(m);
      var s:Solver = new Solver(b);
      var lId:number = 0;
      return s.algorithm$
      .pipe(
        concatMap(
          (i:usrRtn|SearchNode[])=>
            of(i).pipe(
              delay(250)
            )
        ),
        tap((x:usrRtn|SearchNode[])=>{
          if (!Array.isArray(x)){
            if(this.n.length!= 0){
              this.addN(x.sn.id);
              this.hm.set(x.sn.id+"", {color: orange, board:x.sn.board.board()});
            } else {
              this.addN(x.sn.id);
              this.hm.set(x.sn.id+"", {color:orange, board:x.sn.board.board()});
            }
            for(var i of x.posibleNodes){
              console.log(i.priority, i.moveNo);
              this.l.push({
                label:""+i.priority,
                id:"Edge"+ ++lId,
                source:''+i.prevNode.id,
                target:''+i.id
              });
            }
            for(var i of x.posibleNodes){
              this.addN(i.id);
              this.hm.set(i.id+"", {color:yellow, board:i.board.board()});
            }
            this.update$.next(true);
            this.zoomToFit$.next(true);
          }else{
            for(var node of x){
              this.hm.set(node.id+"", {board:this.hm.get(node.id+"").board, color:green});
            }
          }
        }),
        scan((acc:usrRtn|SearchNode[],x:usrRtn|SearchNode[])=>{
          if (!Array.isArray(x)){
            this.hm.set((acc as usrRtn).sn.id+"", {color:grey, board:(acc as usrRtn).sn.board.board()});
          }
          acc = x;
          return x;
        })
      );
    }));
    this.subscripion.push(
      alg$.subscribe(()=>{},(err:any)=>{
        console.log(err);
      })
    );
  }
  setBoard(matrix:number[][]){
    this.matrix$.next(matrix);
  }
  ngOnDestroy(){
    for(const sub of this.subscripion){
      sub.unsubscribe();
    }
    this.subscripion = null;
  }
  constructor(){
    this.l = [];
    this.n = [];
    this.subscripion = [];
  }
}

interface BoardColor{
  board:number[][];
  color:string;
}
