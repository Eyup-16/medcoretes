// @ts-nocheck
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Plus,
  BarChart3,
  BookOpen,
  Calendar,
  Settings,
  Zap,
  ArrowRight,
  Target,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  action: string
  variant: 'primary' | 'secondary'
}

interface Props {
  actions: QuickAction[]
}

export function QuickActions({ actions }: Props) {
  // Icon mapping for string-based icons from API
  const iconMap: Record<string, React.ElementType> = {
    BookOpen: BookOpen,
    Play: Play,
    Target: Target,
    Clock: Clock,
    BarChart3: BarChart3,
    Settings: Settings,
    Plus: Plus,
    Star: Star,
    TrendingUp: TrendingUp,
  };

  // Enhanced styling configurations
  const styleConfigs = [
    {
      gradient: 'from-chart-1 to-primary',
      bgGradient: 'from-chart-1/10 to-primary/10',
      darkBgGradient: 'dark:from-chart-1/10 dark:to-primary/10',
      badge: 'Popular',
      badgeColor: 'bg-chart-1/20 text-chart-1'
    },
    {
      gradient: 'from-primary to-chart-3',
      bgGradient: 'from-primary/10 to-chart-3/10',
      darkBgGradient: 'dark:from-primary/10 dark:to-chart-3/10',
      badge: 'Essential',
      badgeColor: 'bg-primary/20 text-primary'
    },
    {
      gradient: 'from-chart-2 to-chart-4',
      bgGradient: 'from-chart-2/10 to-chart-4/10',
      darkBgGradient: 'dark:from-chart-2/10 dark:to-chart-4/10',
      badge: 'Timed',
      badgeColor: 'bg-chart-2/20 text-chart-2'
    },
    {
      gradient: 'from-chart-3 to-chart-5',
      bgGradient: 'from-chart-3/10 to-chart-5/10',
      darkBgGradient: 'dark:from-chart-3/10 dark:to-chart-5/10',
      badge: 'Insights',
      badgeColor: 'bg-chart-3/20 text-chart-3'
    },
    {
      gradient: 'from-accent to-chart-4',
      bgGradient: 'from-accent/10 to-chart-4/10',
      darkBgGradient: 'dark:from-accent/10 dark:to-chart-4/10',
      badge: 'Premium',
      badgeColor: 'bg-accent/20 text-accent-foreground'
    },
    {
      gradient: 'from-chart-4 to-chart-2',
      bgGradient: 'from-chart-4/10 to-chart-2/10',
      darkBgGradient: 'dark:from-chart-4/10 dark:to-chart-2/10',
      badge: null,
      badgeColor: null
    }
  ];

  // Combine real actions with enhanced styling
  const enhancedActions = actions.map((action, index) => {
    const styleConfig = styleConfigs[index % styleConfigs.length];
    const IconComponent = iconMap[action.icon] || Target;

    return {
      ...action,
      icon: IconComponent,
      ...styleConfig
    };
  });

  return (
    <div className='space-y-[calc(var(--spacing)*6)]'>
      {/* Enhanced Responsive Action Hub Header */}
      <div className='text-center space-y-[calc(var(--spacing)*3)]'>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-[calc(var(--spacing)*3)]'>
          <div className='p-[calc(var(--spacing)*2)] bg-gradient-to-r from-chart-1 to-primary rounded-full'>
            <Target className='h-5 w-5 text-white' />
          </div>
          <div className='text-center sm:text-left'>
            <h3 className='text-lg sm:text-xl font-bold tracking-tight'>Ready to Learn?</h3>
            <p className='text-sm text-muted-foreground font-medium'>Choose your next learning adventure</p>
          </div>
        </div>
      </div>

      <Card className='relative overflow-hidden bg-gradient-to-br from-background/95 via-accent/8 to-muted/15 border-0 shadow-xl'>
        {/* Enhanced Background Pattern */}
        <div className='absolute inset-0 bg-grid-pattern opacity-[0.03]'></div>
        <div className='absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/15 to-accent/20 rounded-full blur-3xl'></div>
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-chart-1/15 to-chart-2/18 rounded-full blur-2xl'></div>
        <div className='absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/10'></div>

      <CardHeader className='relative pb-[calc(var(--spacing)*4)]'>
        <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)]'>
          <div className='space-y-[calc(var(--spacing)*1)] min-w-0 flex-1'>
            <CardTitle className='flex items-center gap-[calc(var(--spacing)*2)] tracking-tight text-lg sm:text-xl'>
              <div className='p-[calc(var(--spacing)*1)] bg-gradient-to-r from-chart-1/20 to-primary/20 rounded-lg'>
                <TrendingUp className='h-4 w-4 text-chart-1 flex-shrink-0' />
              </div>
              <span className='truncate'>Quick Actions</span>
            </CardTitle>
            <CardDescription className='leading-relaxed text-sm pl-[calc(var(--spacing)*7)]'>
              Jump into your learning journey with these popular actions
            </CardDescription>
          </div>

          <Badge variant='outline' className='bg-card/50 text-xs font-medium self-start sm:self-auto flex-shrink-0 border-chart-1/30 text-chart-1'>
            {enhancedActions.length} Action{enhancedActions.length !== 1 ? 's' : ''} Available
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='relative'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-[calc(var(--spacing)*4)] sm:gap-[calc(var(--spacing)*5)] xl:gap-[calc(var(--spacing)*6)]'>
          {enhancedActions.map((action, index) => {
            const Icon = action.icon
            const isPrimary = index < 2 // First two actions get primary treatment

            return (
              <div
                key={action.id}
                className={cn(
                  'group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer',
                  'bg-gradient-to-br', action.bgGradient, action.darkBgGradient,
                  isPrimary ? 'border-white/30 shadow-md ring-1 ring-white/10' : 'border-white/20 shadow-sm',
                  // Enhanced responsive sizing for large screens
                  'min-h-[140px] sm:min-h-[160px] lg:min-h-[180px] xl:min-h-[160px] 2xl:min-h-[140px]',
                  isPrimary && 'lg:col-span-1 sm:col-span-1' // Ensure primary actions maintain grid
                )}
              >
                {/* Enhanced Background Gradient - Responsive sizing */}
                <div className={cn(
                  'absolute top-0 right-0 rounded-full blur-3xl transition-opacity group-hover:opacity-30',
                  'w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 2xl:w-20 2xl:h-20',
                  isPrimary ? 'opacity-25' : 'opacity-20',
                  'bg-gradient-to-br', action.gradient
                )}></div>

                {/* Subtle overlay for depth */}
                <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5'></div>

                <div className='relative flex flex-col justify-between h-full p-[calc(var(--spacing)*4)]'>
                  {/* Header with Icon and Title */}
                  <div className='flex items-center gap-[calc(var(--spacing)*3)] mb-[calc(var(--spacing)*4)]'>
                    <div className={cn(
                      'rounded-lg bg-gradient-to-br shadow-lg transition-all duration-300 p-[calc(var(--spacing)*2)]',
                      action.gradient
                    )}>
                      <Icon className='h-5 w-5 text-white' />
                    </div>
                    <h3 className='font-bold text-base tracking-tight'>
                      {action.title}
                    </h3>
                  </div>

                  {/* Action Button */}
                  <Button
                    asChild
                    size='sm'
                    className={cn(
                      'w-full bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all duration-300',
                      'hover:scale-105 font-semibold',
                      action.gradient
                    )}
                  >
                    <a href={action.action} className='flex items-center justify-center gap-[calc(var(--spacing)*2)]'>
                      <span>Start</span>
                      <ArrowRight className='h-3 w-3 hover:translate-x-1 transition-transform' />
                    </a>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Enhanced Responsive Quick Stats */}
        <div className='mt-[calc(var(--spacing)*6)] sm:mt-[calc(var(--spacing)*8)] pt-[calc(var(--spacing)*4)] sm:pt-[calc(var(--spacing)*6)] border-t border-gradient-to-r from-transparent via-white/20 to-transparent'>
          <div className='text-center mb-[calc(var(--spacing)*3)] sm:mb-[calc(var(--spacing)*4)]'>
            <h4 className='text-sm font-semibold text-muted-foreground tracking-tight'>Today's Progress</h4>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)] lg:gap-[calc(var(--spacing)*6)]'>
            <div className='group text-center space-y-[calc(var(--spacing)*2)] p-[calc(var(--spacing)*3)] rounded-lg bg-gradient-to-br from-chart-1/10 to-chart-1/5 border border-chart-1/20 hover:border-chart-1/30 transition-all'>
              <div className='flex items-center justify-center'>
                <div className='p-[calc(var(--spacing)*1)] bg-chart-1/20 rounded-full'>
                  <Clock className='h-3 w-3 text-chart-1' />
                </div>
              </div>
              <div className='space-y-[calc(var(--spacing)*1)]'>
                <div className='text-lg sm:text-xl font-bold text-chart-1 tracking-tight'>12</div>
                <div className='text-xs text-muted-foreground font-medium leading-relaxed'>
                  <span className='hidden sm:inline'>Sessions Today</span>
                  <span className='sm:hidden'>Sessions</span>
                </div>
              </div>
            </div>
            <div className='group text-center space-y-[calc(var(--spacing)*2)] p-[calc(var(--spacing)*3)] rounded-lg bg-gradient-to-br from-chart-2/10 to-chart-2/5 border border-chart-2/20 hover:border-chart-2/30 transition-all'>
              <div className='flex items-center justify-center'>
                <div className='p-[calc(var(--spacing)*1)] bg-chart-2/20 rounded-full'>
                  <Target className='h-3 w-3 text-chart-2' />
                </div>
              </div>
              <div className='space-y-[calc(var(--spacing)*1)]'>
                <div className='text-lg sm:text-xl font-bold text-chart-2 tracking-tight'>85%</div>
                <div className='text-xs text-muted-foreground font-medium leading-relaxed'>
                  <span className='hidden sm:inline'>Avg Accuracy</span>
                  <span className='sm:hidden'>Accuracy</span>
                </div>
              </div>
            </div>
            <div className='group text-center space-y-[calc(var(--spacing)*2)] p-[calc(var(--spacing)*3)] rounded-lg bg-gradient-to-br from-chart-3/10 to-chart-3/5 border border-chart-3/20 hover:border-chart-3/30 transition-all'>
              <div className='flex items-center justify-center'>
                <div className='p-[calc(var(--spacing)*1)] bg-chart-3/20 rounded-full'>
                  <TrendingUp className='h-3 w-3 text-chart-3' />
                </div>
              </div>
              <div className='space-y-[calc(var(--spacing)*1)]'>
                <div className='text-lg sm:text-xl font-bold text-chart-3 tracking-tight'>2.5h</div>
                <div className='text-xs text-muted-foreground font-medium leading-relaxed'>
                  <span className='hidden sm:inline'>Study Time</span>
                  <span className='sm:hidden'>Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}