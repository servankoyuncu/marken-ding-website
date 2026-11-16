// Animated gold shimmer background.
// Mobile, reduced-motion and no-WebGL visitors get a static gradient (set in CSS on #canvas-container).
// Desktop loads three.js only after the page has finished loading, so it never delays content,
// and the animation pauses while the tab is hidden.
(function () {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  const wantsMotion = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!wantsMotion) return;

  const hasWebGL = (() => {
    try { return !!document.createElement('canvas').getContext('webgl'); } catch (e) { return false; }
  })();
  if (!hasWebGL) return;

  const start = () => {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    // A soft gradient gains nothing from retina resolution; 1x keeps GPU load low.
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 0.8s ease';
    container.appendChild(renderer.domElement);

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2) }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 v_texCoord;
        void main() {
          v_texCoord = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        varying vec2 v_texCoord;
        void main() {
          vec2 uv = v_texCoord;
          vec2 mouse = u_mouse / u_resolution;
          vec3 color1 = vec3(0.04, 0.04, 0.04);
          vec3 color2 = vec3(0.08, 0.07, 0.06);
          float motion = sin(uv.x * 3.0 + u_time * 0.5) * 0.1;
          motion += cos(uv.y * 2.0 - u_time * 0.3) * 0.1;
          float dist = distance(uv, mouse);
          float glow = smoothstep(0.4, 0.0, dist) * 0.12;
          float shimmer = sin(uv.x * 10.0 + uv.y * 10.0 + u_time * 1.2) * 0.5 + 0.5;
          shimmer = pow(shimmer, 20.0) * 0.04;
          vec3 goldColor = vec3(0.63, 0.49, 0.29);
          vec3 finalColor = mix(color1, color2, uv.y + motion);
          finalColor += goldColor * glow;
          finalColor += goldColor * shimmer;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    document.addEventListener('mousemove', (e) => {
      uniforms.u_mouse.value.x = e.clientX;
      uniforms.u_mouse.value.y = window.innerHeight - e.clientY;
    });
    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    });

    let frame = null;
    const animate = (time) => {
      uniforms.u_time.value = time * 0.001;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = null; }
      else if (frame === null) { frame = requestAnimationFrame(animate); }
    });
    frame = requestAnimationFrame(animate);
    requestAnimationFrame(() => { renderer.domElement.style.opacity = '1'; });
  };

  const load = () => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = start;
    document.head.appendChild(script);
  };

  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load);
})();
