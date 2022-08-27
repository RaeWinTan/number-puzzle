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
export interface usrRtn{
  sn:SearchNode;
  posibleNodes:SearchNode[];
}
interface RunningProgress{
  curr1:SearchNode;
  curr2:SearchNode;
  id1:number;
  id2:number;
  count:number;
  posibleNodes:SearchNode[];
}
interface RunningNode{
  curr1:SearchNode;
  id1:number;
}

export class Solver{
  public algorithm$:Observable<SearchNode|SearchNode[]|usrRtn>;
  constructor(initial:Board){
    //set comparable for the search node
    const comparator:IGetCompareValue<SearchNode> = (x:SearchNode) => x.priority;
    this.algorithm$ = of([new MinPriorityQueue<SearchNode>(comparator), new MinPriorityQueue<SearchNode>(comparator)]).pipe(
      map((x:MinPriorityQueue<SearchNode>[])=>{
        //initialize priority queue to start algorithm
        x[0].enqueue(new SearchNode(null, initial, 1));
        x[1].enqueue(new SearchNode(null, initial.twin(), 1));
        return x;
      }),
      concatMap((pq:MinPriorityQueue<SearchNode>[])=>{
        //just have a coutner once it reaches 2 just exit loop
        //counter is a fix so as to not skip the last searchnode of the solution
        //generate is basiclally a while loop which continues till solution is found
        return generate({curr1:pq[0].front(), curr2:pq[1].front(), id1:2, id2:2, count:0,posibleNodes:[]},
        (x:RunningProgress)=>x.count <  1,
        (x:RunningProgress) =>{
            if (x.count == 1) return {curr1: null, curr2:null, id1:0, id2:0, count:2,posibleNodes:[]};
            if (x.curr1.board.isGoal() || x.curr2.board.isGoal()) return {curr1:x.curr1, curr2:x.curr2, id1:0, id2:0, count:1,posibleNodes:[]};
            var tmpId1:number = x.id1;
            var tmpId2:number = x.id2;
            //removing current searchNodes
            var curr1: SearchNode = pq[0].dequeue();
            var curr2: SearchNode = pq[1].dequeue();
            var posible: SearchNode[] = [];
            //solving the two different boards to determine if board is solvable
            for (var i of curr1.board.neighbors()){
              //optimization step is to not include previous board to the priority queue
              if (curr1.prevNode == null || !i.equals(curr1.prevNode.board)){
                //pushing prospective searchnode to the priority queue
                var sd:SearchNode = new SearchNode(curr1, i, ++tmpId1);
                pq[0].enqueue(sd);
                posible.push(sd);
              }
            }
            for (var i of curr2.board.neighbors()){
              if (curr2.prevNode == null || !i.equals(curr2.prevNode.board)){
                var sd:SearchNode = new SearchNode(curr2, i, ++tmpId2);
                pq[1].enqueue(sd);
              }
            }
            return {curr1:curr1, curr2:curr2, id1:tmpId1, id2:tmpId2, count:0,posibleNodes:posible};
        }).pipe(
          skip(1),//can ignore the initialized node, it will come out a step later
          mergeMap((v:RunningProgress)=>{
            if (!v.curr2.board.isGoal()){
              if(v.curr1.board.isGoal()){
                //generateing the solution array
                var tmpStep:Stack<SearchNode> = new Stack<SearchNode>();
                var node:SearchNode = v.curr1;
                var solution:SearchNode[] = [];
                do {
                  tmpStep.push(node);
                  node = node.prevNode;
                } while(node!=null);
                while(tmpStep.size != 0) solution.push(tmpStep.pop());
                return concat(of(v).pipe(map((s:RunningProgress)=>{
                  return {sn:s.curr1, posibleNodes:[]};
                })), of(solution));
              }
              return of(v).pipe(map((s:RunningProgress)=>{
                return {sn:s.curr1, posibleNodes:s.posibleNodes};
              }));
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
