import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Edge, Node, MiniMapPosition } from '@swimlane/ngx-graph';
import { Subject, Subscription,  of, Observable } from 'rxjs';
import { tap,  concatMap, delay , scan, switchMap, catchError} from 'rxjs/operators';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';

import { Board } from './astar_algorithm/Board';
import { Solver, SearchNode, usrRtn } from './astar_algorithm/Solver';

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title text-danger">ERROR</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <p>Puzzle is unsolvable</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `
})
export class NgbdModalContent {

  constructor(public activeModal: NgbActiveModal) {}
}

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
  speed:number;
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


    var alg$:Observable<any> = this.matrix$.pipe(//get board matrix from board-input component
      tap(()=>{
        //initializing data for ngx-graph
        this.hm = new Map<string, BoardColor>();
        this.l = [];
        this.n = [];
      }),
      switchMap((m:number[][])=>{
        //running solver algorithm
      var b:Board = new Board(m);
      var s:Solver = new Solver(b);
      var lId:number = 0;
      return s.algorithm$
      .pipe(
        concatMap(
          (i:usrRtn|SearchNode[])=>
            of(i).pipe(
              delay((10-this.speed  +1)* 100)//step through each step of algorithm slowly
            )
        ),
        tap((x:usrRtn|SearchNode[])=>{
          if (!Array.isArray(x)){//while have not reach solution

            //adding/colouring current node algorithm is on
            if(this.n.length!= 0){
              this.addN(x.sn.id);
              this.hm.set(x.sn.id+"", {color: orange, board:x.sn.board.board()});
            } else {
              this.addN(x.sn.id);
              this.hm.set(x.sn.id+"", {color:orange, board:x.sn.board.board()});
            }
            //drawing the edges to the posible nodes from current node
            for(var i of x.posibleNodes){
              this.l.push({
                label:""+i.priority,
                id:"Edge"+ ++lId,
                source:''+i.prevNode.id,
                target:''+i.id
              });
            }
            for(var i of x.posibleNodes){
              //drawing posible nodes
              this.addN(i.id);
              this.hm.set(i.id+"", {color:yellow, board:i.board.board()});
            }
            this.update$.next(true);
            this.zoomToFit$.next(true);
          }else{
            for(var node of x){//colour solution path green
              this.hm.set(node.id+"", {board:this.hm.get(node.id+"").board, color:green});
            }
          }
        }),
        scan((acc:usrRtn|SearchNode[],x:usrRtn|SearchNode[])=>{
          if (!Array.isArray(x)){
            //colour previous node grey (show path taken)
            this.hm.set((acc as usrRtn).sn.id+"", {color:grey, board:(acc as usrRtn).sn.board.board()});
          }
          acc = x;//setting the accumulater of this Observable to the previous node
          return x;
        }),
        catchError((val)=>{//unsolvable puzzle
          this.modalService.open(NgbdModalContent);
          return of({});
        })
      );
    }));
    this.subscripion.push(
      alg$.subscribe()
    );
  }
  setBoard(matrix:number[][]){//recever board matrix from board-input component
    this.matrix$.next(matrix);
  }
  ngOnDestroy(){//unsubscribe from all subscriptiong
    for(const sub of this.subscripion){
      sub.unsubscribe();
    }
    this.subscripion = null;
  }
  constructor(private modalService: NgbModal){
    this.l = [];
    this.n = [];
    this.subscripion = [];
    this.speed = 1;
  }
}

interface BoardColor{
  board:number[][];
  color:string;
}
