/**
 * SSRF Guard unit tests — Sprint 10 / Phase D Task #20.
 *
 * 검증 범위:
 *  - IPv4 사설/예약 IP 검출 (RFC 1918, loopback, link-local, AWS metadata, multicast, CGNAT)
 *  - IPv6 사설/예약 IP 검출 (::1, fe80::, fc00::, multicast, IPv4-mapped)
 *  - hostname 패턴 차단 (localhost, *.local, *.internal, *.lan)
 *  - IP literal 직접 검증
 */
import { describe, it, expect } from 'vitest';

import { isPrivateIPv4, isPrivateIPv6, isPrivateIp, isHostnamePrivate } from './ssrf-guard';

describe('isPrivateIPv4', () => {
  it('detects 10.0.0.0/8 (private)', () => {
    expect(isPrivateIPv4('10.0.0.1')).toBe(true);
    expect(isPrivateIPv4('10.255.255.255')).toBe(true);
  });

  it('detects 172.16.0.0/12 (private)', () => {
    expect(isPrivateIPv4('172.16.0.1')).toBe(true);
    expect(isPrivateIPv4('172.31.255.255')).toBe(true);
    expect(isPrivateIPv4('172.15.0.1')).toBe(false); // 경계 외부
    expect(isPrivateIPv4('172.32.0.1')).toBe(false); // 경계 외부
  });

  it('detects 192.168.0.0/16 (private)', () => {
    expect(isPrivateIPv4('192.168.0.1')).toBe(true);
    expect(isPrivateIPv4('192.168.255.255')).toBe(true);
  });

  it('detects 127.0.0.0/8 (loopback)', () => {
    expect(isPrivateIPv4('127.0.0.1')).toBe(true);
    expect(isPrivateIPv4('127.255.255.255')).toBe(true);
  });

  it('detects 169.254.0.0/16 (link-local incl AWS metadata 169.254.169.254)', () => {
    expect(isPrivateIPv4('169.254.169.254')).toBe(true);
    expect(isPrivateIPv4('169.254.0.1')).toBe(true);
  });

  it('detects 100.64.0.0/10 (CGNAT)', () => {
    expect(isPrivateIPv4('100.64.0.1')).toBe(true);
    expect(isPrivateIPv4('100.127.255.255')).toBe(true);
    expect(isPrivateIPv4('100.63.0.1')).toBe(false);
    expect(isPrivateIPv4('100.128.0.1')).toBe(false);
  });

  it('detects 0.0.0.0/8', () => {
    expect(isPrivateIPv4('0.0.0.0')).toBe(true);
    expect(isPrivateIPv4('0.255.255.255')).toBe(true);
  });

  it('detects multicast 224.0.0.0/4 + reserved 240.0.0.0/4', () => {
    expect(isPrivateIPv4('224.0.0.1')).toBe(true);
    expect(isPrivateIPv4('239.255.255.255')).toBe(true);
    expect(isPrivateIPv4('240.0.0.1')).toBe(true);
    expect(isPrivateIPv4('255.255.255.255')).toBe(true);
  });

  it('detects TEST-NETs (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24)', () => {
    expect(isPrivateIPv4('192.0.2.1')).toBe(true);
    expect(isPrivateIPv4('198.51.100.1')).toBe(true);
    expect(isPrivateIPv4('203.0.113.1')).toBe(true);
  });

  it('allows public IPv4', () => {
    expect(isPrivateIPv4('8.8.8.8')).toBe(false); // Google DNS
    expect(isPrivateIPv4('1.1.1.1')).toBe(false); // Cloudflare DNS
    expect(isPrivateIPv4('142.250.190.46')).toBe(false); // google.com
  });

  it('rejects malformed IPv4', () => {
    expect(isPrivateIPv4('not-an-ip')).toBe(false);
    expect(isPrivateIPv4('256.256.256.256')).toBe(false);
    expect(isPrivateIPv4('1.2.3')).toBe(false);
  });
});

describe('isPrivateIPv6', () => {
  it('detects ::1 (loopback)', () => {
    expect(isPrivateIPv6('::1')).toBe(true);
  });

  it('detects fe80::/10 (link-local)', () => {
    expect(isPrivateIPv6('fe80::1')).toBe(true);
    expect(isPrivateIPv6('FE80::abcd')).toBe(true);
  });

  it('detects fc00::/7 (unique-local)', () => {
    expect(isPrivateIPv6('fc00::1')).toBe(true);
    expect(isPrivateIPv6('fd00::1')).toBe(true);
  });

  it('detects multicast ff00::/8', () => {
    expect(isPrivateIPv6('ff02::1')).toBe(true);
  });

  it('detects IPv4-mapped IPv6 (::ffff:a.b.c.d)', () => {
    expect(isPrivateIPv6('::ffff:127.0.0.1')).toBe(true);
    expect(isPrivateIPv6('::ffff:192.168.1.1')).toBe(true);
    expect(isPrivateIPv6('::ffff:8.8.8.8')).toBe(false); // public via mapping
  });

  it('allows public IPv6', () => {
    expect(isPrivateIPv6('2606:4700:4700::1111')).toBe(false); // Cloudflare DNS
    expect(isPrivateIPv6('2001:4860:4860::8888')).toBe(false); // Google DNS
  });

  it('rejects non-IPv6 strings', () => {
    expect(isPrivateIPv6('not-an-ip')).toBe(false);
    expect(isPrivateIPv6('192.168.0.1')).toBe(false);
  });
});

describe('isPrivateIp (combined)', () => {
  it('routes to v4 / v6 correctly', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('::1')).toBe(true);
    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('2606:4700:4700::1111')).toBe(false);
  });
});

describe('isHostnamePrivate — patterns', () => {
  it('blocks localhost', async () => {
    expect(await isHostnamePrivate('localhost')).toBe(true);
    expect(await isHostnamePrivate('LOCALHOST')).toBe(true);
  });

  it('blocks *.local', async () => {
    expect(await isHostnamePrivate('mac.local')).toBe(true);
  });

  it('blocks *.internal', async () => {
    expect(await isHostnamePrivate('api.internal')).toBe(true);
  });

  it('blocks *.lan', async () => {
    expect(await isHostnamePrivate('router.lan')).toBe(true);
  });

  it('blocks IP literal for private ranges', async () => {
    expect(await isHostnamePrivate('127.0.0.1')).toBe(true);
    expect(await isHostnamePrivate('192.168.1.1')).toBe(true);
    expect(await isHostnamePrivate('169.254.169.254')).toBe(true);
    expect(await isHostnamePrivate('[::1]')).toBe(true);
  });

  it('blocks empty hostname', async () => {
    expect(await isHostnamePrivate('')).toBe(true);
    expect(await isHostnamePrivate('   ')).toBe(true);
  });
});
