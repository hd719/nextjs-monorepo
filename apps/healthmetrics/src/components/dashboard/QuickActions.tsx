import { UtensilsCrossed, Dumbbell, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const actions = [
  {
    id: "add-food",
    icon: UtensilsCrossed,
    label: "Add Food",
    description: "Log a meal or snack",
  },
  {
    id: "log-exercise",
    icon: Dumbbell,
    label: "Log Exercise",
    description: "Record your workout",
  },
  {
    id: "add-weight",
    icon: Scale,
    label: "Add Weight",
    description: "Track your progress",
  },
];

export function QuickActions() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Quick Actions</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <Button
                variant="ghost"
                className="w-full h-full p-6 flex flex-col items-center gap-3 hover:bg-accent/5"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
