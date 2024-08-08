// const particleCount = 1000;
// const particles = new THREE.BufferGeometry();
// const positions = new Float32Array(particleCount * 3); // 3 values per particle (x, y, z)
// const velocities = new Float32Array(particleCount * 3); // 3 values per particle velocity (vx, vy, vz)

// for (let i = 0; i < particleCount; i++) {
//   positions[i * 3] = 0; // x
//   positions[i * 3 + 1] = 0; // y
//   positions[i * 3 + 2] = 0; // z

//   velocities[i * 3] = (Math.random() - 0.5) * 2; // vx
//   velocities[i * 3 + 1] = Math.random() * 5; // vy
//   velocities[i * 3 + 2] = (Math.random() - 0.5) * 2; // vz
// }

// particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

// const particleMaterial = new THREE.PointsMaterial({
//   color: 0x00aaff,
//   size: 0.1,
//   transparent: true,
//   opacity: 0.8
// });

// const particleSystem = new THREE.Points(particles, particleMaterial);
// scene.add(particleSystem);

//! animate section :

// function animate() {
//     requestAnimationFrame(animate);

//     const positions = particleSystem.geometry.attributes.position.array;
//     const velocities = particleSystem.geometry.attributes.velocity.array;

//     for (let i = 0; i < particleCount; i++) {
//       positions[i * 3 + 1] += velocities[i * 3 + 1]; // Update y position with y velocity
//       positions[i * 3] += velocities[i * 3]; // Update x position with x velocity
//       positions[i * 3 + 2] += velocities[i * 3 + 2]; // Update z position with z velocity

//       velocities[i * 3 + 1] -= 0.05; // Apply gravity to y velocity

//       // Simple collision with ground
//       if (positions[i * 3 + 1] < 0) {
//         positions[i * 3 + 1] = 0;
//         velocities[i * 3 + 1] *= -0.3; // Bounce effect with damping
//       }
//     }

//     particleSystem.geometry.attributes.position.needsUpdate = true;

//     renderer.render(scene, camera);
//   }

//   animate();
