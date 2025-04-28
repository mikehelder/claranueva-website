
import React, { useRef, useEffect } from 'react';
import { Recipe } from '../types';

interface VisualizationProps {
  recipe: Recipe;
}

const Visualization: React.FC<VisualizationProps> = ({ recipe }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!recipe.title || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    canvas.width = 300;
    canvas.height = 300;
    
    // Draw background
    ctx.fillStyle = '#F9F5EB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw dosha triangle
    drawDoshaTriangle(ctx, canvas.width, canvas.height, recipe);
    
    // Draw taste hexagon
    drawTasteHexagon(ctx, canvas.width, canvas.height, recipe);
    
  }, [recipe]);
  
  const drawDoshaTriangle = (ctx: CanvasRenderingContext2D, width: number, height: number, recipe: Recipe) => {
    const centerX = width / 2;
    const centerY = height / 2 - 50;
    const radius = 70;
    
    // Draw triangle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX - radius * Math.sqrt(3)/2, centerY + radius/2);
    ctx.lineTo(centerX + radius * Math.sqrt(3)/2, centerY + radius/2);
    ctx.closePath();
    
    ctx.strokeStyle = '#8B7E74';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Label the corners
    ctx.font = '14px Poppins';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    
    ctx.fillText('Vata', centerX, centerY - radius - 10);
    ctx.fillText('Pitta', centerX - radius * Math.sqrt(3)/2 - 10, centerY + radius/2 + 15);
    ctx.fillText('Kapha', centerX + radius * Math.sqrt(3)/2 + 10, centerY + radius/2 + 15);
    
    // Highlight primary dosha
    const doshaPositions = {
      'vata': { x: centerX, y: centerY - radius },
      'pitta': { x: centerX - radius * Math.sqrt(3)/2, y: centerY + radius/2 },
      'kapha': { x: centerX + radius * Math.sqrt(3)/2, y: centerY + radius/2 }
    };
    
    const primaryPos = doshaPositions[recipe.properties.primaryDosha];
    
    ctx.beginPath();
    ctx.arc(primaryPos.x, primaryPos.y, 8, 0, Math.PI * 2);
    
    switch(recipe.properties.primaryDosha) {
      case 'vata':
        ctx.fillStyle = '#FBC02D';
        break;
      case 'pitta':
        ctx.fillStyle = '#E57373';
        break;
      case 'kapha':
        ctx.fillStyle = '#64B5F6';
        break;
    }
    
    ctx.fill();
  };
  
  const drawTasteHexagon = (ctx: CanvasRenderingContext2D, width: number, height: number, recipe: Recipe) => {
    const centerX = width / 2;
    const centerY = height / 2 + 80;
    const radius = 60;
    const tastes = ['sweet', 'sour', 'salty', 'pungent', 'bitter', 'astringent'];
    
    // Draw hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.strokeStyle = '#8B7E74';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw inner shape for selected tastes
    if (recipe.properties.taste.length > 0) {
      ctx.beginPath();
      const activeTastes = tastes.map(taste => recipe.properties.taste.includes(taste as any));
      
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i;
        const distanceFactor = activeTastes[i] ? 0.8 : 0.2;
        const x = centerX + radius * distanceFactor * Math.cos(angle);
        const y = centerY + radius * distanceFactor * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(201, 124, 93, 0.3)';
      ctx.fill();
    }
    
    // Label the corners
    ctx.font = '12px Poppins';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i;
      const x = centerX + (radius + 20) * Math.cos(angle);
      const y = centerY + (radius + 20) * Math.sin(angle);
      
      ctx.fillText(tastes[i], x, y);
    }
    
    // Add title
    ctx.font = '14px Poppins';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('Taste Profile', centerX, centerY - 80);
  };
  
  if (!recipe.title) {
    return null;
  }

  return (
    <div className="my-8 flex justify-center">
      <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
        <h3 className="text-xl font-medium mb-4 text-center text-ayurveda-terra">Ayurvedic Balance</h3>
        <canvas ref={canvasRef} width={300} height={300} className="mx-auto"></canvas>
      </div>
    </div>
  );
};

export default Visualization;
