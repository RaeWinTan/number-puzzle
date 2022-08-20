import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Edge, Node, MiniMapPosition } from '@swimlane/ngx-graph';
import {  timer, Subject, Subscription, interval, of } from 'rxjs';
import { tap, take, concatMap, delay , scan} from 'rxjs/operators';

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
  subscripion: Subscription[];
  pos:MiniMapPosition = MiniMapPosition.UpperLeft;
  l:Edge[];
  n:Node[];
  x:number;
  y:number;
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
    var matrix:number[][] = [
      [1,2,4,12],
      [5,6,3,0],
      [9,10,8,7],
      [13,14,11,15]
    ];

    var b:Board = new Board(matrix);
    //newly produced
    //prospective solution(curretn min)
    var s:Solver = new Solver(b);
    var lId:number = 0;
    var alg$:Subscription = s.algorithm$
    .pipe(
      concatMap(
        (i:usrRtn|SearchNode[])=>
          of(i).pipe(
            delay(1000)
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
            this.l.push({
              label:""+i.priority,
              id:"Edge"+ ++lId,
              source:''+i.prevNode.id,//x.prevNode.id
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
    ).subscribe(
      (x:usrRtn|SearchNode[])=>{
      },()=>{},()=>{

      }
    );
    this.subscripion.push(
      alg$
    )


  }
  ngOnDestroy(){
    for(const sub of this.subscripion){
      sub.unsubscribe();
    }
    this.subscripion = null;
  }
  constructor(){
    this.x = 0;
    this.y = 0;

    this.l = [];
    this.n = [

    ];
    this.subscripion = [];
  }
}

interface BoardColor{
  board:number[][];
  color:string;
}
