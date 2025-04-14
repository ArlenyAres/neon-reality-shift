
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Code, Zap, CircleDot, Settings } from 'lucide-react';

const MainMenu: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-cyber-dark digital-background flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background elements - abstract city skyline */}
      <div className="absolute bottom-0 left-0 w-full h-64 opacity-20">
        <div className="absolute bottom-0 left-[5%] w-12 h-28 bg-neon-purple"></div>
        <div className="absolute bottom-0 left-[15%] w-16 h-36 bg-neon-blue"></div>
        <div className="absolute bottom-0 left-[25%] w-14 h-52 bg-neon-darkPurple"></div>
        <div className="absolute bottom-0 left-[35%] w-20 h-40 bg-neon-purple"></div>
        <div className="absolute bottom-0 left-[48%] w-12 h-36 bg-neon-skyBlue"></div>
        <div className="absolute bottom-0 left-[55%] w-20 h-60 bg-neon-vividPurple"></div>
        <div className="absolute bottom-0 left-[70%] w-14 h-32 bg-neon-blue"></div>
        <div className="absolute bottom-0 left-[85%] w-16 h-48 bg-neon-purple"></div>
      </div>
      
      {/* Scan line effect */}
      <div className="scan-line"></div>
      
      {/* Title */}
      <div className="relative">
        <h1 
          data-text="NEÓN DUALIDAD" 
          className="glitch-effect text-5xl md:text-6xl lg:text-7xl font-futuristic font-bold text-white tracking-wider mb-2"
        >
          NEÓN DUALIDAD
        </h1>
        <p className="text-xl md:text-2xl text-neon-skyBlue font-cyber text-center">
          EL HACKER DE REALIDADES
        </p>
      </div>
      
      {/* Decorative code lines */}
      <div className="my-6 text-neon-blue font-cyber text-xs opacity-60 overflow-hidden h-16">
        <p>01001110 01000101 01001111 01001110</p>
        <p>while(reality.isShifting) {'{'}</p>
        <p>  execute(PROTOCOL_BREACH);</p>
        <p>  reality.merge(digital, physical);</p>
        <p>{'}'}</p>
      </div>
      
      {/* Menu buttons */}
      <div className="flex flex-col space-y-4 z-10 mt-8 max-w-xs w-full">
        <Link to="/game" className="w-full">
          <Button variant="outline" className="cyber-button w-full flex justify-between items-center">
            <Zap className="mr-2 h-4 w-4" />
            <span>INICIAR JUEGO</span>
            <CircleDot className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        
        <Link to="/inventory" className="w-full">
          <Button variant="outline" className="cyber-button w-full flex justify-between items-center">
            <Code className="mr-2 h-4 w-4" />
            <span>INVENTARIO</span>
            <CircleDot className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        
        <Link to="/options" className="w-full">
          <Button variant="outline" className="cyber-button w-full flex justify-between items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>OPCIONES</span>
            <CircleDot className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-xs text-muted-foreground">
        <p className="font-cyber">©2025 NEÓN DUALIDAD v1.0</p>
      </div>
      
      {/* Floating abstract elements */}
      <div className="absolute top-1/4 right-10 w-20 h-20 bg-neon-pink opacity-10 rotate-45 animate-float"></div>
      <div className="absolute top-2/3 left-12 w-16 h-16 bg-neon-blue opacity-10 rotate-12 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 right-20 w-24 h-12 bg-neon-purple opacity-10 -rotate-20 animate-float" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default MainMenu;
