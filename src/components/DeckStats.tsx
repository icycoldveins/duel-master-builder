import { useDeckStore } from '@/store/deckStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit3, Users, Zap, Shield } from 'lucide-react';

export function DeckStats() {
  const { currentDeck, getDeckStats, updateDeckName } = useDeckStore();
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
    <div className="space-y-4">
      {/* Deck Name */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Deck Name</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            value={currentDeck.name}
            onChange={(e) => updateDeckName(e.target.value)}
            className="bg-input/50 border-border/50 focus:bg-input focus:border-primary/50"
            placeholder="Enter deck name..."
          />
        </CardContent>
      </Card>

      {/* Deck Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deckSections.map((section) => {
          const percentage = (section.count / section.limit) * 100;
          const isValid = section.min ? 
            section.count >= section.min && section.count <= section.limit :
            section.count <= section.limit;
          const Icon = section.icon;

          return (
            <Card key={section.name} className="bg-gradient-card border-border shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 text-${section.color}`} />
                    <CardTitle className="text-sm">{section.name}</CardTitle>
                  </div>
                  <Badge 
                    variant={isValid ? "default" : "destructive"}
                    className={`bg-${section.color}/20 text-${section.color} border-${section.color}/30`}
                  >
                    {section.count}/{section.limit}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{section.description}</span>
                    <span>
                      {section.min && section.count < section.min && (
                        <span className="text-yellow-500">
                          +{section.min - section.count} needed
                        </span>
                      )}
                      {section.count > section.limit && (
                        <span className="text-destructive">
                          -{section.count - section.limit} over
                        </span>
                      )}
                      {isValid && section.count > 0 && (
                        <span className="text-green-500">Valid</span>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall Deck Health */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Deck Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-main-deck">{stats.mainCount}</div>
              <div className="text-xs text-muted-foreground">Main Deck</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-extra-deck">{stats.extraCount}</div>
              <div className="text-xs text-muted-foreground">Extra Deck</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-side-deck">{stats.sideCount}</div>
              <div className="text-xs text-muted-foreground">Side Deck</div>
            </div>
          </div>
          
          {/* Validation Status */}
          <div className="mt-4 p-3 rounded-lg bg-muted/20">
            {stats.mainCount >= 40 && stats.mainCount <= 60 && 
             stats.extraCount <= 15 && stats.sideCount <= 15 ? (
              <div className="flex items-center gap-2 text-green-500">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Deck is tournament legal</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-500">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Deck needs adjustments</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}