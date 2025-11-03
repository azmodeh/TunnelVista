'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Edit, Trash2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useDeleteUser } from '@/hooks/use-users';
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
import { Progress } from '../ui/progress';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { Checkbox } from '../ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { fadeInUpVariants, containerVariants } from '@/lib/animations';
import { useUser } from '@/firebase/auth/use-user';


type UserStatus = 'active' | 'expired' | 'suspended';

const statusStyles: Record<UserStatus, string> = {
  active: 'bg-teal-500/20 text-teal-300 border-teal-400',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500',
  suspended: 'bg-yellow-500/20 text-yellow-300 border-yellow-400',
};

const UserRow: React.FC<{ 
    user: User; 
    onEdit: (d: User) => void;
    isSelected: boolean;
    onSelect: (id: string) => void;
}> = React.memo(
  ({ user, onEdit, isSelected, onSelect }) => {
    const deleteUserMutation = useDeleteUser();
    const quotaPercentage = user.isVip || user.quota === Infinity || !user.quota ? 100 : (user.quotaUsed / user.quota) * 100;
    const expirationDate = user.expiration ? (user.expiration as any).toDate() : null;
    const isExpired = expirationDate && new Date(expirationDate) < new Date();
    const daysRemaining = user.isVip ? null : (expirationDate ? differenceInDays(new Date(expirationDate), new Date()) : null);
    
    const { isAdmin } = useUser();
    
    let daysRemainingColor = 'text-green-400';
    if (daysRemaining !== null) {
      if (daysRemaining < 7) daysRemainingColor = 'text-red-400';
      else if (daysRemaining < 30) daysRemainingColor = 'text-yellow-400';
    }


    return (
      <motion.tr
        className={cn(
          'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted/50'
        )}
        data-state={isSelected ? 'selected' : 'unselected'}
        layout
        variants={fadeInUpVariants}
        exit={{ opacity: 0 }}
      >
        <TableCell className="p-2">
            <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(user.id)}
            />
        </TableCell>
        <TableCell>
          <div className="font-medium flex items-center gap-2">
            {user.isVip && <Crown className="h-4 w-4 text-yellow-400" />}
            <span className="truncate max-w-[150px]">{user.username}</span>
          </div>
        </TableCell>
        <TableCell><span className="truncate max-w-[200px]">{user.email}</span></TableCell>
        <TableCell>
          <div className="flex flex-col gap-1.5 w-32">
            {user.isVip || user.quota === Infinity ? (
               <span className="text-sm text-yellow-400 font-bold">Unlimited</span>
            ) : (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Progress value={quotaPercentage} className="h-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{quotaPercentage.toFixed(1)}% used</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-xs text-muted-foreground">
                  {user.quotaUsed?.toFixed(1) || 0} / {user.quota || 'N/A'} GB
                </span>
              </>
            )}
          </div>
        </TableCell>
        <TableCell>
           <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex flex-col">
                    {expirationDate && <span>{format(new Date(expirationDate), 'MMM d, yyyy')}</span>}
                    <span className={cn("text-xs", isExpired ? 'text-red-500' : daysRemainingColor)}>
                      {user.isVip ? "Permanent" : (isExpired
                        ? `Expired ${expirationDate ? formatDistanceToNow(new Date(expirationDate), { addSuffix: true }) : ''}`
                        : `${daysRemaining} days remaining`)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expires on {expirationDate ? format(new Date(expirationDate), 'PPPP') : 'N/A'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={cn('capitalize', statusStyles[user.status])}
          >
            {user.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    className="hover:text-teal-400"
                    disabled={!isAdmin}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              {!isAdmin && <TooltipContent><p>Only Admins can edit users.</p></TooltipContent>}
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-500"
                          disabled={!isAdmin}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          user account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </span>
              </TooltipTrigger>
              {!isAdmin && <TooltipContent><p>Only Admins can delete users.</p></TooltipContent>}
            </Tooltip>
          </TooltipProvider>

        </TableCell>
      </motion.tr>
    );
  }
);
UserRow.displayName = 'UserRow';



export const UserTable: React.FC<{
  users: User[];
  onEdit: (d: User) => void;
  selectedUsers: string[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  toggleAll: () => void;
}> = ({ users, onEdit, selectedUsers, setSelectedUsers, toggleAll }) => {
    
  const handleSelect = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
    );
  }

  const allUsers = useMemo(() => users, [users]);
  
  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="glass-card"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-2">
                <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleAll}
                    data-state={isIndeterminate ? 'indeterminate' : (isAllSelected ? 'checked' : 'unchecked')}
                />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Quota</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <motion.tbody
            variants={containerVariants}
        >
            <AnimatePresence>
              {allUsers.map((user) => (
                <UserRow 
                    key={user.id} 
                    user={user} 
                    onEdit={onEdit}
                    isSelected={selectedUsers.includes(user.id)}
                    onSelect={handleSelect}
                />
              ))}
            </AnimatePresence>
            {allUsers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        No users found matching your criteria.
                    </TableCell>
                </TableRow>
            )}
        </motion.tbody>
      </Table>
    </motion.div>
  );
};