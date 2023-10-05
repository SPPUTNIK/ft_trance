
import React, { useRef, useEffect } from 'react'

const Canvas = (props: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLCanvasElement> & React.CanvasHTMLAttributes<HTMLCanvasElement>) => {
  
  const canvasRef = useRef(null)
  
  const draw = (ctx: any, frameCount: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
    ctx.fill()
  }
  
  useEffect(() => {
    
    const canvas : any = canvasRef.current
    const context = canvas.getContext('2d');
    let frameCount = 0
    let animationFrameId: number;
    
    //Our draw came here
    const render = () => {
      frameCount++
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])
  
  return <canvas ref={canvasRef} {...props}/>
}

export default Canvas



export const GameA = () => {
  const canvas = document.querySelector("#pong") as HTMLCanvasElement

  const ctx = canvas?.getContext("2d");

  // game variable
  const PLAYER_HEIGHT = 100;
  const PLAYER_WIDTH = 15;
  const BALL_START_SPEED = 1;
  const BALL_DELTA_SPEED = 0.1;
  const COM_LEVEL = 0.1;


  useEffect(() => {
    // game object
    const player = {
      x: 0,
      y: canvas?.height / 2 - PLAYER_HEIGHT / 2,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: "blue",
      score: 0,
    }
    const computer = {
      x: canvas?.width - PLAYER_WIDTH,
      y: canvas?.height / 2 - PLAYER_HEIGHT / 2,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: "blue",
      score: 0,
    }

    const ball = {
      x: canvas?.width / 2,
      y: canvas?.height / 2,
      radius: 10,
      velocityX: 5,
      velocityY: 5,
      color: "green",
      speed: BALL_START_SPEED,
    }
    const net = {
      x: canvas?.width / 2 - 1,
      y: 0,
      width: 2,
      height: 10,
      color: "red",
    };
    function drawRect(x: number, y: number, w: number, h: number, color: string) {
      if (!ctx)
        return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }
    function drawCircle(x: number, y: number, r: number, color: string) {
      if (!ctx)
        return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    }
    function drawText(text: string, x: number, y: number, color: string) {
      if (!ctx)
        return;
      ctx.fillStyle = color;
      ctx.font = "25px fantasy";
      ctx.fillText(text, x, y);
    }
    function drawNet() {
      for (let i = 0; i <= canvas?.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
      }
    }

    function render() {
      // clear the canvas?
      drawRect(0, 0, canvas?.width, canvas?.height, "#E8F9FD");

      //draw net
      drawNet();

      //draw score
      drawText(player.score.toString(), canvas?.width / 5, canvas?.height / 6, "black");
      drawText(computer.score.toString(), (canvas?.width * 3) / 4.5, canvas?.height / 6, "black");

      //draw players
      drawRect(player.x, player.y, player.width, player.height, player.color);
      drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);

      //draw the ball
      drawCircle(ball.x, ball.y, ball.radius, ball.color);
    }

    function collision(b: any, p: any) {

      b.top = b.y - b.radius;
      b.bottom = b.y + b.radius;
      b.left = b.x - b.radius;
      b.right = b.x + b.radius;

      p.top = p.y;
      p.bottom = p.y + p.height;
      p.left = p.x;
      p.right = p.x + p.width;

      return (b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom);
    }

    function resetBall() {
      ball.x = canvas?.width / 2;
      ball.y = canvas?.height / 2;
      ball.speed = BALL_START_SPEED;
      ball.velocityX = -ball.velocityX;
    }

    canvas?.addEventListener("mousemove", (e: any) => {
      let rect = canvas?.getBoundingClientRect();
      player.y = e.clientY - rect.top - player.height / 2;
    })

    function update() {
      // ball movement 
      ball.x += ball.velocityX * ball.speed;
      ball.y += ball.velocityY * ball.speed;
      //ball collision with top and bottom
      if (ball.y + ball.radius > canvas?.height || ball.y + ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
      }
      // ball collitoin with players
      let selectedPlayer = ball.x < canvas?.width / 2 ? player : computer;
      if (collision(ball, selectedPlayer)) {
        ball.velocityX = -ball.velocityX;
        // increment speed of ball when ball hits a player
        ball.speed += BALL_DELTA_SPEED;
      }

      //computer movement
      let targetPos = ball.y - computer.height / 2;
      let currenPos = computer.y;
      computer.y = currenPos + (targetPos - currenPos) * COM_LEVEL;

      // update score
      if (ball.x - ball.radius < 0) {
        computer.score++;
        resetBall();
      } else if (ball.x + ball.radius > canvas?.width) {
        player.score++;
        resetBall();
      }
    }

    function game() {
      update();
      render();
    }
    const FPS = 60;
    setInterval(game, 1000 / FPS);
  }, [canvas, ctx])
  return (
    <div className="game-container">
      <canvas id="pong" className='game' width="600" height="400"></canvas>
      <Canvas />
    </div>
  )
}
