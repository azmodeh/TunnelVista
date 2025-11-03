'use client';

import React, { useState, Suspense, lazy, useMemo } from 'react';
import { useUsers } from '@/hooks/use-users';
import { UserTable } from '@/components/users/UserTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { User, Role } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { UserBulkActions } from '@/components/users/UserBulkActions';
import { AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/firebase/auth/use-user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const UserForm = lazy(() => import('@/components/users/UserForm'));

export default function UsersView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Role | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isAdmin } = useUser();

  const { data, isLoading, isError } = useUsers();
  const allUsers = data?.users ?? [];
  
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const matchesTab = activeTab === 'all' || user.role === activeTab;
      const matchesSearch = 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [allUsers, activeTab, searchQuery]);


  const handleAddNew = () => {
    if (!isAdmin) return;
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">User Management</h1>
      
       <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Role | 'all')}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="operator">Operators</TabsTrigger>
            <TabsTrigger value="user">Users</TabsTrigger>
          </TabsList>
          <div className="flex-grow md:flex-grow-0">
             <Input 
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center min-h-[40px]">
          <AnimatePresence>
          {selectedUsers.length > 0 && (
            <UserBulkActions 
              selectedUserIds={selectedUsers} 
              onAction={() => setSelectedUsers([])}
            />
          )}
          </AnimatePresence>
          <div className="flex-grow flex justify-end">
            {selectedUsers.length === 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0}>
                      <Button
                        onClick={handleAddNew}
                        className="bg-purple-600/50 border border-purple-400 hover:bg-purple-600/80 text-white rounded-lg"
                        disabled={!isAdmin}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!isAdmin && <TooltipContent><p>Only Admins can add users.</p></TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {isError && (
          <div className="text-red-500 p-4 rounded-md bg-red-900/20 border border-red-500/50">
            Failed to load users. Please try again later.
          </div>
        )}
        {data && (
            <TabsContent value={activeTab} className="mt-0">
              <UserTable 
                  users={filteredUsers} 
                  onEdit={handleEdit} 
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  toggleAll={toggleAll}
              />
            </TabsContent>
      )}
      </Tabs>


      {isModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><Skeleton className="w-full max-w-md h-[70vh]" /></div>}>
          <UserForm
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            user={editingUser}
          />
        </Suspense>
      )}
    </div>
  );
}