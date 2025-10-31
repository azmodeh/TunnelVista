import { LucideIcon } from "lucide-react";
import type { User as AuthUser } from 'firebase/auth';


export type DeviceStatus = 'online' | 'offline' | 'error';
export type DeviceType = 'mikrotik' | 'linux';

export type Device = {
  id: string;
  name: string;
  ip: string;
  type: DeviceType;
  status: DeviceStatus;
  location?: string;
  country_code?: string;
  flag?: string;
  city?: string;
  asn?: string;
  last_seen: any;
  x?: number;
  y?: number;
  ping_ms: number | null;
  ping_status: 'good' | 'slow' | 'down';
  last_ping: string | null;
  username: string;
  password?: string;
  ssh_key?: string;
  api_key?: string;
  tags?: string[];
  cloudflare_subdomain?: string;
  local_ips?: string[];
};

export type Role = 'admin' | 'operator' | 'user';

export type User = Partial<AuthUser> & {
  id: string; 
  username: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended' | 'expired';
  isVip?: boolean;
  quota?: number;
  quotaUsed?: number;
  expiration?: any;
  createdAt: any;
  updatedAt: any;
};

export type VpnTunnelStatus = 'active' | 'inactive';
export const VPN_TUNNEL_PROTOCOLS = [
  'WireGuard',
  'OpenVPN',
  'IKEv2',
  'L2TP',
  'Trojan (WS/Reality)',
  'VLESS (WS)',
  '6TO4',
  'IPIP',
  'GRE',
  'IPIPV6',
  'GRE6',
  'MIX IPIPV6',
] as const;

export type VpnTunnelProtocol = (typeof VPN_TUNNEL_PROTOCOLS)[number];

export type VpnTunnel = {
  id: string;
  sourceDeviceId: string;
  destinationDeviceId: string;
  intermediateDeviceId1?: string;
  intermediateDeviceId2?: string;
  intermediateDeviceId3?: string;
  intermediateDeviceId4?: string;
  protocol: VpnTunnelProtocol;
  status: VpnTunnelStatus;
  autoOptimized?: boolean;
};

export type VpnStatus = 'deployed' | 'pending' | 'failed' | 'undeployed' | 'deploying' | 'restarting';

export const VPN_PROTOCOLS = [
  'WireGuard',
  'OpenVPN',
  'L2TP',
  'IKEv2',
  'Trojan (WS/Reality)',
  'VLESS (WS)',
] as const;

export type VpnProtocol = (typeof VPN_PROTOCOLS)[number];

export const ALL_VPN_PROTOCOLS = [
  'WireGuard',
  'OpenVPN',
  'VLESS (WS)',
  'Shadowsocks',
  'ShadowsocksR',
  'IKEv2',
  'Trojan',
  'L2TP',
] as const;

export type VpnProtocolAll = (typeof ALL_VPN_PROTOCOLS)[number];


export type VpnConfig = {
  id: string;
  deviceId: string;
  protocol: VpnProtocol;
  interfaceName: string;
  listenPort: number;
  allowedIPs: string;
  status: VpnStatus;
  activePeers: number;
};

export type LogLevel = 'info' | 'warning' | 'error' | 'success';

export type Log = {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: any;
};

export type LogAnalysis = {
  id: string;
  deviceId: string;
  logMessage: string;
  analysisResult: string;
  problemDetected: boolean;
  problemDescription: string;
  suggestedSolutions: string;
  timestamp: any;
};

export type Stat = {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: number;
  period?: string;
  trend?: { x: string; y: number }[];
  color?: string;
};

export type AuditLog = {
    id: string;
    userId: string;
    userEmail: string;
    action: string;
    details: string;
    targetId?: string;
    timestamp: any;
};

export type ApiKey = {
    id: string;
    keyId: string;
    hashedKey: string;
    userId: string;
    scope: string;
    expires: string;
    createdAt: any;
};
