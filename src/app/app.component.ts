import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Edge, Node } from '@swimlane/ngx-graph';
import {  timer, Subject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  subscripion: Subscription[];
  lv:Edge[] = [
    {
      id: 'a',
      source: '1',
      target: '2'
    }, {
      id: 'b',
      source: '1',
      target: '3'
    }, {
      id: 'c',
      source: '3',
      target: '4'
    }, {
      id: 'd',
      source: '3',
      target: '5'
    }, {
      id: 'e',
      source: '4',
      target: '5'
    }, {
      id: 'f',
      source: '2',
      target: '6'
    }
  ]; //testing
  l:Edge[];
  n:Node[];
  ngAfterViewInit(){
    /*
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

    var processing$:Subject<SearchNode> = new Subject<SearchNode>();
    var s:Solver = new Solver(b, processing$);
    for (var x of s.solution()) console.log(x.toString());

  }
  ngOnDestroy(){
    for(const sub of this.subscripion){
      sub.unsubscribe();
    }
    this.subscripion = [];
  }
  constructor(){
    this.l = [];
    this.n = [
      {
        id: '1',
        label: `Node A`
      }, {
        id: '2',
        label: 'Node B'
      }, {
        id: '3',
        label: 'Node C'
      }, {
        id: '4',
        label: 'Node D'
      }, {
        id: '5',
        label: 'Node E'
      }, {
        id: '6',
        label: 'Node F'
      }
    ];
    this.subscripion = [];
  }
}
