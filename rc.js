import React, { useEffect, useRef, useState } from 'react';

export default function RollerCoaster() {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const [speed, setSpeed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ballRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const trackRef = useRef([]);
  const energyCanvasRef = useRef(null);
  const gravity = 0.2;
  const friction = 0.997; // Reduced friction to maintain momentum longer

  // Initialize the track points and energy display
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth - 40;
    canvas.height = 400;
    
    // Create the track points
    createTrack();
    
    // Set initial ball position to the starting point of the track
    if (trackRef.current.length > 0) {
      ballRef.current.x = trackRef.current[0].x;
      ballRef.current.y = trackRef.current[0].y;
    }
    
    // Set up energy bar chart
    setupEnergyDisplay();
    
    // Draw initial state
    drawEverything();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth - 40;
      createTrack();
      drawEverything();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main animation loop
  useEffect(() => {
    if (!hasStarted) return;
    
    // Give the ball an initial push when simulation starts
    if (hasStarted && ballRef.current.vx === 0 && ballRef.current.vy === 0) {
      ballRef.current.vx = 5; // Initial horizontal velocity - stronger push
    }
    
    const animate = () => {
      updateBall();
      drawEverything();
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(requestRef.current);
  }, [hasStarted]);

  // Create the roller coaster track points
  const createTrack = () => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const points = [];
    
    // Starting point (higher for more potential energy)
    points.push({ x: 50, y: 80 });
    
    // First steep drop
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      points.push({
        x: 50 + t * 100,
        y: 80 + t * 220
      });
    }
    
    // First loop (largest)
    const loop1Center = { x: 200, y: 250 };
    const loop1Radius = 70;
    for (let angle = -90; angle <= 270; angle += 5) {
      const rad = angle * Math.PI / 180;
      points.push({
        x: loop1Center.x + loop1Radius * Math.cos(rad),
        y: loop1Center.y + loop1Radius * Math.sin(rad)
      });
    }
    
    // Connecting segment
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      points.push({
        x: 200 + t * 100,
        y: 250 - t * 20
      });
    }
    
    // Second loop (medium)
    const loop2Center = { x: 370, y: 230 };
    const loop2Radius = 50;
    for (let angle = -90; angle <= 270; angle += 5) {
      const rad = angle * Math.PI / 180;
      points.push({
        x: loop2Center.x + loop2Radius * Math.cos(rad),
        y: loop2Center.y + loop2Radius * Math.sin(rad)
      });
    }
    
    // Connecting segment with small hill
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      points.push({
        x: 370 + t * 120,
        y: 230 + Math.sin(t * Math.PI) * -50
      });
    }
    
    // Third loop (smallest)
    const loop3Center = { x: 550, y: 230 };
    const loop3Radius = 40;
    for (let angle = -90; angle <= 270; angle += 5) {
      const rad = angle * Math.PI / 180;
      points.push({
        x: loop3Center.x + loop3Radius * Math.cos(rad),
        y: loop3Center.y + loop3Radius * Math.sin(rad)
      });
    }
    
    // Final segment with small hill and then flat finish
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const hillHeight = t < 0.5 ? Math.sin(t * 2 * Math.PI) * -30 : 0;
      points.push({
        x: 550 + t * 200,
        y: 230 + hillHeight + (t > 0.5 ? (t - 0.5) * 40 : 0)
      });
    }
    
    trackRef.current = points;
  };

  // Set up the energy display
  const setupEnergyDisplay = () => {
    const canvas = energyCanvasRef.current;
    if (!canvas) return;
    
    canvas.width = 120;
    canvas.height = 150;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw labels
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Energy Scoreboard', 10, 20);
    ctx.fillText('KE PE TME', 15, 40);
    
    // Draw empty bars
    drawEnergyBars(0, 0);
  };

  // Update energy bars
  const drawEnergyBars = (ke, pe) => {
    const canvas = energyCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const total = ke + pe;
    const maxEnergy = 150; // Increased to accommodate higher energy
    const barWidth = 20;
    const barMaxHeight = 80;
    
    // Clear previous bars
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 50, 100, 100);
    
    // Draw KE bar (red)
    const keHeight = (ke / maxEnergy) * barMaxHeight;
    ctx.fillStyle = 'red';
    ctx.fillRect(20, 130 - keHeight, barWidth, keHeight);
    
    // Draw PE bar (blue)
    const peHeight = (pe / maxEnergy) * barMaxHeight;
    ctx.fillStyle = 'blue';
    ctx.fillRect(50, 130 - peHeight, barWidth, peHeight);
    
    // Draw total energy bar (green)
    const totalHeight = (total / maxEnergy) * barMaxHeight;
    ctx.fillStyle = 'green';
    ctx.fillRect(80, 130 - totalHeight, barWidth, totalHeight);
  };

  // Update ball position and physics
  const updateBall = () => {
    const ball = ballRef.current;
    const track = trackRef.current;
    
    // Apply gravity force
    ball.vy += gravity;
    
    // Update position based on velocity
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Find the closest point on the track
    let closestPointIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < track.length; i++) {
      const dist = Math.sqrt(Math.pow(ball.x - track[i].x, 2) + Math.pow(ball.y - track[i].y, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestPointIndex = i;
      }
    }
    
    // If ball is too far from track, put it back on track
    if (minDistance > 15) {
      // Find direction vector to closest point
      const dx = track[closestPointIndex].x - ball.x;
      const dy = track[closestPointIndex].y - ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Normalize and move ball closer to track
      if (dist > 0) {
        ball.x += (dx / dist) * (minDistance - 10);
        ball.y += (dy / dist) * (minDistance - 10);
      }
    }
    
    // Determine track direction at closest point
    let nextPointIndex = closestPointIndex + 1;
    let prevPointIndex = closestPointIndex - 1;
    
    // Ensure indices are within bounds
    if (nextPointIndex >= track.length) nextPointIndex = track.length - 1;
    if (prevPointIndex < 0) prevPointIndex = 0;
    
    // Calculate tangent direction along track
    let tx, ty;
    const movingForward = ball.vx > 0;
    
    if (movingForward) {
      tx = track[nextPointIndex].x - track[closestPointIndex].x;
      ty = track[nextPointIndex].y - track[closestPointIndex].y;
    } else {
      tx = track[closestPointIndex].x - track[prevPointIndex].x;
      ty = track[closestPointIndex].y - track[prevPointIndex].y;
    }
    
    const tangentMagnitude = Math.sqrt(tx * tx + ty * ty);
    if (tangentMagnitude > 0) {
      tx /= tangentMagnitude;
      ty /= tangentMagnitude;
    }
    
    // Project velocity onto the tangent
    const dotProduct = ball.vx * tx + ball.vy * ty;
    
    // Add a boost at steep segments if speed is decreasing too much
    let speedBoost = 1.0;
    if (Math.abs(ty) > 0.7 && Math.abs(dotProduct) < 3) {
      speedBoost = 1.05; // Small boost to help with loops
    }
    
    ball.vx = dotProduct * tx * friction * speedBoost;
    ball.vy = dotProduct * ty * friction * speedBoost;
    
    // Calculate energies
    const height = 400 - ball.y; // Height from bottom
    const velocity = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    
    const ke = 0.5 * velocity * velocity * 10; // Kinetic energy = 1/2 * mass * velocity^2 (mass = 1)
    const pe = height * gravity * 10; // Potential energy = mass * gravity * height
    
    // Update speed display
    setSpeed(Math.round(velocity * 10));
    
    // Update energy bars
    drawEnergyBars(ke, pe);
    
    // Check if ball is off screen or stopped for too long
    if (ball.x < 0 || ball.x > canvasRef.current.width || ball.y > canvasRef.current.height) {
      resetBall();
    }
    
    // Check if ball reached the end
    if (ball.x >= track[track.length - 1].x - 5) {
      // If the ball reached the end point, we can optionally do something
      // For now, just let it continue until it goes off screen
    }
  };

  // Reset the ball to the starting position
  const resetBall = () => {
    if (trackRef.current.length > 0) {
      ballRef.current.x = trackRef.current[0].x;
      ballRef.current.y = trackRef.current[0].y;
      ballRef.current.vx = 0;
      ballRef.current.vy = 0;
      setHasStarted(false);
    }
  };

  // Draw everything on the canvas
  const drawEverything = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with theme park colors
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#66ccff');
    gradient.addColorStop(1, '#99ffcc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw some decorative elements
    ctx.fillStyle = '#ffcc66';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30); // Ground
    
    // Draw small decorative elements
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 150;
      const y = canvas.height - 30;
      
      // Draw a simple tree or decoration
      ctx.fillStyle = '#663300';
      ctx.fillRect(x, y - 20, 5, 20);
      
      ctx.fillStyle = '#339933';
      ctx.beginPath();
      ctx.arc(x + 2.5, y - 25, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw finish line at the end
    const lastPoint = trackRef.current[trackRef.current.length - 1];
    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y - 20);
      ctx.lineTo(lastPoint.x, lastPoint.y + 20);
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Draw track
    ctx.beginPath();
    ctx.moveTo(trackRef.current[0].x, trackRef.current[0].y);
    
    for (let i = 1; i < trackRef.current.length; i++) {
      ctx.lineTo(trackRef.current[i].x, trackRef.current[i].y);
    }
    
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Draw track supports
    for (let i = 0; i < trackRef.current.length; i += 20) {
      const point = trackRef.current[i];
      if (point && point.y < canvas.height - 30) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x, canvas.height - 30);
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, 10, 0, Math.PI * 2);
    
    // Gradient fill for ball
    const ballGradient = ctx.createRadialGradient(
      ballRef.current.x - 3, ballRef.current.y - 3, 1,
      ballRef.current.x, ballRef.current.y, 10
    );
    ballGradient.addColorStop(0, '#ff6600');
    ballGradient.addColorStop(1, '#cc0000');
    
    ctx.fillStyle = ballGradient;
    ctx.fill();
    ctx.strokeStyle = '#990000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Start the simulation
  const startSimulation = () => {
    if (!hasStarted) {
      ballRef.current.vx = 5; // Stronger initial push to the right
      ballRef.current.vy = 0;
      setHasStarted(true);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-blue-100">
      <h1 className="text-3xl font-bold mb-4 text-purple-800">Roller Coaster Physics Simulation</h1>
      
      <div className="mb-4 bg-yellow-200 p-4 rounded-lg shadow-lg">
        <div className="text-center font-bold mb-2">Ball Speed: {speed} m/s</div>
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <canvas ref={canvasRef} className="border border-gray-400 rounded"></canvas>
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={startSimulation}
              disabled={hasStarted}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2 disabled:bg-gray-400"
            >
              Start
            </button>
            <button 
              onClick={resetBall}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <canvas ref={energyCanvasRef} className="border border-gray-400 rounded"></canvas>
          <div className="mt-2 text-sm">
            <div><span className="inline-block w-4 h-4 bg-red-500 mr-2"></span> Kinetic Energy</div>
            <div><span className="inline-block w-4 h-4 bg-blue-500 mr-2"></span> Potential Energy</div>
            <div><span className="inline-block w-4 h-4 bg-green-500 mr-2"></span> Total Mechanical Energy</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-white rounded-lg shadow-lg max-w-2xl">
        <h2 className="text-xl font-bold mb-2">Physics Concepts Demonstrated:</h2>
        <ul className="list-disc pl-5">
          <li><strong>Potential Energy:</strong> Energy stored in the ball due to its height (maximum at the top of hills)</li>
          <li><strong>Kinetic Energy:</strong> Energy of motion (maximum at the bottom of drops)</li>
          <li><strong>Conservation of Energy:</strong> Total mechanical energy remains nearly constant (small loss due to friction)</li>
          <li><strong>Momentum:</strong> Allows the ball to complete loops and climb hills</li>
        </ul>
      </div>
    </div>
  );
}
