/* various 2d-vector operations */

export type Vector = {
  x: number;
  y: number;
};

export function sum(v1: Vector, v2: Vector): Vector {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

export function diff(v1: Vector, v2: Vector): Vector {
  return sum(v1, minus(v2));
}

export function minus(v: Vector): Vector {
  return { x: -v.x, y: -v.y };
}

export function size(v: Vector): number {
  return (v.x ** 2 + v.y ** 2) ** 0.5;
}

export function unit(v: Vector): Vector {
  const s = size(v);
  return {
    x: v.x / s,
    y: v.y / s,
  };
}

export function normal(v: Vector): Vector {
  return {
    x: -v.y,
    y: v.x,
  };
}

export function times(n: number, v: Vector): Vector {
  return {
    x: n * v.x,
    y: n * v.y,
  };
}
