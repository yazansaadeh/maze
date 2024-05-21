const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
const cellsHorizontal = 20;
const cellsVertical = 20;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
const shuffle = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    const random = Math.floor(Math.random() * arr.length);
    temp = arr[i];
    arr[i] = arr[random];
    arr[random] = temp;
  }
  return arr;
};
const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: { wireframes: false, width, height },
});
Render.run(render);
Runner.run(Runner.create(), engine);
const walls = [
  Bodies.rectangle(width / 2, 0, width, 4, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 4, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 4, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 4, height, { isStatic: true }),
];
World.add(world, walls);
const grid = Array(cellsVertical)
  .fill(null)
  .map(() => {
    return Array(cellsHorizontal).fill(false);
  });
const vertical = Array(cellsVertical)
  .fill(null)
  .map(() => {
    return Array(cellsHorizontal - 1).fill(false);
  });
const horizontal = Array(cellsVertical - 1)
  .fill(null)
  .map(() => {
    return Array(cellsHorizontal).fill(false);
  });
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);
const stepThrowCells = (row, column) => {
  if (grid[row][column]) {
    return;
  }
  grid[row][column] = true;
  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row + 1, column, "down"],
    [row, column + 1, "right"],
    [row, column - 1, "left"],
  ]);
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }
    if (grid[nextRow][nextColumn]) {
      continue;
    }
    if (direction === "left") {
      vertical[row][column - 1] = true;
    } else if (direction === "right") {
      vertical[row][column] = true;
    } else if (direction === "up") {
      horizontal[row - 1][column] = true;
    } else if (direction === "down") {
      horizontal[row][column] = true;
    }
    stepThrowCells(nextRow, nextColumn);
  }
};
stepThrowCells(startRow, startColumn);
horizontal.forEach((row, rowIndex) => {
  row.forEach((column, columnIndex) => {
    if (column) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      4,
      {
        label: "wall",
        isStatic: true,
        render: { fillStyle: "red" },
      }
    );
    World.add(world, wall);
  });
});
vertical.forEach((row, rowIndex) => {
  row.forEach((column, columnIndex) => {
    if (column) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      4,
      unitLengthY,
      {
        label: "wall",
        isStatic: true,
        render: { fillStyle: "red" },
      }
    );
    World.add(world, wall);
  });
});
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: "goal",
    isStatic: true,
    render: { fillStyle: "green" },
  }
);
World.add(world, goal);
const ballRadios = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadios, {
  label: "ball",
  render: { fillStyle: "blue" },
});
World.add(world, ball);
document.addEventListener("keydown", (e) => {
  const { x, y } = ball.velocity;
  if (e.keyCode === 87) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  if (e.keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y });
  }
  if (e.keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  if (e.keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["goal", "ball"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      world.bodies.forEach((e) => {
        if (e.label === "wall") {
          Body.setStatic(e, false);
        }
        document.querySelector(".winner").classList.remove("hidden");
      });
    }
  });
});
