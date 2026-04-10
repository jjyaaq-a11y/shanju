import assert from "node:assert/strict";
import { getMediaAsset } from "@/lib/media";

const relative = getMediaAsset({
  url: "/api/media/file/sample.webp",
  rotation: "90",
});

assert.equal(relative.url, "/api/media/file/sample.webp");
assert.equal(relative.rotation, 90);

const fallback = getMediaAsset({
  sizes: {
    card: {
      url: "/api/media/file/sample-card.webp",
    },
  },
  rotation: "270",
});

assert.equal(fallback.url, "/api/media/file/sample-card.webp");
assert.equal(fallback.rotation, 270);

const invalidRotation = getMediaAsset({
  url: "https://example.com/sample.webp",
  rotation: "45",
});

assert.equal(invalidRotation.url, "https://example.com/sample.webp");
assert.equal(invalidRotation.rotation, 0);

console.log("PASS: media asset url + rotation mapping works");
