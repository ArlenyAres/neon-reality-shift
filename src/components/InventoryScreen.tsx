
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CircleArrowLeft, Shield, Zap, Code, Database, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

type InventoryItem = {
  id: number;
  name: string;
  description: string;
  type: 'ability' | 'item' | 'upgrade';
  icon: React.ReactNode;
  active?: boolean;
  usable?: boolean;
  reality: 'physical' | 'digital' | 'both';
};

const SAMPLE_ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: "Reality Shift",
    description: "Toggle between physical and digital realities. Cost: 20 Energy",
    type: 'ability',
    icon: <Shield className="h-full w-full" />,
    active: true,
    reality: 'both'
  },
  {
    id: 2,
    name: "Energy Surge",
    description: "Instantly regenerate 30 energy",
    type: 'ability',
    icon: <Zap className="h-full w-full" />,
    usable: true,
    reality: 'physical'
  },
  {
    id: 3,
    name: "Breach Protocol",
    description: "Hack nearby terminals with no energy cost",
    type: 'ability',
    icon: <Code className="h-full w-full" />,
    usable: true,
    reality: 'digital'
  },
  {
    id: 4,
    name: "Data Fragment",
    description: "Piece of encrypted data about the corporation's plans",
    type: 'item',
    icon: <Database className="h-full w-full" />,
    reality: 'digital'
  },
  {
    id: 5,
    name: "Access Key",
    description: "Grants access to secure areas in the physical realm",
    type: 'item',
    icon: <Key className="h-full w-full" />,
    reality: 'physical'
  }
];

const InventoryScreen: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'abilities' | 'items' | 'upgrades'>('abilities');
  
  const filteredItems = SAMPLE_ITEMS.filter(item => {
    if (activeTab === 'abilities') return item.type === 'ability';
    if (activeTab === 'items') return item.type === 'item';
    return item.type === 'upgrade';
  });
  
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
        
        <h1 className="text-2xl font-futuristic text-neon-purple">INVENTARIO & HABILIDADES</h1>
        
        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Tab navigation */}
      <div className="w-full flex space-x-1 px-4 mb-4">
        <Button 
          variant="ghost" 
          className={cn(
            "flex-1 font-cyber rounded-t-md rounded-b-none border-b-2",
            activeTab === 'abilities' 
              ? "border-neon-vividPurple text-neon-vividPurple" 
              : "border-transparent text-muted-foreground"
          )}
          onClick={() => setActiveTab('abilities')}
        >
          HABILIDADES
        </Button>
        <Button 
          variant="ghost" 
          className={cn(
            "flex-1 font-cyber rounded-t-md rounded-b-none border-b-2",
            activeTab === 'items' 
              ? "border-neon-blue text-neon-blue" 
              : "border-transparent text-muted-foreground"
          )}
          onClick={() => setActiveTab('items')}
        >
          OBJETOS
        </Button>
        <Button 
          variant="ghost" 
          className={cn(
            "flex-1 font-cyber rounded-t-md rounded-b-none border-b-2",
            activeTab === 'upgrades' 
              ? "border-neon-orange text-neon-orange" 
              : "border-transparent text-muted-foreground"
          )}
          onClick={() => setActiveTab('upgrades')}
        >
          MEJORAS
        </Button>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
        {/* Items grid */}
        <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className={cn(
                "holographic aspect-square rounded-md flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300",
                selectedItem?.id === item.id && "border-2 border-neon-skyBlue",
                item.reality === 'physical' && "bg-neon-purple bg-opacity-10",
                item.reality === 'digital' && "bg-neon-blue bg-opacity-10",
                item.reality === 'both' && "bg-neon-pink bg-opacity-10"
              )}
              onClick={() => setSelectedItem(item)}
            >
              <div className="w-12 h-12 mb-2 flex items-center justify-center">
                <div className={cn(
                  "text-neon-skyBlue",
                  item.reality === 'physical' && "text-neon-purple",
                  item.reality === 'digital' && "text-neon-blue",
                  item.reality === 'both' && "text-neon-pink"
                )}>
                  {item.icon}
                </div>
              </div>
              <p className="text-white text-sm font-cyber text-center">{item.name}</p>
              <div className={cn(
                "mt-1 text-xs px-2 py-0.5 rounded-full",
                item.reality === 'physical' && "bg-neon-purple bg-opacity-20 text-neon-purple",
                item.reality === 'digital' && "bg-neon-blue bg-opacity-20 text-neon-blue",
                item.reality === 'both' && "bg-neon-pink bg-opacity-20 text-neon-pink"
              )}>
                {item.reality}
              </div>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground font-cyber">No items found in this category</p>
            </div>
          )}
        </div>
        
        {/* Item details */}
        <div className="md:w-1/3 holographic rounded-md p-4 flex flex-col">
          {selectedItem ? (
            <>
              <h2 className="text-xl font-futuristic text-white mb-2">{selectedItem.name}</h2>
              
              <div className={cn(
                "text-xs px-2 py-0.5 rounded-full self-start mb-4",
                selectedItem.reality === 'physical' && "bg-neon-purple bg-opacity-20 text-neon-purple",
                selectedItem.reality === 'digital' && "bg-neon-blue bg-opacity-20 text-neon-blue",
                selectedItem.reality === 'both' && "bg-neon-pink bg-opacity-20 text-neon-pink"
              )}>
                {selectedItem.type.toUpperCase()} • {selectedItem.reality.toUpperCase()} REALITY
              </div>
              
              <p className="text-white font-cyber mb-4">{selectedItem.description}</p>
              
              {selectedItem.usable && (
                <Button className="cyber-button mt-auto">
                  USAR
                </Button>
              )}
              
              {selectedItem.active && (
                <div className="mt-auto flex items-center">
                  <div className="w-3 h-3 rounded-full bg-neon-vividPurple animate-pulse mr-2"></div>
                  <span className="text-neon-vividPurple text-sm font-cyber">ACTIVE ABILITY</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-muted-foreground mb-2">
                <Database className="h-16 w-16 mx-auto opacity-50" />
              </div>
              <p className="text-muted-foreground font-cyber">Selecciona un item para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Scan lines effect */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="scan-line"></div>
      </div>
    </div>
  );
};

export default InventoryScreen;
