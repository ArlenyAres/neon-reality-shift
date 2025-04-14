
import React, { useState, useEffect } from 'react';
import GameCanvas from '@/components/GameCanvas';
import GameHUD from '@/components/GameHUD';
import TransitionScreen from '@/components/TransitionScreen';
import { Link } from 'react-router-dom';
import { Menu, CircleArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

const Game: React.FC = () => {
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [reality, setReality] = useState<'physical' | 'digital'>('physical');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionFrom, setTransitionFrom] = useState<'physical' | 'digital'>('physical');
  const [transitionTo, setTransitionTo] = useState<'physical' | 'digital'>('digital');
  const [isPaused, setIsPaused] = useState(false);
  const [solvedObjects, setSolvedObjects] = useState(0);
  const [level, setLevel] = useState(1);
  const { toast } = useToast();
  
  // Handle object solved event
  const handleObjectSolved = () => {
    setSolvedObjects(prev => {
      const newValue = prev + 1;
      // Check if level should increase
      if (newValue >= 10) {
        setLevel(prevLevel => prevLevel + 1);
        toast({
          title: "¡Nivel Completado!",
          description: `Has avanzado al nivel ${level + 1}. Nuevos desafíos te esperan.`,
        });
        return 0; // Reset solved objects for next level
      }
      return newValue;
    });
  };
  
  // Simulate game events
  useEffect(() => {
    // This is just for demonstration purposes
    const interval = setInterval(() => {
      if (!isPaused && !isTransitioning) {
        // Slowly regenerate energy in physical reality
        if (reality === 'physical') {
          setEnergy(prev => Math.min(100, prev + 0.5));
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [reality, isPaused, isTransitioning]);
  
  // Handle reality shift
  const handleRealityShift = () => {
    if (energy >= 20 && !isTransitioning) {
      setTransitionFrom(reality);
      setTransitionTo(reality === 'physical' ? 'digital' : 'physical');
      setIsTransitioning(true);
      setEnergy(prev => prev - 20);
    }
  };
  
  // Handle transition completion
  const handleTransitionComplete = () => {
    setReality(transitionTo);
    setIsTransitioning(false);
  };
  
  return (
    <div className="min-h-screen w-full bg-cyber-dark overflow-hidden relative">
      {/* Game HUD */}
      <GameHUD 
        health={health}
        energy={energy}
        reality={reality}
        score={level * 250 + solvedObjects * 25}
        solvedObjects={solvedObjects}
        totalObjectsToSolve={10}
      />
      
      {/* Pause Menu Button */}
      <div className="absolute top-4 right-4 z-20">
        <Dialog open={isPaused} onOpenChange={setIsPaused}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-cyber-dark bg-opacity-60 border-neon-purple">
              <Menu className="h-5 w-5 text-neon-purple" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md holographic border-neon-purple">
            <DialogTitle className="text-xl font-futuristic text-center text-neon-purple">JUEGO PAUSADO</DialogTitle>
            
            <div className="flex flex-col space-y-4 mt-4">
              <Button 
                variant="outline" 
                className="cyber-button w-full"
                onClick={() => setIsPaused(false)}
              >
                CONTINUAR
              </Button>
              
              <Button 
                variant="outline" 
                className="cyber-button w-full"
                onClick={handleRealityShift}
                disabled={energy < 20 || isTransitioning}
              >
                CAMBIAR REALIDAD
              </Button>
              
              <Link to="/inventory" className="w-full">
                <Button variant="outline" className="cyber-button w-full">
                  INVENTARIO
                </Button>
              </Link>
              
              <Link to="/options" className="w-full">
                <Button variant="outline" className="cyber-button w-full">
                  OPCIONES
                </Button>
              </Link>
              
              <Link to="/" className="w-full">
                <Button variant="outline" className="cyber-button w-full">
                  MENÚ PRINCIPAL
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Back Button (Mobile) */}
      <div className="md:hidden absolute top-4 left-4 z-20">
        <Link to="/">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-cyber-dark bg-opacity-60 border-neon-purple">
            <CircleArrowLeft className="h-5 w-5 text-neon-purple" />
          </Button>
        </Link>
      </div>
      
      {/* Reality Shift Button (Mobile) */}
      {!isPaused && (
        <div className="md:hidden absolute bottom-20 right-4 z-20">
          <Button 
            variant="outline" 
            onClick={handleRealityShift}
            disabled={energy < 20 || isTransitioning}
            className="h-16 w-16 rounded-full bg-cyber-dark bg-opacity-60 border-2 border-neon-purple disabled:opacity-50"
          >
            <span className="text-neon-purple font-cyber">SHIFT</span>
          </Button>
        </div>
      )}
      
      {/* Game Canvas */}
      {!isTransitioning && (
        <div className="w-full h-screen flex justify-center items-center">
          <GameCanvas onObjectSolved={handleObjectSolved} level={level} />
        </div>
      )}
      
      {/* Transition Screen */}
      {isTransitioning && (
        <TransitionScreen 
          fromReality={transitionFrom}
          toReality={transitionTo}
          onTransitionComplete={handleTransitionComplete}
        />
      )}
      
      {/* Control instructions for desktop */}
      <div className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="holographic px-4 py-2 rounded-md text-xs font-cyber">
          <p className="text-white">
            <span className="text-neon-blue">WASD/Arrows</span> - Move | 
            <span className="text-neon-blue"> Space</span> - Jump | 
            <span className="text-neon-blue"> Tab</span> - Shift Reality | 
            <span className="text-neon-blue"> E</span> - Interact | 
            <span className="text-neon-blue"> Esc</span> - Pause
          </p>
        </div>
      </div>
    </div>
  );
};

export default Game;
