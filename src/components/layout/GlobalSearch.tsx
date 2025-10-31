'use client';

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useState, useEffect, useMemo } from 'react';
import { Search, Server, Users, Network } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useDevices } from "../devices/use-devices";
import { useUsers } from "@/hooks/use-users";
import { useTunnels } from "../tunnels/use-tunnels";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const router = useRouter();

  const { data: deviceData, isLoading: isLoadingDevices } = useDevices();
  const { data: userData, isLoading: isLoadingUsers } = useUsers();
  const { data: tunnelData, isLoading: isLoadingTunnels } = useTunnels();

  const allDevices = deviceData?.devices || [];
  const allUsers = userData?.users || [];
  const allTunnels = tunnelData?.tunnels || [];

  const isLoading = isLoadingDevices || isLoadingUsers || isLoadingTunnels;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])
  
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];

    const lowerCaseQuery = debouncedQuery.toLowerCase();

    const filteredDevices = allDevices
      .filter(d => 
        d.name.toLowerCase().includes(lowerCaseQuery) ||
        d.ip.toLowerCase().includes(lowerCaseQuery)
      )
      .map(d => ({ ...d, type: 'device' }));
      
    const filteredUsers = allUsers
      .filter(u =>
        u.username.toLowerCase().includes(lowerCaseQuery) ||
        u.email.toLowerCase().includes(lowerCaseQuery)
      )
      .map(u => ({ ...u, type: 'user' }));

    const deviceMap = new Map(allDevices.map(d => [d.id, d.name]));
    const filteredTunnels = allTunnels
        .filter(t => {
            const sourceName = deviceMap.get(t.sourceDeviceId)?.toLowerCase() || '';
            const destName = deviceMap.get(t.destinationDeviceId)?.toLowerCase() || '';
            return sourceName.includes(lowerCaseQuery) || destName.includes(lowerCaseQuery);
        })
        .map(t => ({...t, type: 'tunnel'}));


    return [
      ...filteredDevices,
      ...filteredUsers,
      ...filteredTunnels
    ];
  }, [debouncedQuery, allDevices, allUsers, allTunnels]);
  
  const handleSelect = (item: any) => {
      let path = '';
      if(item.type === 'device') path = '/devices';
      if(item.type === 'user') path = '/users';
      if(item.type === 'tunnel') path = '/tunnels';
      
      router.push(path);
      setIsOpen(false);
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <span className="sr-only">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0">
          <Command>
            <CommandInput 
                placeholder="Search devices, users, tunnels..." 
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
              {isLoading && <div className="p-4 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>}
              {!isLoading && debouncedQuery && searchResults.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
              
              <CommandGroup heading="Devices">
                {searchResults.filter(i => i.type === 'device').map(item => (
                    <CommandItem key={item.id} onSelect={() => handleSelect(item)} value={`${item.name} ${item.ip}`}>
                        <Server className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{item.ip}</span>
                    </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Users">
                {searchResults.filter(i => i.type === 'user').map(item => (
                    <CommandItem key={item.id} onSelect={() => handleSelect(item)} value={`${item.username} ${item.email}`}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>{item.username}</span>
                        <span className="text-xs text-muted-foreground ml-2">{item.email}</span>
                    </CommandItem>
                ))}
              </CommandGroup>
               <CommandGroup heading="Tunnels">
                {searchResults.filter(i => i.type === 'tunnel').map(item => (
                    <CommandItem key={item.id} onSelect={() => handleSelect(item)} value={`Tunnel ${item.id}`}>
                        <Network className="mr-2 h-4 w-4" />
                        <span>{item.protocol} Tunnel</span>
                         <span className="text-xs text-muted-foreground ml-2">between {allDevices.find(d => d.id === item.sourceDeviceId)?.name} and {allDevices.find(d => d.id === item.destinationDeviceId)?.name}</span>
                    </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
