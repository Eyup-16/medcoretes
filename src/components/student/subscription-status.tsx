// @ts-nocheck
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { differenceInDays, format, differenceInMonths } from 'date-fns'
import {
  Crown,
  Calendar,
  Clock,
  Star,
  ArrowUpRight,
  Shield,
  Zap,
  Gift,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Subscription {
  pack: string
  expiryDate: Date | string
  isActive: boolean
  type: 'year_pack' | 'residency_pack'
  isFree?: boolean
}

interface Props {
  subscription: Subscription | null
}

export function SubscriptionStatus({ subscription }: Props) {
  // Handle null subscription case
  if (!subscription) {
    return (
      <Card className='relative overflow-hidden border-dashed'>
        <CardHeader className='pb-[calc(var(--spacing)*4)]'>
          <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)]'>
            <div className='flex items-center gap-[calc(var(--spacing)*3)] min-w-0 flex-1'>
              <div className='p-[calc(var(--spacing)*2)] rounded-lg bg-muted flex-shrink-0'>
                <Shield className='h-5 w-5 text-muted-foreground' />
              </div>
              <div className='min-w-0 flex-1'>
                <CardTitle className='text-lg tracking-tight truncate'>No Active Subscription</CardTitle>
                <CardDescription className='leading-relaxed text-sm'>Get started with a study pack</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='text-center py-[calc(var(--spacing)*6)]'>
            <p className='text-sm text-muted-foreground mb-[calc(var(--spacing)*4)] font-medium leading-relaxed'>
              Subscribe to access premium content and features
            </p>
            <Button
              className='w-full font-semibold tracking-tight'
              onClick={() => window.location.href = '/student/subscriptions'}
            >
              <Crown className='h-4 w-4 mr-[calc(var(--spacing)*2)]' />
              View Subscription Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const expiry = new Date(subscription.expiryDate)
  const daysLeft = differenceInDays(expiry, new Date())
  const monthsLeft = differenceInMonths(expiry, new Date())

  // Calculate subscription progress (assuming 12 months total)
  const totalDays = 365
  const daysUsed = totalDays - daysLeft
  const progressPercentage = Math.max(0, Math.min(100, (daysUsed / totalDays) * 100))

  const isExpiringSoon = daysLeft <= 30 && daysLeft > 0
  const isExpired = daysLeft <= 0

  const getStatusColor = () => {
    if (isExpired) return 'destructive'
    if (isExpiringSoon) return 'warning'
    return 'success'
  }

  const getStatusIcon = () => {
    if (isExpired) return AlertTriangle
    if (isExpiringSoon) return Clock
    return Shield
  }

  const StatusIcon = getStatusIcon()

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-xl shadow-lg border',
      subscription.isActive
        ? 'bg-gradient-to-br from-chart-3/12 to-chart-3/8 border-chart-3/20'
        : 'bg-gradient-to-br from-destructive/12 to-destructive/8 border-destructive/20'
    )}>
      {/* Enhanced background elements for visual appeal */}
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl',
        subscription.isActive
          ? 'bg-gradient-to-br from-chart-3/15 to-chart-3/30'
          : 'bg-gradient-to-br from-destructive/15 to-destructive/30'
      )}></div>
      <div className='absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-chart-2/15 to-chart-4/20 rounded-full blur-2xl'></div>
      <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5'></div>

      <CardHeader className='relative pb-[calc(var(--spacing)*4)]'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-[calc(var(--spacing)*3)]'>
            <div className={cn(
              'p-[calc(var(--spacing)*2)] rounded-lg bg-gradient-to-r shadow-lg',
              subscription.isActive
                ? 'from-chart-3 to-chart-2'
                : 'from-destructive to-red-600'
            )}>
              <Crown className='h-5 w-5 text-white' />
            </div>
            <div>
              <CardTitle className='text-lg font-bold tracking-tight'>
                {subscription.pack}
              </CardTitle>
              <CardDescription className='flex items-center gap-[calc(var(--spacing)*2)] text-sm'>
                <div className='p-[calc(var(--spacing)*0.5)] bg-chart-3/20 rounded-full'>
                  <Star className='h-3 w-3 fill-current text-chart-3' />
                </div>
                Premium Access
              </CardDescription>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-[calc(var(--spacing)*1)] px-[calc(var(--spacing)*2)] py-[calc(var(--spacing)*1)] font-medium',
              subscription.isActive
                ? 'bg-chart-2/10 text-chart-2 border-chart-2/30'
                : 'bg-destructive/10 text-destructive border-destructive/30'
            )}
          >
            <StatusIcon className='h-3 w-3' />
            {subscription.isActive ? 'Active' : 'Expired'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='relative space-y-[calc(var(--spacing)*6)]'>
        {/* Enhanced Subscription Timeline */}
        <div className='space-y-[calc(var(--spacing)*3)] bg-gradient-to-r from-background/50 to-card/30 rounded-lg p-[calc(var(--spacing)*4)] border border-border/30'>
          <div className='flex items-center justify-between text-sm leading-relaxed'>
            <span className='text-muted-foreground font-medium flex items-center gap-[calc(var(--spacing)*2)]'>
              <div className={cn(
                'p-[calc(var(--spacing)*1)] rounded-full',
                subscription.isActive ? 'bg-chart-2/20' : 'bg-destructive/20'
              )}>
                <Clock className={cn(
                  'h-3 w-3',
                  subscription.isActive ? 'text-chart-2' : 'text-destructive'
                )} />
              </div>
              Subscription Progress
            </span>
            <span className={cn(
              'font-semibold tracking-tight',
              subscription.isActive ? 'text-chart-2' : 'text-destructive'
            )}>
              {subscription.isActive ? `${daysLeft} days left` : 'Expired'}
            </span>
          </div>

          <Progress
            value={progressPercentage}
            className={cn(
              'h-3',
              isExpiringSoon ? 'bg-chart-3/20' : isExpired ? 'bg-destructive/20' : 'bg-chart-2/20'
            )}
          />

          <div className='flex items-center justify-between text-xs text-muted-foreground font-medium leading-relaxed'>
            <span>Started</span>
            <span>Expires {format(expiry, 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Enhanced Key Information */}
        <div className='grid grid-cols-2 gap-[calc(var(--spacing)*3)]'>
          <div className='group bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-lg p-[calc(var(--spacing)*3)] text-center border border-chart-3/20 hover:border-chart-3/30 transition-all'>
            <div className='flex items-center justify-center mb-[calc(var(--spacing)*1)]'>
              <div className='p-[calc(var(--spacing)*1)] bg-chart-3/20 rounded-full'>
                <Calendar className='h-3 w-3 text-chart-3' />
              </div>
            </div>
            <div className='space-y-[calc(var(--spacing)*1)]'>
              <div className='text-xs text-muted-foreground font-medium leading-relaxed'>Expiry Date</div>
              <div className='font-semibold text-sm tracking-tight'>{format(expiry, 'MMM dd')}</div>
            </div>
          </div>

          <div className='group bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-lg p-[calc(var(--spacing)*3)] text-center border border-chart-2/20 hover:border-chart-2/30 transition-all'>
            <div className='flex items-center justify-center mb-[calc(var(--spacing)*1)]'>
              <div className='p-[calc(var(--spacing)*1)] bg-chart-2/20 rounded-full'>
                <Clock className='h-3 w-3 text-chart-2' />
              </div>
            </div>
            <div className='space-y-[calc(var(--spacing)*1)]'>
              <div className='text-xs text-muted-foreground font-medium leading-relaxed'>Time Left</div>
              <div className='font-semibold text-sm tracking-tight'>
                {subscription.isActive
                  ? `${monthsLeft}m ${daysLeft % 30}d`
                  : 'Expired'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Status Messages */}
        {isExpiringSoon && (
          <div className='bg-gradient-to-r from-chart-3/15 to-orange-500/15 border border-chart-3/30 rounded-lg p-[calc(var(--spacing)*4)] shadow-sm'>
            <div className='flex items-center gap-[calc(var(--spacing)*2)] text-chart-3 mb-[calc(var(--spacing)*2)]'>
              <div className='p-[calc(var(--spacing)*1)] bg-chart-3/20 rounded-full'>
                <AlertTriangle className='h-4 w-4' />
              </div>
              <span className='text-sm font-semibold'>Expiring Soon!</span>
            </div>
            <p className='text-sm text-muted-foreground font-medium leading-relaxed'>
              Your subscription expires in {daysLeft} days. Renew now to avoid interruption. ⚡
            </p>
          </div>
        )}

        {isExpired && (
          <div className='bg-gradient-to-r from-destructive/15 to-red-500/15 border border-destructive/30 rounded-lg p-[calc(var(--spacing)*4)] shadow-sm'>
            <div className='flex items-center gap-[calc(var(--spacing)*2)] text-destructive mb-[calc(var(--spacing)*2)]'>
              <div className='p-[calc(var(--spacing)*1)] bg-destructive/20 rounded-full'>
                <AlertTriangle className='h-4 w-4' />
              </div>
              <span className='text-sm font-semibold'>Subscription Expired</span>
            </div>
            <p className='text-sm text-muted-foreground font-medium leading-relaxed'>
              Renew your subscription to continue accessing premium features. 🔄
            </p>
          </div>
        )}

        {subscription.isActive && !isExpiringSoon && !subscription.isFree && (
          <div className='bg-gradient-to-r from-chart-2/15 to-green-500/15 border border-chart-2/30 rounded-lg p-[calc(var(--spacing)*4)] shadow-sm'>
            <div className='flex items-center gap-[calc(var(--spacing)*2)] text-chart-2 mb-[calc(var(--spacing)*2)]'>
              <div className='p-[calc(var(--spacing)*1)] bg-chart-2/20 rounded-full'>
                <Shield className='h-4 w-4' />
              </div>
              <span className='text-sm font-semibold'>All Access Active</span>
            </div>
            <p className='text-sm text-muted-foreground font-medium leading-relaxed'>
              Enjoy unlimited access to all premium features and content. ✨
            </p>
          </div>
        )}

        {subscription.isActive && subscription.isFree && (
          <div className='bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-500/30 rounded-lg p-[calc(var(--spacing)*4)] shadow-sm'>
            <div className='flex items-center gap-[calc(var(--spacing)*2)] text-blue-600 mb-[calc(var(--spacing)*2)]'>
              <div className='p-[calc(var(--spacing)*1)] bg-blue-500/20 rounded-full'>
                <Gift className='h-4 w-4' />
              </div>
              <span className='text-sm font-semibold'>Free Plan Active</span>
            </div>
            <p className='text-sm text-muted-foreground font-medium leading-relaxed'>
              Upgrade to unlock premium features and unlimited access. 🚀
            </p>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className='flex gap-[calc(var(--spacing)*2)] pt-[calc(var(--spacing)*2)]'>
          <Button
            size='sm'
            className={cn(
              'flex-1 font-semibold tracking-tight shadow-lg hover:shadow-xl transition-all duration-300',
              isExpired || isExpiringSoon || subscription.isFree
                ? 'bg-gradient-to-r from-primary to-blue-600 hover:opacity-90'
                : 'bg-gradient-to-r from-chart-3 to-chart-2 hover:opacity-90'
            )}
            onClick={() => window.location.href = '/student/subscriptions'}
          >
            {isExpired || isExpiringSoon ? (
              <>
                <Zap className='h-4 w-4 mr-[calc(var(--spacing)*2)]' />
                Renew Now
              </>
            ) : subscription.isFree ? (
              <>
                <ArrowUpRight className='h-4 w-4 mr-[calc(var(--spacing)*2)]' />
                Upgrade Plan
              </>
            ) : (
              <>
                <Gift className='h-4 w-4 mr-[calc(var(--spacing)*2)]' />
                Manage Plan
              </>
            )}
          </Button>

          <Button size='sm' variant='outline' className='bg-card/50 backdrop-blur-sm border-border/50 hover:border-border/70 transition-all'>
            <ArrowUpRight className='h-4 w-4 mr-[calc(var(--spacing)*2)]' />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}