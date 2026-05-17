/**
 * OG Parser unit tests — Sprint 10 / Phase D Task #20.
 *
 * 검증 범위:
 *  - og:title / og:description / og:image 우선 추출
 *  - twitter:card fallback
 *  - <title> tag fallback
 *  - entity decoding (&amp; / &quot; 등)
 *  - 비 https image URL drop
 *  - title 없으면 null 반환
 */
import { describe, it, expect } from 'vitest';

import { parseOgFromHtml } from './og-parser';

describe('parseOgFromHtml', () => {
  it('extracts og:title / og:description / og:image', () => {
    const html = `<!DOCTYPE html><html><head>
      <meta property="og:title" content="Example Title">
      <meta property="og:description" content="Example description here.">
      <meta property="og:image" content="https://example.com/image.png">
    </head><body>Hello</body></html>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result).toEqual({
      title: 'Example Title',
      description: 'Example description here.',
      image: 'https://example.com/image.png',
      domain: 'example.com',
    });
  });

  it('falls back to twitter:title / twitter:description / twitter:image', () => {
    const html = `<head>
      <meta name="twitter:title" content="Twitter Title">
      <meta name="twitter:description" content="Twitter desc">
      <meta name="twitter:image" content="https://cdn.example.com/twitter.png">
    </head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.title).toBe('Twitter Title');
    expect(result?.description).toBe('Twitter desc');
    expect(result?.image).toBe('https://cdn.example.com/twitter.png');
  });

  it('falls back to <title> tag if og + twitter absent', () => {
    const html = `<head><title>Plain Title</title></head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.title).toBe('Plain Title');
    expect(result?.description).toBeUndefined();
    expect(result?.image).toBeUndefined();
  });

  it('prefers og:title over twitter:title and <title>', () => {
    const html = `<head>
      <title>Plain</title>
      <meta name="twitter:title" content="Tw">
      <meta property="og:title" content="OG">
    </head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.title).toBe('OG');
  });

  it('falls back to <meta name="description"> for description', () => {
    const html = `<head>
      <title>T</title>
      <meta name="description" content="Generic description">
    </head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.description).toBe('Generic description');
  });

  it('decodes HTML entities in meta content', () => {
    const html = `<head>
      <meta property="og:title" content="A &amp; B&#39;s page &quot;test&quot;">
    </head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.title).toBe(`A & B's page "test"`);
  });

  it('drops non-https image URL (mixed content / SSRF mitigation)', () => {
    const html = `<head>
      <meta property="og:title" content="T">
      <meta property="og:image" content="http://insecure.example.com/img.png">
    </head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.image).toBeUndefined();
  });

  it('drops malformed image URL', () => {
    const html = `<head>
      <meta property="og:title" content="T">
      <meta property="og:image" content="not-a-url">
    </head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.image).toBeUndefined();
  });

  it('returns null when no title is found', () => {
    const html = `<head><meta charset="utf-8"></head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result).toBeNull();
  });

  it('truncates very long title and description', () => {
    const longTitle = 'A'.repeat(300);
    const longDesc = 'B'.repeat(800);
    const html = `<head>
      <meta property="og:title" content="${longTitle}">
      <meta property="og:description" content="${longDesc}">
    </head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.title.length).toBeLessThanOrEqual(200);
    expect((result?.description ?? '').length).toBeLessThanOrEqual(500);
  });

  it('handles single-quote and double-quote attribute styles', () => {
    const html = `<head>
      <meta property='og:title' content='Single Quote'>
      <meta property="og:description" content="Double Quote">
    </head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.title).toBe('Single Quote');
    expect(result?.description).toBe('Double Quote');
  });

  it('ignores meta tags after </head> (body scan limit)', () => {
    const html = `<head><title>HeadTitle</title></head><body>
      <meta property="og:title" content="ShouldNotMatch">
    </body>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.title).toBe('HeadTitle');
  });

  it('handles content attribute before property attribute (reversed order)', () => {
    const html = `<head>
      <meta content="Reversed" property="og:title">
    </head>`;
    const result = parseOgFromHtml(html, 'example.com');
    expect(result?.title).toBe('Reversed');
  });
});
