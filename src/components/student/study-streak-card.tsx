// @ts-nocheck
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Flame,
  Calendar,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudyStreakCardProps {
  performance: {
    studyStreak: number
    weeklyStats?: Array<{
      week: string
      sessionsCompleted: number
      averageScore: number
    }>
  } | null
}

export function StudyStreakCard({ performance }: StudyStreakCardProps) {
  if (!performance) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 tracking-tight">
            <Flame className="h-5 w-5" />
            Study Streak
          </CardTitle>
          <CardDescription className="leading-relaxed">Loading streak data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { studyStreak, weeklyStats = [] } = performance

  // Calculate weekly progress
  const thisWeekSessions = weeklyStats.length > 0 ? weeklyStats[weeklyStats.length - 1].sessionsCompleted : 0
  const weeklyGoal = 5 // Target 5 sessions per week
  const weeklyProgress = Math.min((thisWeekSessions / weeklyGoal) * 100, 100)

  // Use current streak as longest streak (API doesn't provide historical data yet)
  const longestStreak = studyStreak

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your streak today!"
    if (streak === 1) return "Great start! Keep it going"
    if (streak < 7) return "Building momentum!"
    if (streak < 30) return "Excellent consistency!"
    return "Incredible dedication!"
  }

  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'text-muted-foreground'
    if (streak < 7) return 'text-chart-3'
    if (streak < 30) return 'text-chart-2'
    return 'text-chart-5'
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-chart-5/12 to-orange-500/12 border border-chart-5/20 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Enhanced background elements for visual impact */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-5/25 to-orange-500/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/20 to-red-400/20 rounded-full blur-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>

      <CardHeader className="relative pb-[calc(var(--spacing)*4)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)]">
          <div className="space-y-[calc(var(--spacing)*1)] min-w-0 flex-1">
            <CardTitle className="flex items-center gap-[calc(var(--spacing)*2)] tracking-tight text-lg">
              <div className="p-[calc(var(--spacing)*1)] bg-gradient-to-r from-chart-5/20 to-orange-500/20 rounded-lg">
                <Flame className={cn("h-4 w-4 flex-shrink-0", getStreakColor(studyStreak))} />
              </div>
              <span className="truncate">Study Streak</span>
            </CardTitle>
            <CardDescription className="leading-relaxed text-sm pl-[calc(var(--spacing)*7)]">{getStreakMessage(studyStreak)}</CardDescription>
          </div>

          {studyStreak > 0 && (
            <Badge variant="outline" className="bg-card/50 backdrop-blur-sm border-chart-5/30 text-chart-5 text-xs font-medium self-start sm:self-auto flex-shrink-0">
              🔥 Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-[calc(var(--spacing)*6)]">
        {/* Current Streak Display */}
        <div className="text-center space-y-[calc(var(--spacing)*1)]">
          <div className={cn(
            "text-4xl sm:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent tracking-tight",
            studyStreak > 0 ? "from-chart-5 to-orange-500" : "from-muted-foreground to-muted-foreground"
          )}>
            {studyStreak}
          </div>
          <div className="text-base font-semibold text-foreground/80 tracking-wide">
            {studyStreak === 1 ? 'day' : 'days'} in a row
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 gap-[calc(var(--spacing)*3)]">
          <div className="group bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-lg p-[calc(var(--spacing)*3)] text-center border border-chart-5/20 hover:border-chart-5/30 transition-all">
            <div className="flex items-center justify-center mb-[calc(var(--spacing)*1)]">
              <div className="p-[calc(var(--spacing)*1)] bg-chart-5/20 rounded-full">
                <Award className="h-3 w-3 text-chart-5" />
              </div>
            </div>
            <div className="text-lg font-bold text-chart-5 tracking-tight">{longestStreak}</div>
            <div className="text-xs text-muted-foreground font-medium leading-relaxed">
              <span className="hidden sm:inline">Longest Streak</span>
              <span className="sm:hidden">Longest</span>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-lg p-[calc(var(--spacing)*3)] text-center border border-chart-2/20 hover:border-chart-2/30 transition-all">
            <div className="flex items-center justify-center mb-[calc(var(--spacing)*1)]">
              <div className="p-[calc(var(--spacing)*1)] bg-chart-2/20 rounded-full">
                <Target className="h-3 w-3 text-chart-2" />
              </div>
            </div>
            <div className="text-lg font-bold text-chart-2 tracking-tight">{thisWeekSessions}/{weeklyGoal}</div>
            <div className="text-xs text-muted-foreground font-medium leading-relaxed">
              <span className="hidden sm:inline">Weekly Goal</span>
              <span className="sm:hidden">Goal</span>
            </div>
          </div>
        </div>

        {/* Enhanced Weekly Progress */}
        <div className="space-y-[calc(var(--spacing)*3)] bg-gradient-to-r from-background/50 to-card/30 rounded-lg p-[calc(var(--spacing)*4)] border border-border/30">
          <div className="flex items-center justify-between text-sm leading-relaxed">
            <span className="text-muted-foreground flex items-center gap-[calc(var(--spacing)*2)] font-medium">
              <div className="p-[calc(var(--spacing)*1)] bg-chart-2/20 rounded-full">
                <Calendar className="h-3 w-3 text-chart-2" />
              </div>
              This Week's Progress
            </span>
            <span className="font-semibold tracking-tight text-chart-2">{thisWeekSessions}/{weeklyGoal} sessions</span>
          </div>

          <Progress
            value={weeklyProgress}
            className="h-3 bg-muted/50"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium leading-relaxed">
            <span>Keep the momentum going!</span>
            <span className="font-semibold">{Math.round(weeklyProgress)}% complete</span>
          </div>
        </div>

        {/* Enhanced Motivational Message */}
        {studyStreak > 0 && (
          <div className="bg-gradient-to-r from-chart-5/15 to-orange-500/15 rounded-lg p-[calc(var(--spacing)*4)] text-center border border-chart-5/20 shadow-sm">
            <div className="flex items-center justify-center gap-[calc(var(--spacing)*2)] text-sm font-semibold text-chart-5 mb-[calc(var(--spacing)*2)] tracking-tight">
              <div className="p-[calc(var(--spacing)*1)] bg-chart-5/20 rounded-full">
                <Award className="h-4 w-4" />
              </div>
              <span>Streak Bonus</span>
            </div>
            <div className="text-sm text-muted-foreground font-medium leading-relaxed">
              {studyStreak < 7
                ? `${7 - studyStreak} more days to unlock weekly bonus! 🎯`
                : studyStreak < 30
                  ? `${30 - studyStreak} more days to unlock monthly bonus! 🚀`
                  : "You're a study champion! Keep it up! 🏆"
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
