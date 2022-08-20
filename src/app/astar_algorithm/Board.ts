
export class Board{
  private n:number;
  private t:number[][];
  constructor(tiles:number[][]){
    this.n = tiles.length;
    this.t = [];
    for(var i:number = 0; i < this.n; i++){
      this.t.push([]);
      for(var j:number = 0; j < this.n; j++){
        this.t[i].push(tiles[i][j]);
      }
    }
  }

  board():number[][]{
    return this.t;
  }
  twin():Board {
    var nt:number[][] = [];
    for (var i = 0; i < this.t.length; i++) {
        nt.push([]);
        for (var j = 0; j < this.t.length; j++) nt[i].push(this.t[i][j]);
    }
    if (nt[0][0] == 0) {
        var b:number[] = [ 1, 1 ];
        this.swp(nt, b, 0, 1);
    }
    else if (nt[0][1] == 0) {
        var b:number[] = [ 0, 0 ];
        this.swp(nt, b, 1, 0);
    }
    else {
        var b:number[] = [0, 0];
        this.swp(nt, b, 0, 1);
    }
    return new Board(nt);
  }
  toString():String{
    var s:String = "";
    for(var i = 0; i < this.n; i++){
      for(var j = 0; j < this.n; j++){
          s+= ''+this.t[i][j];
      }
      if (i < this.n - 1) s += "\n";
    }
    return s;
  }
  dimension():number{
      return this.n;
  }
  manhattan():number{
    var m:number = 0;
    for (var i:number = 0; i < this.n; i++) {
        for (var j:number = 0; j < this.n; j++) {
            if (this.t[i][j] != 0 && this.t[i][j] != this.getNum(i, j)) {
                var correctCoor:number[] = this.getCoor(this.t[i][j]);
                m += Math.abs(correctCoor[0] - i);
                m += Math.abs(correctCoor[1] - j);
            }
        }
    }
    return m;
  }
  isGoal():boolean{
    return this.manhattan() == 0;
  }
  equals(y:Board):boolean{
    if (y == null) return false;
    var temp:Board =  y;
    for (var i:number = 0; i < this.dimension(); i++) {
        for (var j:number = 0; j < this.dimension(); j++) {
            if (temp.t[i][j] != this.t[i][j]) {
                return false;
            }
        }
    }
    return true;
  }

  private  copyOft():number[][] {
    var c:number[][] = [];
    for (var i:number = 0; i < this.n; i++) {
        c.push([]);
        for (var j:number = 0; j < this.n; j++) {
            c[i].push(this.t[i][j]);
        }
    }
    return c;
  }
  private corner(b:number[]):boolean {
      return (b[0] == 0 || b[0] == this.n - 1) && (b[1] == 0 || b[1] == this.n - 1);
  }

  private sides(b:number[]):boolean {
      return !this.corner(b) && (b[0] == 0 || b[1] == 0 || b[0] == this.n - 1
              || b[1] == this.n - 1);
  }

  private swp(curr:number[][], b:number[], r:number, c:number):void {
      var s:number = curr[b[0]][b[1]];
      curr[b[0]][b[1]] = curr[r][c];
      curr[r][c] = s;
  }

  private cornerNeigh(b:number[]):number[][][]{
      var row:number = b[0];
      var col:number = b[1];
      var r:number[][][] = [];
      if (row == 0 && col == 0) {
          r.push(this.copyOft());
          this.swp(r[0], b, 0, 1);
          r.push(this.copyOft());
          this.swp(r[1], b, 1, 0);
      }
      else if (row == 0 && col == this.n - 1) {
          r.push(this.copyOft());
          this.swp(r[0], b, 0, this.n - 2);
          r.push(this.copyOft());
          this.swp(r[1], b, 1, this.n - 1);
      }
      else if (row == this.n - 1 && col == 0) {
          r.push(this.copyOft());
          this.swp(r[0], b, this.n - 1, 1);
          r.push(this.copyOft());
          this.swp(r[1], b, this.n - 2, 0);
      }
      else if (row == this.n - 1 && col == this.n - 1) {
          r.push(this.copyOft());
          this.swp(r[0], b, this.n - 1, this.n - 2);
          r.push(this.copyOft());
          this.swp(r[1], b, this.n - 2, this.n - 1);
      }
      return r;
  }

  private sideNeigh(b:number[]):number[][][] {
      var row:number = b[0];
      var col:number = b[1];
      var r:number[][][] = [];
      if (col == 0) {
          r.push(this.copyOft());
          this.swp(r[0], b, b[0] - 1, b[1]);
          r.push(this.copyOft());
          this.swp(r[1], b, b[0] + 1, b[1]);
          r.push(this.copyOft());
          this.swp(r[2], b, b[0], b[1] + 1);
      }
      else if (col == this.n - 1) {
          r.push(this.copyOft());
          this.swp(r[0], b, b[0] - 1, b[1]);
          r.push(this.copyOft());
          this.swp(r[1], b, b[0] + 1, b[1]);
          r.push(this.copyOft());
          this.swp(r[2], b, b[0], b[1] - 1);
      }
      else if (row == 0) {
          r.push(this.copyOft());
          this.swp(r[0], b, b[0], b[1] + 1);
          r.push(this.copyOft());
          this.swp(r[1], b, b[0], b[1] - 1);
          r.push(this.copyOft());
          this.swp(r[2], b, b[0] + 1, b[1]);
      }
      else if (row == this.n - 1) {
          r.push(this.copyOft());
          this.swp(r[0], b, b[0], b[1] + 1);
          r.push(this.copyOft());
          this.swp(r[1], b, b[0], b[1] - 1);
          r.push(this.copyOft());
          this.swp(r[2], b, b[0] - 1, b[1]);
      }

      return r;
  }

  private middleNeigh(b:number[]):number[][][] {
      var row:number = b[0];
      var col:number = b[1];
      var r:number[][][] = [];
      r.push(this.copyOft());
      this.swp(r[0], b, row - 1, col);
      r.push(this.copyOft());
      this.swp(r[1], b, row, col - 1);
      r.push(this.copyOft());
      this.swp(r[2], b, row, col + 1);
      r.push(this.copyOft());
      this.swp(r[3], b, row + 1, col);
      return r;
  }
  neighbors():Board[]{
    var neigh:Board[] = [];
    var b:number[] = [];
    for (var i:number = 0; i < this.n; i++) {
        for (var j = 0; j < this.n; j++) {
            if (this.t[i][j] == 0) {
              b.push(i);
              b.push(j);
            }
        }
    }
    if (this.corner(b)) {
        var cn:number[][][] = this.cornerNeigh(b);
        for (var i:number = 0; i < cn.length; i++) neigh.push(new Board(cn[i]));
    }
    else if (this.sides(b)) {
        var cn:number[][][] = this.sideNeigh(b);
        for (var i:number = 0; i < cn.length; i++) neigh.push(new Board(cn[i]));
    }
    else {
      var cn:number[][][] = this.middleNeigh(b);
      for (var i:number = 0; i < cn.length; i++) neigh.push(new Board(cn[i]));
    }
    return neigh;
  }

  private getCoor(num:number):number[] {
        num -= 1;
        return [Math.floor(num / this.n),Math.floor(num % this.n)];
    }

    private getNum(i:number, j:number):number {
        return i * this.n + j + 1;
    }

}
