/**
 * Runtime patch for jito-ts / rpc-websockets compatibility
 * 
 * This module patches the rpc-websockets import issue caused by jito-ts
 * bundling an old @solana/web3.js version.
 * 
 * Issue: jito-ts uses @solana/web3.js@1.77.4 which expects 
 * rpc-websockets/dist/lib/client.js but modern rpc-websockets uses .cjs extensions
 * 
 * Solution: This patch must be imported BEFORE any code that uses jito-ts.
 * It will copy .cjs files to .js files at module load time.
 */

import { existsSync, copyFileSync } from 'fs';
import { join } from 'path';

// Only apply patch in Node.js environment (not browser)
if (typeof process !== 'undefined' && process.versions?.node) {
  try {
    const possiblePaths = [
      // npm install location
      'rpc-websockets/dist/lib',
      // Monorepo location
      '../../node_modules/rpc-websockets/dist/lib',
      // pnpm location
      '../rpc-websockets/dist/lib',
    ];

    for (const relativePath of possiblePaths) {
      try {
        const libPath = join(process.cwd(), 'node_modules', relativePath);
        
        if (existsSync(libPath)) {
          const files = [
            { src: 'client.cjs', dest: 'client.js' },
            { src: 'server.cjs', dest: 'server.js' },
          ];

          for (const { src, dest } of files) {
            const srcPath = join(libPath, src);
            const destPath = join(libPath, dest);

            if (existsSync(srcPath) && !existsSync(destPath)) {
              copyFileSync(srcPath, destPath);
              // Console log removed for production
            }
          }
          break; // Found and patched, stop searching
        }
      } catch {
        // Continue to next path
      }
    }
  } catch {
    // Silently fail - patching is best-effort
  }
}

export {}; // Make this a module
