import {Board} from "./Board";
import {Stack} from "stack-typescript";
import { from, timer, Subject} from 'rxjs';
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
export class Solver{
  private solved:boolean;
  private ms:number;
  private steps:Stack<Board>;

  constructor(initial:Board, processing$:Subject<SearchNode>){
    this.ms = 0;
    this.solved = false;
    this.steps = new Stack<Board>();
    const comparator:IGetCompareValue<SearchNode> = (x:SearchNode) => x.priority;
    var pq1 = new MinPriorityQueue<SearchNode>(comparator);
    var pq2 = new MinPriorityQueue<SearchNode>(comparator);
    var sn:SearchNode = new SearchNode(null, initial, 1);
    var id:number = 1;
    pq1.enqueue(sn);
    pq2.enqueue(new SearchNode(null, initial.twin(), 1));
    while (true) {
      var curr1:SearchNode = pq1.dequeue();
      var curr2:SearchNode = pq2.dequeue();
      if (curr1.board.isGoal()) {
          this.solved = true;
          this.ms = curr1.moveNo;
          do {
              this.steps.push(curr1.board);
              curr1 = curr1.prevNode;
          } while (curr1 != null && curr1.prevNode != null);
          if (curr1 != null) this.steps.push(curr1.board);
          break;
      }
      if (curr2.board.isGoal()) {
          this.solved = false;
          this.ms = -1;
          break;
      }
      id++;
      for (var i of curr1.board.neighbors()){
        if (curr1.prevNode == null || !i.equals(curr1.prevNode.board)){
          var sd:SearchNode = new SearchNode(curr1, i, id);
          pq1.enqueue(sd);
          processing$.next(sd);
        }
      }
      for (var i of curr2.board.neighbors()){
        if (curr2.prevNode == null || !i.equals(curr2.prevNode.board)){
          var sd:SearchNode = new SearchNode(curr2, i, id);
          pq2.enqueue(sd);
        }
      }
    }
  }
  isSolvable():boolean{
    return this.solved;
  }
  moves():number{
    return this.ms;
  }
  solution():Board[]{
    var ans:Board[] = [];
    while (this.steps.length != 0) ans.push(this.steps.pop());
    return ans;
  }
}
