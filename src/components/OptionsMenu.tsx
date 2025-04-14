
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CircleArrowLeft, Volume2, Monitor, Gamepad, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const OptionsMenu: React.FC = () => {
  const [volume, setVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(60);
  const [fullscreen, setFullscreen] = useState(false);
  const [showFPS, setShowFPS] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  
  return (
    <div className="min-h-screen w-full bg-cyber-dark digital-background flex flex-col relative overflow-hidden">
      {/* Header with back button */}
      <div className="w-full p-4 flex justify-between items-center">
        <Link to="/">
          <Button variant="ghost" className="text-neon-blue hover:text-neon-skyBlue hover:bg-cyber-black p-2">
            <CircleArrowLeft className="h-6 w-6" />
            <span className="ml-2 font-cyber">VOLVER</span>
          </Button>
        </Link>
        
        <h1 className="text-2xl font-futuristic text-neon-purple">OPCIONES</h1>
        
        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Options content */}
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div className="holographic rounded-md p-6 flex flex-col space-y-8">
          {/* Audio section */}
          <div>
            <h2 className="text-xl font-futuristic text-neon-skyBlue mb-4 flex items-center">
              <Volume2 className="mr-2 h-5 w-5" />
              AUDIO
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-white font-cyber">Volumen Principal</Label>
                  <span className="text-white font-cyber">{volume}%</span>
                </div>
                <Slider 
                  value={[volume]} 
                  onValueChange={(values) => setVolume(values[0])} 
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-white font-cyber">Volumen Música</Label>
                  <span className="text-white font-cyber">{musicVolume}%</span>
                </div>
                <Slider 
                  value={[musicVolume]} 
                  onValueChange={(values) => setMusicVolume(values[0])} 
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Display section */}
          <div>
            <h2 className="text-xl font-futuristic text-neon-orange mb-4 flex items-center">
              <Monitor className="mr-2 h-5 w-5" />
              PANTALLA
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="fullscreen" className="text-white font-cyber">
                  Pantalla Completa
                </Label>
                <Switch
                  id="fullscreen"
                  checked={fullscreen}
                  onCheckedChange={setFullscreen}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="fps" className="text-white font-cyber">
                  Mostrar FPS
                </Label>
                <Switch
                  id="fps"
                  checked={showFPS}
                  onCheckedChange={setShowFPS}
                />
              </div>
            </div>
          </div>
          
          {/* Gameplay section */}
          <div>
            <h2 className="text-xl font-futuristic text-neon-vividPurple mb-4 flex items-center">
              <Gamepad className="mr-2 h-5 w-5" />
              JUGABILIDAD
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white font-cyber">Dificultad</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 font-cyber",
                      difficulty === 'easy' 
                        ? "bg-neon-blue bg-opacity-20 text-neon-blue" 
                        : "text-muted-foreground"
                    )}
                    onClick={() => setDifficulty('easy')}
                  >
                    FÁCIL
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 font-cyber",
                      difficulty === 'normal' 
                        ? "bg-neon-vividPurple bg-opacity-20 text-neon-vividPurple" 
                        : "text-muted-foreground"
                    )}
                    onClick={() => setDifficulty('normal')}
                  >
                    NORMAL
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 font-cyber",
                      difficulty === 'hard' 
                        ? "bg-neon-pink bg-opacity-20 text-neon-pink" 
                        : "text-muted-foreground"
                    )}
                    onClick={() => setDifficulty('hard')}
                  >
                    DIFÍCIL
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* About section */}
          <div>
            <h2 className="text-xl font-futuristic text-neon-blue mb-4 flex items-center">
              <Info className="mr-2 h-5 w-5" />
              ACERCA DE
            </h2>
            
            <div className="space-y-2 text-sm text-muted-foreground font-cyber">
              <p>NEÓN DUALIDAD v1.0</p>
              <p>Un juego de plataformas y puzles ambientado en un universo cyberpunk.</p>
              <p>©2025 Todos los derechos reservados</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save button */}
      <div className="p-4 flex justify-center">
        <Button className="cyber-button w-48">
          GUARDAR CAMBIOS
        </Button>
      </div>
      
      {/* Scan lines effect */}
      <div className="scan-line"></div>
    </div>
  );
};

export default OptionsMenu;
