import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export function Car3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 600 * dpr;
    canvas.height = 450 * dpr;
    canvas.style.width = '600px';
    canvas.style.height = '450px';
    ctx.scale(dpr, dpr);

    let animationFrame: number;
    let rotation = 0;

    const drawCar = () => {
      ctx.clearRect(0, 0, 600, 450);
      
      ctx.save();
      ctx.translate(300, 225);
      
      rotation += 0.005;

      // Draw concentric rings
      const drawRing = (radius: number, opacity: number, width: number = 2) => {
        ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
        ctx.lineWidth = width;
        ctx.shadowColor = 'rgba(0, 229, 255, 0.5)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
      };

      // Outer rings
      drawRing(180, 0.3, 1.5);
      drawRing(140, 0.5, 2);

      // Horizontal line through center
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(-200, 0);
      ctx.lineTo(200, 0);
      ctx.stroke();

      // Draw the car body with gradient
      const carWidth = 160;
      const carHeight = 70;
      const carY = 0;

      // Create gradient for car body
      const gradient = ctx.createLinearGradient(-carWidth/2, 0, carWidth/2, 0);
      gradient.addColorStop(0, '#00CED1');
      gradient.addColorStop(0.5, '#4169E1');
      gradient.addColorStop(1, '#9370DB');

      ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
      ctx.shadowBlur = 20;

      // Car body path - side view of a sedan
      ctx.beginPath();
      
      // Start from bottom left (front bumper bottom)
      ctx.moveTo(-carWidth/2, carY + carHeight/2);
      
      // Front bumper
      ctx.lineTo(-carWidth/2 + 8, carY + carHeight/2);
      
      // Left wheel arch
      ctx.quadraticCurveTo(-carWidth/2 + 15, carY + carHeight/2 + 3, -carWidth/2 + 25, carY + carHeight/2);
      
      // Bottom to middle
      ctx.lineTo(-20, carY + carHeight/2);
      
      // Right wheel arch
      ctx.quadraticCurveTo(-10, carY + carHeight/2 + 3, 0, carY + carHeight/2);
      ctx.quadraticCurveTo(10, carY + carHeight/2 + 3, 20, carY + carHeight/2);
      
      // Bottom to rear
      ctx.lineTo(carWidth/2 - 25, carY + carHeight/2);
      
      // Rear wheel arch
      ctx.quadraticCurveTo(carWidth/2 - 15, carY + carHeight/2 + 3, carWidth/2 - 8, carY + carHeight/2);
      
      // Rear bumper bottom
      ctx.lineTo(carWidth/2, carY + carHeight/2);
      
      // Rear bumper up
      ctx.lineTo(carWidth/2, carY + 15);
      
      // Trunk
      ctx.lineTo(carWidth/2 - 10, carY + 5);
      ctx.lineTo(carWidth/2 - 15, carY - 5);
      
      // Rear windshield
      ctx.lineTo(carWidth/2 - 35, carY - 25);
      
      // Roof
      ctx.lineTo(-carWidth/2 + 45, carY - 25);
      
      // Front windshield
      ctx.lineTo(-carWidth/2 + 25, carY - 5);
      
      // Hood
      ctx.lineTo(-carWidth/2 + 15, carY);
      ctx.lineTo(-carWidth/2 + 5, carY + 8);
      
      // Front bumper
      ctx.lineTo(-carWidth/2, carY + 15);
      
      // Close path
      ctx.lineTo(-carWidth/2, carY + carHeight/2);
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add window details (darker areas)
      ctx.fillStyle = 'rgba(10, 22, 40, 0.6)';
      ctx.shadowBlur = 0;
      
      // Front windshield window
      ctx.beginPath();
      ctx.moveTo(-carWidth/2 + 27, carY - 3);
      ctx.lineTo(-carWidth/2 + 43, carY - 23);
      ctx.lineTo(-carWidth/2 + 48, carY - 23);
      ctx.lineTo(-carWidth/2 + 30, carY - 3);
      ctx.closePath();
      ctx.fill();
      
      // Rear windshield window
      ctx.beginPath();
      ctx.moveTo(carWidth/2 - 33, carY - 23);
      ctx.lineTo(carWidth/2 - 17, carY - 3);
      ctx.lineTo(carWidth/2 - 22, carY - 3);
      ctx.lineTo(carWidth/2 - 38, carY - 23);
      ctx.closePath();
      ctx.fill();

      // Door line
      ctx.strokeStyle = 'rgba(10, 22, 40, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5, carY - 25);
      ctx.lineTo(-5, carY + carHeight/2);
      ctx.stroke();

      // Draw wheels
      const wheelRadius = 16;
      const wheelY = carY + carHeight/2;
      const wheel1X = -carWidth/2 + 35;
      const wheel2X = carWidth/2 - 35;

      const drawWheel = (x: number, y: number) => {
        // Outer ring
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, wheelRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner dark circle
        ctx.fillStyle = '#0a1628';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x, y, wheelRadius - 5, 0, Math.PI * 2);
        ctx.fill();

        // Center dot
        ctx.fillStyle = '#00E5FF';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Spokes
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 / 5) * i + rotation;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * (wheelRadius - 7), y + Math.sin(angle) * (wheelRadius - 7));
          ctx.stroke();
        }
      };

      drawWheel(wheel1X, wheelY);
      drawWheel(wheel2X, wheelY);

      // Green charging indicator on side of car
      ctx.fillStyle = '#00FF88';
      ctx.shadowColor = '#00FF88';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(carWidth/2 - 25, carY + 10, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw floating geometric shapes
      const drawHexagon = (x: number, y: number, size: number, rotation: number, opacity: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = `rgba(100, 149, 237, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(100, 149, 237, 0.5)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const hx = Math.cos(angle) * size;
          const hy = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      };

      const drawRect = (x: number, y: number, width: number, height: number, rotation: number, opacity: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = `rgba(100, 149, 237, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(100, 149, 237, 0.5)';
        ctx.shadowBlur = 10;
        ctx.strokeRect(-width/2, -height/2, width, height);
        ctx.restore();
      };

      // Floating shapes with rotation
      drawHexagon(-180, 80, 20, rotation * 0.5, 0.6);
      drawHexagon(160, 100, 18, -rotation * 0.7, 0.5);
      drawRect(150, -100, 40, 25, rotation * 0.3, 0.6);

      // Lightning bolt icon top left
      ctx.save();
      ctx.translate(-190, -80);
      ctx.rotate(rotation * 0.2);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(-8, -15);
      ctx.lineTo(3, -2);
      ctx.lineTo(-3, -2);
      ctx.lineTo(8, 15);
      ctx.lineTo(-1, 3);
      ctx.lineTo(3, 3);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // EV Telemetry sensors and icons around the car
      // Battery indicator - top left
      ctx.save();
      ctx.translate(-140, -70);
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 255, 136, 0.6)';
      ctx.shadowBlur = 12;
      ctx.strokeRect(-10, -6, 20, 12);
      ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
      ctx.fillRect(-8, -4, 14, 8);
      ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
      ctx.fillRect(10, -2, 2, 4);
      ctx.restore();

      // Wifi/connectivity waves - top right
      ctx.save();
      ctx.translate(140, -70);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 10;
      for (let i = 0; i < 3; i++) {
        const arcSize = 8 + i * 6;
        const offset = Math.sin(rotation * 3 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, arcSize, -Math.PI * 0.6, -Math.PI * 0.4);
        ctx.globalAlpha = 0.7 - i * 0.2 + offset;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Temperature gauge - bottom left
      ctx.save();
      ctx.translate(-140, 80);
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 165, 0, 0.6)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      const tempHeight = Math.sin(rotation * 2) * 4 + 8;
      ctx.fillStyle = 'rgba(255, 165, 0, 0.6)';
      ctx.fillRect(-2, -tempHeight, 4, tempHeight);
      ctx.restore();

      // GPS/Location marker - bottom right
      ctx.save();
      ctx.translate(140, 80);
      const pulseScale = 1 + Math.sin(rotation * 4) * 0.15;
      ctx.scale(pulseScale, pulseScale);
      ctx.strokeStyle = 'rgba(138, 43, 226, 0.8)';
      ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(138, 43, 226, 0.6)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.bezierCurveTo(10, -12, 10, 0, 0, 10);
      ctx.bezierCurveTo(-10, 0, -10, -12, 0, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(138, 43, 226, 0.9)';
      ctx.beginPath();
      ctx.arc(0, -6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Data stream particles flowing around the car
      const streamParticles = [
        { angle: rotation * 2, radius: 120, size: 2 },
        { angle: rotation * 2 + Math.PI / 3, radius: 120, size: 1.5 },
        { angle: rotation * 2 + (Math.PI * 2) / 3, radius: 120, size: 2 },
        { angle: rotation * 2 + Math.PI, radius: 120, size: 1.5 },
        { angle: rotation * 2 + (Math.PI * 4) / 3, radius: 120, size: 2 },
        { angle: rotation * 2 + (Math.PI * 5) / 3, radius: 120, size: 1.5 },
      ];

      streamParticles.forEach((particle, i) => {
        const x = Math.cos(particle.angle) * particle.radius;
        const y = Math.sin(particle.angle) * particle.radius;
        ctx.fillStyle = `rgba(0, 229, 255, ${0.6 + Math.sin(rotation * 3 + i) * 0.3})`;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      animationFrame = requestAnimationFrame(drawCar);
    };

    drawCar();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="relative z-10"
        style={{
          filter: 'drop-shadow(0 0 30px rgba(0, 229, 255, 0.3))',
        }}
      />
    </motion.div>
  );
}
