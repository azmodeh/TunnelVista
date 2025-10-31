'use client';

import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Calendar, Crown, File, ShieldOff, Trash2 } from 'lucide-react';
import { useBulkActionUsers } from '@/hooks/use-users';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { bulkActionsVariants } from '@/lib/animations';
import { useUser } from '@/firebase/auth/use-user';

interface UserBulkActionsProps {
  selectedUserIds: string[];
  onAction: () => void;
}

export function UserBulkActions({ selectedUserIds, onAction }: UserBulkActionsProps) {
  const bulkActionMutation = useBulkActionUsers();
  
  const { isAdmin } = useUser();

  const handleBulkAction = (action: 'extend' | 'delete' | 'disable' | 'upgrade-vip') => {
    if (!isAdmin) return;
    bulkActionMutation.mutate({ userIds: selectedUserIds, action, days: action === 'extend' ? 30 : undefined });
    onAction();
  };

  const renderButton = (
    action: 'extend' | 'delete' | 'disable' | 'upgrade-vip',
    label: string,
    icon: React.ElementType,
    variant: "outline" | "destructive",
    className?: string
  ) => {
    const Icon = icon;
    return (
       <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant={variant} className={className} disabled={!isAdmin}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will perform the '{label}' action on {selectedUserIds.length} selected users. This action may not be reversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleBulkAction(action)} className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </span>
          </TooltipTrigger>
          {!isAdmin && <TooltipContent><p>Only Admins can perform bulk actions.</p></TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <motion.div
      variants={bulkActionsVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="flex items-center gap-2"
    >
      <span className="text-sm font-medium text-muted-foreground">{selectedUserIds.length} selected</span>
      
      {renderButton('extend', 'Extend (+30d)', Calendar, 'outline', 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300')}
      {renderButton('upgrade-vip', 'Upgrade to VIP', Crown, 'outline', 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300')}
      {renderButton('disable', 'Disable', ShieldOff, 'outline', 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300')}
      {renderButton('delete', 'Delete', Trash2, 'destructive')}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
                <Button variant="ghost" size="sm" disabled={true}>
                  <File className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent><p>This feature is not yet implemented.</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}
