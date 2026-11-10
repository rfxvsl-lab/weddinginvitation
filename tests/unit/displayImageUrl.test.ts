import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertGoogleDriveUrl, displayImageUrl } from '../../src/utils/googleDrive.ts';

test('Google Drive dan lh3 diminta dalam ukuran terbatas dan WebP', () => {
  assert.equal(displayImageUrl('https://drive.google.com/file/d/AbC_123-x/view?usp=sharing'), 'https://lh3.googleusercontent.com/d/AbC_123-x=w828-rw');
  assert.equal(displayImageUrl('https://lh3.googleusercontent.com/d/AbC_123', 828), 'https://lh3.googleusercontent.com/d/AbC_123=w828-rw');
});

test('Cloudinary mendapat transformasi hanya jika belum punya', () => {
  assert.equal(
    displayImageUrl('https://res.cloudinary.com/demo/image/upload/v1712/wedding/a.jpg', 800),
    'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_800/v1712/wedding/a.jpg'
  );
  const already = 'https://res.cloudinary.com/demo/image/upload/w_300/v1712/a.jpg';
  assert.equal(displayImageUrl(already), already);
  const video = 'https://res.cloudinary.com/demo/video/upload/v1/a.mp3';
  assert.equal(displayImageUrl(video), video);
});

test('URL lain, path lokal, dan kosong tidak berubah', () => {
  assert.equal(displayImageUrl('/assets/kharis-lia/hero.jpg'), '/assets/kharis-lia/hero.jpg');
  assert.equal(displayImageUrl('https://images.unsplash.com/photo-1?w=800'), 'https://images.unsplash.com/photo-1?w=800');
  assert.equal(displayImageUrl('https://lh3.googleusercontent.com/d/AbC=w500'), 'https://lh3.googleusercontent.com/d/AbC=w500');
  assert.equal(displayImageUrl(''), '');
});

test('helper penyimpanan tidak ikut berubah', () => {
  assert.equal(convertGoogleDriveUrl('https://drive.google.com/file/d/AbC/view'), 'https://lh3.googleusercontent.com/d/AbC');
});
