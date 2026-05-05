// src/utils/engine.js

export function extractGray(srcImg, W, H, contrastMul) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.filter = `grayscale(100%) contrast(${contrastMul})`;
  ctx.drawImage(srcImg, 0, 0, W, H);
  ctx.filter = 'none';
  const d = ctx.getImageData(0, 0, W, H).data;
  const gray = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const p = i * 4;
    gray[i] = (d[p] * 0.2126 + d[p+1] * 0.7152 + d[p+2] * 0.0722) / 255.0;
  }
  return gray;
}

export function gaussBlur(gray, W, H, sigma) {
  if (sigma < 0.1) return gray.slice();
  const r = Math.ceil(sigma * 2.5);
  const size = 2 * r + 1;
  const k = new Float32Array(size);
  let sum = 0;
  for (let i = 0; i < size; i++) {
    const x = i - r;
    k[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += k[i];
  }
  for (let i = 0; i < size; i++) k[i] /= sum;

  const tmp = new Float32Array(W * H);
  const out = new Float32Array(W * H);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) {
        const xi = Math.min(W - 1, Math.max(0, x + i));
        acc += gray[y * W + xi] * k[i + r];
      }
      tmp[y * W + x] = acc;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) {
        const yi = Math.min(H - 1, Math.max(0, y + i));
        acc += tmp[yi * W + x] * k[i + r];
      }
      out[y * W + x] = acc;
    }
  }
  return out;
}

export function bilateralFilter(gray, W, H, sigmaS, sigmaR) {
  const r   = Math.ceil(sigmaS * 2);
  const out = new Float32Array(W * H);
  const s2  = 2.0 * sigmaS * sigmaS;
  const r2  = 2.0 * sigmaR * sigmaR;
  const side = 2 * r + 1;
  const spatLUT = new Float32Array(side * side);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      spatLUT[(dy + r) * side + (dx + r)] = Math.exp(-(dx*dx + dy*dy) / s2);
    }
  }
  const stride = 1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const center = gray[y * W + x];
      let sumW = 0, sumV = 0;
      for (let dy = -r; dy <= r; dy += stride) {
        const ny = Math.min(H - 1, Math.max(0, y + dy));
        for (let dx = -r; dx <= r; dx += stride) {
          const nx = Math.min(W - 1, Math.max(0, x + dx));
          const v  = gray[ny * W + nx];
          const diff = v - center;
          const w  = spatLUT[(dy + r) * side + (dx + r)] * Math.exp(-(diff * diff) / r2);
          sumW += w;
          sumV += w * v;
        }
      }
      out[y * W + x] = sumW > 0 ? sumV / sumW : center;
    }
  }
  return out;
}

export function unsharpMask(gray, W, H, sigma, amount) {
  const blurred = gaussBlur(gray, W, H, sigma);
  const out = new Float32Array(W * H);
  for (let i = 0; i < gray.length; i++) {
    out[i] = Math.min(1, Math.max(0, gray[i] + amount * (gray[i] - blurred[i])));
  }
  return out;
}

export function sobelGradient(gray, W, H) {
  const mag = new Float32Array(W * H);
  const ang = new Float32Array(W * H);
  let maxMag = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const tl = gray[(y-1)*W+(x-1)], tc = gray[(y-1)*W+x], tr = gray[(y-1)*W+(x+1)];
      const ml = gray[ y  *W+(x-1)],                         mr = gray[ y  *W+(x+1)];
      const bl = gray[(y+1)*W+(x-1)], bc = gray[(y+1)*W+x], br = gray[(y+1)*W+(x+1)];

      const gx = (-tl - 2*ml - bl) + (tr + 2*mr + br);
      const gy = (-tl - 2*tc - tr) + (bl + 2*bc + br);

      const m = Math.sqrt(gx*gx + gy*gy);
      mag[y*W+x] = m;
      ang[y*W+x] = Math.atan2(gy, gx);
      if (m > maxMag) maxMag = m;
    }
  }
  if (maxMag > 0) {
    const inv = 1.0 / maxMag;
    for (let i = 0; i < mag.length; i++) mag[i] *= inv;
  }
  return { mag, ang };
}

export function nonMaxSuppression(mag, ang, W, H) {
  const nms = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = y * W + x;
      const m = mag[idx];
      if (m === 0) continue;
      let a = ang[idx] * (180 / Math.PI);
      if (a < 0) a += 180;
      let n1, n2;
      if (a < 22.5 || a >= 157.5) { n1 = mag[y*W+(x-1)]; n2 = mag[y*W+(x+1)]; }
      else if (a < 67.5) { n1 = mag[(y-1)*W+(x+1)]; n2 = mag[(y+1)*W+(x-1)]; }
      else if (a < 112.5) { n1 = mag[(y-1)*W+x]; n2 = mag[(y+1)*W+x]; }
      else { n1 = mag[(y-1)*W+(x-1)]; n2 = mag[(y+1)*W+(x+1)]; }
      nms[idx] = (m >= n1 && m >= n2) ? m : 0;
    }
  }
  return nms;
}

