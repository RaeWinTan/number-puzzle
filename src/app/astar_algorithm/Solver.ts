import {Board} from "./Board";
import {Stack} from "stack-typescript";
import {Subject, generate, Observable, of, throwError, iif, concat} from 'rxjs';
import {concatMap, map,  mergeMap, skip} from 'rxjs/operators';
import {
  MinPriorityQueue,
  IGetCompareValue,
} from '@datastructures-js/priority-queue';
export class SearchNode{
  id:number;
  prevNode:SearchNode;
  moveNo:number;
  board:Board;
  priority:number;
  constructor(p:SearchNode, b:Board, id:number){
    if(p == null) this.moveNo = 0;
    else this.moveNo = p.moveNo + 1;
    this.id = id;
    this.prevNode = p;
    this.board = b;
    this.priority = this.board.manhattan() + this.moveNo;
  }
}
interface RunningProgress{
  curr1:SearchNode;
  curr2:SearchNode;
  id1:number;
  id2:number;
  count:number;
}
interface RunningNode{
  curr1:SearchNode;
  id1:number;
}
export class Solver{
  public algorithm$:Observable<SearchNode|SearchNode[]>;
  constructor(initial:Board){
    const comparator:IGetCompareValue<SearchNode> = (x:SearchNode) => x.priority;
    this.algorithm$ = of([new MinPriorityQueue<SearchNode>(comparator), new MinPriorityQueue<SearchNode>(comparator)]).pipe(
      map((x:MinPriorityQueue<SearchNode>[])=>{
        x[0].enqueue(new SearchNode(null, initial, 1));
        x[1].enqueue(new SearchNode(null, initial.twin(), 1));
        return x;
      }),
      concatMap((pq:MinPriorityQueue<SearchNode>[])=>{
        //just have a coutner once it reaches 2 just exit loop
        return generate({curr1:pq[0].front(), curr2:pq[1].front(), id1:2, id2:2, count:0},
        (x:RunningProgress)=>x.count <  1,
        (x:RunningProgress) =>{
            if (x.count == 1) return {curr1: null, curr2:null, id1:0, id2:0, count:2};
            if (x.curr1.board.isGoal() || x.curr2.board.isGoal()) return {curr1:x.curr1, curr2:x.curr2, id1:0, id2:0, count:1};
            var tmpId1:number = x.id1;
            var tmpId2:number = x.id2;
            var curr1: SearchNode = pq[0].dequeue();
            var curr2: SearchNode = pq[1].dequeue();
            for (var i of curr1.board.neighbors()){
              if (curr1.prevNode == null || !i.equals(curr1.prevNode.board)){
                var sd:SearchNode = new SearchNode(curr1, i, ++tmpId1);
                pq[0].enqueue(sd);
              }
            }
            for (var i of curr2.board.neighbors()){
              if (curr2.prevNode == null || !i.equals(curr2.prevNode.board)){
                var sd:SearchNode = new SearchNode(curr2, i, ++tmpId2);
                pq[1].enqueue(sd);
              }
            }
            return {curr1:curr1, curr2:curr2, id1:tmpId1, id2:tmpId2, count:0};
        }).pipe(
          skip(1),
          mergeMap((v:RunningProgress)=>{
            if (!v.curr2.board.isGoal()){
              if(v.curr1.board.isGoal()){
                //solusiont
                var tmpStep:Stack<SearchNode> = new Stack<SearchNode>();
                var node:SearchNode = v.curr1;
                var solution:SearchNode[] = [];
                do {
                  tmpStep.push(node);
                  node = node.prevNode;
                } while(node!=null && node.prevNode!=null);
                while(tmpStep.size != 0) solution.push(tmpStep.pop());
                return concat(of(v).pipe(map((s:RunningProgress)=>v.curr1)), of(solution));
              }
              return of(v).pipe(map((s:RunningProgress)=>s.curr1));
            }
            else{
              return throwError("UNSOLVABLE");
            }
          })
        );
      })
    );
  }
}
