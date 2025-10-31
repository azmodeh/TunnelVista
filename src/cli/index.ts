#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';

config();

// --- Firebase Admin SDK (Commented out until configured) ---
/*
import * as admin from 'firebase-admin';

// TODO: Set up Firebase Admin SDK
// 1. Download your service account key JSON from Firebase Console
// 2. Set the GOOGLE_APPLICATION_CREDENTIALS environment variable:
//    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
// 3. Uncomment the following lines:

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log(chalk.red('Error: Firebase Admin SDK credentials not found.'));
    console.log(chalk.yellow('Please set the GOOGLE_APPLICATION_CREDENTIALS environment variable.'));
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();
console.log(chalk.green('Firebase Admin SDK initialized successfully.'));
*/

const program = new Command();

program
  .version('1.0.0')
  .description(chalk.cyan('A CLI for managing the TunnelVista system'));

const showNotImplemented = () => {
  console.log(chalk.yellow('Warning: This command is not fully implemented yet.'));
  console.log(chalk.yellow('Requires Firebase Admin SDK setup.'));
};


// Device Commands
const deviceCommand = program.command('device')
  .description('Manage devices');

deviceCommand
  .command('list')
  .description('List all devices')
  .action(async () => {
    showNotImplemented();
    // TODO: Implement logic to fetch and list devices from Firestore
    // const devicesSnapshot = await db.collection('devices').get();
    // devicesSnapshot.forEach(doc => console.log(doc.data()));
  });

deviceCommand
  .command('add')
  .description('Add a new device')
  .requiredOption('-n, --name <name>', 'Device name')
  .requiredOption('-i, --ip <ip>', 'Device IP address')
  .requiredOption('-t, --type <type>', 'Device type (mikrotik or linux)')
  .requiredOption('-u, --username <username>', 'Username for device access')
  .action(async (options) => {
     showNotImplemented();
     // TODO: Implement logic to add a new device to Firestore
     /*
     const newDevice = { ... };
     await db.collection('devices').add(newDevice);
     console.log(chalk.green(`Device "${options.name}" added successfully.`));
     */
  });


// Tunnel Commands
const tunnelCommand = program.command('tunnel')
    .description('Manage VPN tunnels');

tunnelCommand
    .command('list')
    .description('List all VPN tunnels')
    .action(async () => {
        showNotImplemented();
        // TODO: Implement logic to fetch and list tunnels
    });


// User Commands
const userCommand = program.command('user')
    .description('Manage users');

userCommand
    .command('list')
    .description('List all users')
    .action(async () => {
        showNotImplemented();
         // TODO: Implement logic to fetch and list users
    });


program
  .command('hello')
  .description('Prints a hello message')
  .action(() => {
    console.log(chalk.green('Hello from the TunnelVista CLI!'));
    console.log(chalk.gray('Run --help to see available commands.'));
  });
  
// Initial warning if SDK is not configured
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    program.addHelpText('before', chalk.yellow('Firebase Admin not configured. Most commands are disabled.\nSet GOOGLE_APPLICATION_CREDENTIALS to enable database interaction.\n'));
}


program.parse(process.argv);
