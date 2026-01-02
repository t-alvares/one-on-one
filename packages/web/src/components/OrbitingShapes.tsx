/**
 * OrbitingShapes - Neo-Brutalist geometric shapes with floating animation
 * Four shapes float gently with different timing for a calming effect
 */

import './OrbitingShapes.css';

function OrbitingShapes() {
  return (
    <div className="floating-shapes-container">
      {/* Circle - Wheatfield Orange using SVG for shape+border, CSS for shadow */}
      <svg
        className="shape-circle"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <circle
          cx="50"
          cy="50"
          r="47"
          style={{
            fill: '#D14905',
            stroke: '#000',
            strokeWidth: 2.25,
            vectorEffect: 'non-scaling-stroke'
          }}
        />
      </svg>

      {/* Square - Midnight Sky using SVG for shape+border, CSS for shadow */}
      <svg
        className="shape-square"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          style={{
            fill: '#003A5C',
            stroke: '#000',
            strokeWidth: 2.25,
            vectorEffect: 'non-scaling-stroke'
          }}
        />
      </svg>

      {/* Rectangle - Grassy Green using SVG for shape+border, CSS for shadow */}
      <svg
        className="shape-rectangle"
        viewBox="0 0 100 60"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <rect
          x="2"
          y="2"
          width="96"
          height="56"
          style={{
            fill: '#225935',
            stroke: '#000',
            strokeWidth: 2.25,
            vectorEffect: 'non-scaling-stroke'
          }}
        />
      </svg>

      {/* Triangle - Prairie Gold using SVG for shape+border, CSS for shadow */}
      <svg
        className="shape-triangle"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,5 95,95 5,95"
          style={{
            fill: '#FFD000',
            stroke: '#000',
            strokeWidth: 2.25,
            vectorEffect: 'non-scaling-stroke'
          }}
        />
      </svg>
    </div>
  );
}

export { OrbitingShapes };
