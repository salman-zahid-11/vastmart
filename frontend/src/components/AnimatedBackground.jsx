import './AnimatedBackground.css';

function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="animated-bg__blob animated-bg__blob--1"></div>
      <div className="animated-bg__blob animated-bg__blob--2"></div>
      <div className="animated-bg__blob animated-bg__blob--3"></div>
    </div>
  );
}

export default AnimatedBackground;