export function hysteresisThreshold(nms, W, H, lo, hi) {
  const edge = new Uint8Array(W * H);
  for (let i = 0; i < nms.length; i++) {
    if      (nms[i] >= hi) edge[i] = 2;
    else if (nms[i] >= lo) edge[i] = 1;
  }
  const queue = [];
  for (let i = 0; i < edge.length; i++) {
    if (edge[i] === 2) queue.push(i);
  }
  const dx8 = [-1, 0, 1, -1, 1, -1, 0, 1];
  const dy8 = [-1,-1,-1,  0, 0,  1, 1, 1];
  let qi = 0;
  while (qi < queue.length) {
    const idx = queue[qi++];
    const ey  = Math.floor(idx / W);
    const ex  = idx % W;
    for (let d = 0; d < 8; d++) {
      const nx = ex + dx8[d], ny = ey + dy8[d];
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const ni = ny * W + nx;
      if (edge[ni] === 1) { edge[ni] = 2; queue.push(ni); }
    }
  }
  const out = new Uint8Array(W * H);
  for (let i = 0; i < edge.length; i++) out[i] = edge[i] === 2 ? 1 : 0;
  return out;
}

export function cannyEdge(gray, W, H, sigma, lo, hi) {
  const blurred = gaussBlur(gray, W, H, sigma);
  const { mag, ang } = sobelGradient(blurred, W, H);
  const nms = nonMaxSuppression(mag, ang, W, H);
  return hysteresisThreshold(nms, W, H, lo, hi);
}

export function laplacianOfGaussian(gray, W, H, sigma, threshold) {
  const blurred = gaussBlur(gray, W, H, sigma);
  const out = new Uint8Array(W * H);
  let maxV = 0;
  const tmp = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const v = Math.abs(
        -blurred[(y-1)*W+x] - blurred[y*W+(x-1)]
        + 4 * blurred[i]
        - blurred[y*W+(x+1)] - blurred[(y+1)*W+x]
      );
      tmp[i] = v;
      if (v > maxV) maxV = v;
    }
  }
  if (maxV > 0) {
    const invMax = 1.0 / maxV;
    for (let i = 0; i < tmp.length; i++) {
      out[i] = (tmp[i] * invMax) > threshold ? 1 : 0;
    }
  }
  return out;
}

export function dilate(bin, W, H, radius) {
  if (radius < 0.5) return bin.slice();
  const out = new Uint8Array(W * H);
  const r   = Math.ceil(radius);
  const r2  = radius * radius;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let hit = false;
      outer: for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx*dx + dy*dy > r2) continue;
          const nx = Math.min(W-1, Math.max(0, x+dx));
          const ny = Math.min(H-1, Math.max(0, y+dy));
          if (bin[ny*W+nx]) { hit = true; break outer; }
        }
      }
      out[y*W+x] = hit ? 1 : 0;
    }
  }
  return out;
}

export function erode(bin, W, H, radius) {
  if (radius < 0.5) return bin.slice();
  const out = new Uint8Array(W * H);
  const r   = Math.ceil(radius);
  const r2  = radius * radius;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let all = true;
      outer: for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx*dx + dy*dy > r2) continue;
          const nx = Math.min(W-1, Math.max(0, x+dx));
          const ny = Math.min(H-1, Math.max(0, y+dy));
          if (!bin[ny*W+nx]) { all = false; break outer; }
        }
      }
      out[y*W+x] = all ? 1 : 0;
    }
  }
  return out;
}

export function morphClose(bin, W, H, radius) {
  return erode(dilate(bin, W, H, radius), W, H, radius);
}

export function blueNoise(x, y) {
  function h(n) {
    const s = Math.sin(n) * 43758.5453123;
    return s - Math.floor(s);
  }
  return (
    h(x * 127.1  + y * 311.7         ) * 0.38 +
    h(x * 2.1   + y * 2.7  + 17.3   ) * 0.22 +
    h(x * 4.3   + y * 4.9  + 53.7   ) * 0.17 +
    h(x * 8.7   + y * 8.1  + 113.1  ) * 0.12 +
    h(x * 0.13  + y * 0.17 + 7.3    ) * 0.07 +
    h(x * 16.3  + y * 16.9 + 37.1   ) * 0.04
  );
}