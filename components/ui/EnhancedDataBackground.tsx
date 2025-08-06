"use client";

import { useEffect, useRef, useState } from 'react';

interface DataNode {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  pulseSpeed: number;
  dataType: 'input' | 'output' | 'processing';
}

interface DataFlow {
  id: string;
  fromNode: string;
  toNode: string;
  progress: number;
  speed: number;
  color: string;
  intensity: number;
}

const EnhancedDataBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Data nodes representing different processing points
  const [nodes] = useState<DataNode[]>(() => [
    {
      id: 'input-1',
      x: 0.15,
      y: 0.25,
      size: 8,
      color: '#00FFC2',
      pulseSpeed: 2000,
      dataType: 'input'
    },
    {
      id: 'input-2',
      x: 0.2,
      y: 0.7,
      size: 6,
      color: '#00D4FF',
      pulseSpeed: 1800,
      dataType: 'input'
    },
    {
      id: 'processing-1',
      x: 0.5,
      y: 0.4,
      size: 12,
      color: '#A855F7',
      pulseSpeed: 1500,
      dataType: 'processing'
    },
    {
      id: 'processing-2',
      x: 0.45,
      y: 0.65,
      size: 10,
      color: '#EC4899',
      pulseSpeed: 1600,
      dataType: 'processing'
    },
    {
      id: 'output-1',
      x: 0.8,
      y: 0.3,
      size: 7,
      color: '#F59E0B',
      pulseSpeed: 2200,
      dataType: 'output'
    },
    {
      id: 'output-2',
      x: 0.85,
      y: 0.6,
      size: 9,
      color: '#EF4444',
      pulseSpeed: 1900,
      dataType: 'output'
    },
    {
      id: 'secondary-1',
      x: 0.3,
      y: 0.15,
      size: 4,
      color: '#8B5CF6',
      pulseSpeed: 2500,
      dataType: 'input'
    },
    {
      id: 'secondary-2',
      x: 0.7,
      y: 0.8,
      size: 5,
      color: '#06B6D4',
      pulseSpeed: 2100,
      dataType: 'output'
    }
  ]);

  // Data flows between nodes
  const [flows, setFlows] = useState<DataFlow[]>([]);

  // Update canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
        canvasRef.current.width = rect.width * window.devicePixelRatio;
        canvasRef.current.height = rect.height * window.devicePixelRatio;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate data flows
  useEffect(() => {
    const generateFlows = () => {
      const newFlows: DataFlow[] = [];
      
      // Create flows from inputs to processing nodes
      nodes.filter(n => n.dataType === 'input').forEach(inputNode => {
        nodes.filter(n => n.dataType === 'processing').forEach(processingNode => {
          if (Math.random() > 0.3) { // 70% chance of connection
            newFlows.push({
              id: `${inputNode.id}-${processingNode.id}`,
              fromNode: inputNode.id,
              toNode: processingNode.id,
              progress: Math.random(),
              speed: 0.008 + Math.random() * 0.012,
              color: inputNode.color,
              intensity: 0.6 + Math.random() * 0.4
            });
          }
        });
      });

      // Create flows from processing to output nodes
      nodes.filter(n => n.dataType === 'processing').forEach(processingNode => {
        nodes.filter(n => n.dataType === 'output').forEach(outputNode => {
          if (Math.random() > 0.2) { // 80% chance of connection
            newFlows.push({
              id: `${processingNode.id}-${outputNode.id}`,
              fromNode: processingNode.id,
              toNode: outputNode.id,
              progress: Math.random(),
              speed: 0.006 + Math.random() * 0.010,
              color: outputNode.color,
              intensity: 0.5 + Math.random() * 0.5
            });
          }
        });
      });

      // Add some inter-processing flows
      const processingNodes = nodes.filter(n => n.dataType === 'processing');
      if (processingNodes.length > 1) {
        newFlows.push({
          id: `${processingNodes[0].id}-${processingNodes[1].id}`,
          fromNode: processingNodes[0].id,
          toNode: processingNodes[1].id,
          progress: Math.random(),
          speed: 0.004 + Math.random() * 0.008,
          color: '#FFFFFF',
          intensity: 0.3 + Math.random() * 0.4
        });
      }

      setFlows(newFlows);
    };

    generateFlows();
    const interval = setInterval(generateFlows, 8000); // Regenerate flows every 8 seconds
    return () => clearInterval(interval);
  }, [nodes]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw data flows (lines)
      flows.forEach(flow => {
        const fromNode = nodes.find(n => n.id === flow.fromNode);
        const toNode = nodes.find(n => n.id === flow.toNode);
        
        if (!fromNode || !toNode) return;

        const fromX = fromNode.x * dimensions.width;
        const fromY = fromNode.y * dimensions.height;
        const toX = toNode.x * dimensions.width;
        const toY = toNode.y * dimensions.height;

        // Update flow progress
        flow.progress += flow.speed;
        if (flow.progress > 1.2) {
          flow.progress = -0.2; // Reset with some delay
        }

        // Calculate current position along the line
        const progress = Math.max(0, Math.min(1, flow.progress));
        const currentX = fromX + (toX - fromX) * progress;
        const currentY = fromY + (toY - fromY) * progress;

        // Draw the connection line (subtle)
        ctx.strokeStyle = flow.color + '15';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw the flowing data packet
        if (flow.progress >= 0 && flow.progress <= 1) {
          const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 8);
          gradient.addColorStop(0, flow.color + Math.floor(flow.intensity * 255).toString(16).padStart(2, '0'));
          gradient.addColorStop(0.5, flow.color + Math.floor(flow.intensity * 128).toString(16).padStart(2, '0'));
          gradient.addColorStop(1, flow.color + '00');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(currentX, currentY, 4 + Math.sin(timestamp * 0.01) * 2, 0, Math.PI * 2);
          ctx.fill();

          // Add a trailing effect
          for (let i = 1; i <= 3; i++) {
            const trailProgress = Math.max(0, progress - i * 0.05);
            const trailX = fromX + (toX - fromX) * trailProgress;
            const trailY = fromY + (toY - fromY) * trailProgress;
            const trailOpacity = flow.intensity * (1 - i * 0.3);
            
            ctx.fillStyle = flow.color + Math.floor(trailOpacity * 128).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(trailX, trailY, (4 - i) + Math.sin(timestamp * 0.01) * 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Draw nodes (enhanced pulsing dots)
      nodes.forEach(node => {
        const x = node.x * dimensions.width;
        const y = node.y * dimensions.height;
        const pulse = Math.sin(timestamp / node.pulseSpeed) * 0.5 + 0.5;
        const size = node.size + pulse * 4;

        // Outer glow
        const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        outerGradient.addColorStop(0, node.color + '40');
        outerGradient.addColorStop(0.5, node.color + '20');
        outerGradient.addColorStop(1, node.color + '00');
        
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.3, node.color);
        coreGradient.addColorStop(1, node.color + '80');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#FFFFFF' + Math.floor(pulse * 128 + 127).toString(16);
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Data type indicator ring
        if (node.dataType === 'processing') {
          ctx.strokeStyle = node.color + '60';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, flows, nodes]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      
      {/* Static background elements for fallback */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default EnhancedDataBackground;