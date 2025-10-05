/**
 * The Heartbeat - Core rhythm of the Operator Network
 *
 * This is where it all begins. Every transaction, every fee route,
 * every dashboard update - they all synchronize to this fundamental pulse.
 *
 * The network breathes with this rhythm.
 */

import { route } from './route';

// The first pulse of the Operator Network
setInterval(() => console.log("tick..."), 1000);

// Fee routing pulse - every 5 seconds
setInterval(() => {
    const transactionAmount = 100 + Math.random() * 900; // Random amount between 100-1000
    route(transactionAmount);
}, 5000);