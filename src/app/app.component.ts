import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Edge, Node } from '@swimlane/ngx-graph';
import {  timer, Subject, Subscription, interval, of } from 'rxjs';
import { tap, take, concatMap, delay, scan } from 'rxjs/operators';

import { Board } from './astar_algorithm/Board';
import { Solver, SearchNode } from './astar_algorithm/Solver';

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

  l:Edge[];
  n:Node[];
  x:number;
  y:number;
  hm:IHash = {};
  ngAfterViewInit(){
    /*
    //visualization code
    this.subscripion.push(
      from(this.lv).pipe(
        concatMap((e:Edge)=>timer(1000).pipe(map(()=>e)))
      ).subscribe((x:Edge)=>{
        this.l.push(x);
        this.update$.next(true);
      })
    );*/
    var matrix:number[][] = [
      [1,6,2,4],
      [5,0,3,8],
      [9,10,7,11],
      [13,14,15,12]
    ];

    var b:Board = new Board(matrix);
    //newly produced
    //prospective solution(curretn min)
    var s:Solver = new Solver(b);
    var lId:number = 0;
    var alg$:Subscription = s.algorithm$
    .pipe(concatMap((i:SearchNode|SearchNode[])=>of(i).pipe(delay(1000)))).subscribe(
      (x:SearchNode|SearchNode[])=>{
        if (Array.isArray(x)){

        } else {
          if(this.n.length!= 0){
            this.hm[x.id+""] = x.board.board();
            this.n.push({id:x.id+'', label:'s'+x.id, dimension:{width:200, height:200}});
            this.update$.next(true);
            //this.zoomToFit$.next(true);
            this.l.push({
              label:"Edge"+lId,
              id:"Edge"+lId,
              source:''+x.prevNode.id,
              target:''+x.id
            });
            lId++;
          } else {
            this.hm[x.id+""] = x.board.board();
            this.n.push({id:x.id+'', label:'s', dimension:{width:200, height:200}});

          }
          this.update$.next(true);
          //this.zoomToFit$.next(true);
        }
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
interface IHash {
  [details:string]:number[][];
}
