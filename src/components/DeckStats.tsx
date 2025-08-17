import { useDeckStore } from '@/store/deckStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit3, Users, Zap, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

export function DeckStats() {
  const currentDeck = useDeckStore(state => state.currentDeck);
  const getDeckStats = useDeckStore(state => state.getDeckStats);
  const updateDeckName = useDeckStore(state => state.updateDeckName);
  const stats = getDeckStats();

  const deckSections = [
    {
      name: 'Main Deck',
      count: stats.mainCount,
      limit: 60,
      min: 40,
      color: 'main-deck',
      icon: Users,
      description: 'Core battle cards'
    },
    {
      name: 'Extra Deck',
      count: stats.extraCount,
      limit: 15,
      color: 'extra-deck',
      icon: Zap,
      description: 'Special summon monsters'
    },
    {
      name: 'Side Deck',
      count: stats.sideCount,
      limit: 15,
      color: 'side-deck',
      icon: Shield,
      description: 'Situational cards'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Deck Name */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Edit3 className="h-4 w-4" />
          <span className="font-medium">Deck Name</span>
        </div>
        <Input
          value={currentDeck.name}
          onChange={(e) => updateDeckName(e.target.value)}
          className="h-12 bg-muted/20 border-2 border-border/50 focus:border-primary/50 focus:bg-muted/30 transition-all duration-300 rounded-xl text-lg font-semibold"
          placeholder="Enter deck name..."
        />
      </div>

      {/* Deck Statistics */}
      <div className="space-y-4">
        {deckSections.map((section, index) => {
          const percentage = (section.count / section.limit) * 100;
          const isValid = section.min ? 
            section.count >= section.min && section.count <= section.limit :
            section.count <= section.limit;
          const Icon = section.icon;

          return (
            <div 
              key={section.name} 
              className="p-4 rounded-xl bg-muted/10 border border-border/30 hover:bg-muted/20 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    section.color === 'main-deck' ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/10' :
                    section.color === 'extra-deck' ? 'bg-gradient-to-br from-purple-500/20 to-purple-500/10' :
                    'bg-gradient-to-br from-yellow-500/20 to-yellow-500/10'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      section.color === 'main-deck' ? 'text-blue-500' :
                      section.color === 'extra-deck' ? 'text-purple-500' :
                      'text-yellow-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{section.name}</h3>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {section.count}
                    <span className="text-sm text-muted-foreground font-normal">/{section.limit}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                      isValid ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {section.min && `Min: ${section.min}`}
                  </span>
                  <span className="font-medium">
                    {section.min && section.count < section.min && (
                      <span className="text-yellow-500">
                        Need {section.min - section.count} more
                      </span>
                    )}
                    {section.count > section.limit && (
                      <span className="text-destructive animate-pulse">
                        Over by {section.count - section.limit}
                      </span>
                    )}
                    {isValid && section.count > 0 && (
                      <span className="text-green-500">✓ Valid</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Deck Health */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/30">
        <h3 className="text-lg font-bold text-gradient-primary mb-4">Deck Overview</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-background/50 text-center">
            <div className="text-3xl font-bold text-gradient-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Cards</div>
          </div>
          <div className="p-3 rounded-lg bg-background/50 text-center">
            <div className="text-xl font-bold flex items-center justify-center gap-2">
              {stats.mainCount >= 40 && stats.mainCount <= 60 && 
               stats.extraCount <= 15 && stats.sideCount <= 15 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500">Legal</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-500">Invalid</span>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Tournament Status</div>
          </div>
        </div>
        
        {/* Status Message */}
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
          {stats.mainCount >= 40 && stats.mainCount <= 60 && 
           stats.extraCount <= 15 && stats.sideCount <= 15 ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-500">Tournament Ready!</p>
                <p className="text-xs text-muted-foreground">Your deck meets all competitive requirements</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-yellow-500">Adjustments Needed</p>
                <p className="text-xs text-muted-foreground">
                  {stats.mainCount < 40 && `Main deck needs ${40 - stats.mainCount} more cards. `}
                  {stats.mainCount > 60 && `Main deck has ${stats.mainCount - 60} too many cards. `}
                  {stats.extraCount > 15 && `Extra deck has ${stats.extraCount - 15} too many cards. `}
                  {stats.sideCount > 15 && `Side deck has ${stats.sideCount - 15} too many cards.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}