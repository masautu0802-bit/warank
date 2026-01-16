'use client';

import type { ComedianWithPoints } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface RankingSidebarProps {
  rankings: ComedianWithPoints[];
}

// アニメーション設定
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

const rankBadgeVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

export function RankingSidebar({ rankings }: RankingSidebarProps) {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">ランキング TOP 10</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm touch-manipulation">
            <Link href="/rankings">すべて見る</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <motion.div
          className="space-y-2 sm:space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {rankings.map((comedian, index) => {
            const getRankBadgeVariant = (rank: number) => {
              if (rank === 1) return 'default';
              if (rank === 2) return 'secondary';
              if (rank === 3) return 'outline';
              return 'outline';
            };

            return (
              <motion.div
                key={comedian.id}
                variants={itemVariants}
                whileHover={{
                  x: 8,
                  transition: { duration: 0.2 },
                }}
              >
                <Link
                  href={`/comedian/${comedian.id}`}
                  className="flex items-center gap-2 sm:gap-3 p-2 rounded-md hover:bg-accent active:bg-accent transition-colors touch-manipulation group"
                >
                  {comedian.rank <= 3 ? (
                    <motion.div variants={rankBadgeVariants}>
                      <Badge
                        variant={getRankBadgeVariant(comedian.rank)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold p-0 shrink-0"
                      >
                        {comedian.rank}
                      </Badge>
                    </motion.div>
                  ) : (
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-xs sm:text-sm">
                      {comedian.rank}
                    </div>
                  )}
                  {comedian.image_url ? (
                    <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                      <AvatarImage src={comedian.image_url} alt={comedian.name} />
                      <AvatarFallback className="text-xs">
                        {comedian.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                      <AvatarFallback className="text-xs">
                        {comedian.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                      {comedian.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {comedian.totalPoints.toLocaleString()}pt
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}
