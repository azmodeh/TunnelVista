'use client';

import React, { memo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const roles = [
    { 
        id: 'role-1', 
        name: 'Admin', 
        description: 'Full access to all system features and settings. Can manage users, devices, and system-level configurations.', 
        permissions: ['read:all', 'write:all', 'delete:all'] 
    },
    { 
        id: 'role-2', 
        name: 'Operator', 
        description: 'Can manage and monitor network resources. Cannot manage users or system-level settings.', 
        permissions: ['read:all', 'write:devices', 'write:tunnels', 'write:vpn_configs'] 
    },
    { 
        id: 'role-3', 
        name: 'User', 
        description: 'Read-only access to view all dashboards and configurations. Cannot make any changes.', 
        permissions: ['read:all'] 
    },
];

export const RbacSettings = memo(() => {
  return (
     <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Role-Based Access Control</CardTitle>
          <CardDescription>
            System roles and their associated permissions.
          </CardDescription>
        </div>
         <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button disabled={true}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Custom Role
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent><p>Custom roles are defined in code.</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((roleItem) => (
              <TableRow key={roleItem.id}>
                <TableCell className="font-semibold">{roleItem.name}</TableCell>
                <TableCell>{roleItem.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {roleItem.permissions.map(p => <Badge key={p} variant="secondary">{p.replace(/:/g, ' ')}</Badge>)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                   <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                           <Button variant="ghost" size="icon" disabled={true}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent><p>Built-in roles cannot be edited.</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button variant="ghost" size="icon" disabled={true}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                       <TooltipContent><p>Built-in roles cannot be deleted.</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
});
RbacSettings.displayName = 'RbacSettings';