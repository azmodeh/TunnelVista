'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddUser, useUpdateUser } from '@/hooks/use-users';
import type { User, Role } from '@/lib/types';
import { X, CalendarIcon } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, addDays } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { modalContentVariants, modalOverlayVariants } from '@/lib/animations';


const userSchema = z.object({
  username: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'operator', 'user']),
  isVip: z.boolean().default(false),
  quota: z.coerce.number().min(0, 'Quota must be a positive number'),
  expiration: z.date().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, user }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      role: 'user',
      quota: 100,
      isVip: false,
      expiration: addDays(new Date(), 30),
    },
  });
  
  const isVip = watch('isVip');

  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          quota: user.quota === Infinity ? 0 : user.quota,
          isVip: user.isVip || false,
          expiration: user.expiration ? (user.expiration as any).toDate() : undefined,
        });
      } else {
        reset({
          username: '',
          email: '',
          role: 'user',
          quota: 100,
          isVip: false,
          expiration: addDays(new Date(), 30),
        });
      }
    }
  }, [user, isOpen, reset]);
  
  useEffect(() => {
    if(isVip) {
      setValue('quota', Infinity);
    } else {
      // If unchecking VIP, set a default quota if it was Infinity
      const currentQuota = watch('quota');
      if (currentQuota === Infinity) {
        setValue('quota', 100);
      }
    }
  }, [isVip, setValue, watch]);

  const onSubmit = (data: UserFormData) => {
    const submissionData: Partial<User> = {
      ...data,
      quota: data.isVip ? Infinity : data.quota,
      expiration: data.expiration,
    }

    if (user) {
      updateUserMutation.mutate({ ...user, ...submissionData });
    } else {
      const newUser: Omit<User, 'id' | 'quotaUsed' | 'status'> = {
        ...(submissionData as any),
      };
      addUserMutation.mutate(newUser);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalContentVariants}
            className="bg-[#0A0A0C]/90 p-8 rounded-xl border border-purple-teal-gradient relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X />
            </button>
            <h2 className="text-2xl font-headline text-white mb-6">
              {user ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-300">
                  Name
                </Label>
                <Input
                  id="username"
                  {...register('username')}
                  className="bg-transparent text-white"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  {...register('email')}
                  className="bg-transparent text-white"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              
                <div>
                  <Label className="text-gray-300">Role</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="operator">Operator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              
              <div className="flex items-center space-x-2 pt-2">
                 <Controller
                  name="isVip"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isVip"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="isVip" className="text-gray-300">
                  VIP User (Unlimited Quota)
                </Label>
              </div>

              <div>
                <Label htmlFor="quota" className="text-gray-300">
                  Quota (GB)
                </Label>
                <Input
                  id="quota"
                  type="number"
                  {...register('quota')}
                  className="bg-transparent text-white"
                  disabled={isVip}
                  placeholder={isVip ? 'Unlimited' : 'e.g., 100'}
                />
                {errors.quota && !isVip && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.quota.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="expiration" className="text-gray-300">Expiration Date</Label>
                 <Controller
                  name="expiration"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.expiration && <p className="text-red-500 text-xs mt-1">{errors.expiration.message}</p>}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-[#0A0A0C]/50 border-teal-gradient hover:shadow-[0_0_15px_rgba(39,174,96,0.5)] rounded-lg"
                >
                  {user ? 'Save Changes' : 'Add User'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserForm;