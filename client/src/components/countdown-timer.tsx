import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface CountdownTimerProps {
  endDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    if (!endDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const endDateTime = new Date(endDate).getTime();
    
    if (isNaN(endDateTime)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const difference = endDateTime - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-3" data-testid={`timer-${label.toLowerCase()}`}>
      <Card className="relative overflow-hidden p-6 min-w-[90px] md:min-w-[110px] bg-gradient-to-br from-card to-muted/20 border-2 border-primary/20 glow-card-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 animate-gradient-slow"></div>
        <div className="absolute inset-0 bg-grid opacity-5"></div>
        <div className="relative">
          <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tabular-nums glow-text">
            {value.toString().padStart(2, '0')}
          </div>
        </div>
      </Card>
      <div className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 md:gap-6 justify-center flex-wrap">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
