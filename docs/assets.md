# Frontend visual assets

The public and authentication pages no longer use dashboard screenshots. The earlier `public/*-preview.png` files are retained, unused, to preserve previous work.

## Marketing illustration

`public/seller-toolkit-3d.png` was generated with the built-in image generation tool. It contains no business data, interface screenshots, or customer identities. The original is retained in the generated-images directory.

Final prompt:

> Use case: stylized-concept. Create a premium playful 3D clay illustration for a Daraz seller SaaS website section. One cohesive sculptural still life of a coral orange shopping bag with chunky rounded handles, two small white shipping parcels with lilac tape, a turquoise price tag, and a standing lilac upward arrow. Soft matte silicone and ceramic materials, beautiful studio lighting, delicate contact shadows, crisp dimensional edges, slight isometric camera. Composition centered with ample empty margin, entire objects visible, square image, isolated against a clean pure white background that blends into a website. Reference direction: playful high-end SaaS marketing like floating 3D productivity objects, not an app dashboard. No text, no letters, no numbers, no logos, no interface, no phones, no screenshots, no gradients in the background, no extra decorative balls or orbs.

The animated objects in `src/features/marketing/CommerceScene.jsx` are original Three.js meshes, not imported models. They follow the supplied reference's floating-object composition while using seller-related subjects. Geometry and renderer APIs follow the [official Three.js documentation](https://threejs.org/docs/).

## Product photography

The existing demo product photography was downloaded locally for reliable previews. Source images:

| Local asset | Original source |
| --- | --- |
| `demo-earbuds.jpg` | https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1 |
| `demo-watch.jpg` | https://images.unsplash.com/photo-1523275335684-37898b6baf30 |
| `demo-headset.jpg` | https://images.unsplash.com/photo-1583394838336-acd977736f90 |
| `demo-shoes.jpg` | https://images.unsplash.com/photo-1542291026-7eec264c27ff |
| `demo-backpack.jpg` | https://images.unsplash.com/photo-1553062407-98eeb64c6a62 |
| `demo-camera.jpg` | https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f |
| `demo-skincare.jpg` | https://images.unsplash.com/photo-1596462502278-27bfdc403348 |
| `demo-laptop.jpg` | https://images.unsplash.com/photo-1517336714731-489689fd1ca8 |

These images illustrate synthetic demo products. Live catalog and competitor images continue to come from the API.
