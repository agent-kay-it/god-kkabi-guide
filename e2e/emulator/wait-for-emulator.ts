/**
 * Sprint 14 / F14-A — Emulator readiness 폴링.
 *
 * firebase emulators:start 는 백그라운드로 띄워지므로 globalSetup 이
 * 실제로 연결 가능한 시점까지 대기해야 함.
 */
import net from 'node:net';

interface EmulatorPort {
  readonly name: string;
  readonly port: number;
}

const DEFAULT_PORTS: readonly EmulatorPort[] = [
  { name: 'auth', port: 9099 },
  { name: 'firestore', port: 8080 },
  { name: 'storage', port: 9199 },
  { name: 'database', port: 9000 },
];

function probePort(port: number, timeoutMs = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onDone = (ok: boolean) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => onDone(true));
    socket.once('error', () => onDone(false));
    socket.once('timeout', () => onDone(false));
    socket.connect(port, '127.0.0.1');
  });
}

export async function waitForEmulators(
  ports: readonly EmulatorPort[] = DEFAULT_PORTS,
  maxAttempts = 60,
  intervalMs = 1000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const probes = await Promise.all(
      ports.map(async (p) => ({ ...p, alive: await probePort(p.port) })),
    );
    const dead = probes.filter((p) => !p.alive);
    if (dead.length === 0) {
       
      console.log(`[emulator] All ports ready (attempt ${attempt})`);
      return;
    }
    if (attempt === 1 || attempt % 5 === 0) {
       
      console.log(
        `[emulator] Waiting on ${dead.map((p) => `${p.name}:${p.port}`).join(', ')} (attempt ${attempt}/${maxAttempts})`,
      );
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(
    `Emulators not ready after ${maxAttempts}s. Start with: pnpm exec firebase emulators:start --only auth,firestore,storage,database --project demo-kkaebizigi-test`,
  );
}
