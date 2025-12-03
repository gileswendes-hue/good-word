class ChristmasLights extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.bulbCount = 30; 
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          pointer-events: none;
          z-index: 1000;
        }

        .cord {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 12px;
          z-index: 999;
          pointer-events: none;
          background: #060;
          border-bottom: solid #262 2px;
          border-radius: 50%;
          --mask:
            radial-gradient(5px at 50% calc(100% + 4px), #0000 calc(99% - 1px), #000 calc(101% - 1px) 99%, #0000 101%)
              calc(50% - 6px) calc(50% - 2px + .5px) / 12px 4px repeat-x,
            radial-gradient(5px at 50% -4px, #0000 calc(99% - 1px), #000 calc(101% - 1px) 99%, #0000 101%)
              50% calc(50% + 2px) / 12px 4px repeat-x,
            radial-gradient(7px at 50% calc(100% + 5px), #0000 calc(99% - 1px), #000 calc(101% - 1px) 99%, #0000 101%)
              calc(50% - 8px) calc(50% - 2.5px + .5px) / 16px 5px repeat-x,
            radial-gradient(7px at 50% -5px, #0000 calc(99% - 1px), #000 calc(101% - 1px) 99%, #0000 101%)
              50% calc(50% + 2.5px) / 16px 5px repeat-x;
          mask: var(--mask);
        }

        .bulbs {
          text-align: center;
          white-space: nowrap;
          position: absolute;
          top: 0;
          left: 0;
          margin: 0;
          padding: 0;
          pointer-events: none;
          display: flex;
          justify-content: space-around;
          width: 100%;
          min-width: 1000px;
          list-style: none;
        }

        .bulbs li {
          position: relative;
          display: inline-block;
          list-style: none;
          margin: 0;
          transform: translateY(8px);
        }

        .bulbs li .bulb {
          position: relative;
          box-sizing: content-box;
          border-left: 2px solid rgba(0,0,0,.05);
          border-right: 2px solid rgba(255,255,255,.5);
          margin: 2px 0 0 -3px;
          padding: 0;
          display: block;
          width: 8px;
          height: 18px;
          border-radius: 50%;
          transform-origin: top center;
          animation-fill-mode: forwards;
          pointer-events: auto;
          animation-name: flash-all, sway, flickPendulum;
          animation-timing-function: linear, ease-in-out, cubic-bezier(0.25, 0.6, 0.3, 1);
          animation-iteration-count: infinite, infinite, 1;
        }

        /* Animation Timings */
        .bulbs li:nth-child(6n)   .bulb { animation-duration: 4.4s, 4.1s, 3.2s; animation-delay: 0s, 0s, 0.1s; }
        .bulbs li:nth-child(6n+1) .bulb { animation-duration: 7.2s, 4.3s, 2.8s; animation-delay: 0s, 0s, 0.0s; }
        .bulbs li:nth-child(6n+2) .bulb { animation-duration: 3.1s, 4.5s, 3.4s; animation-delay: 0s, 0s, 0.2s; }
        .bulbs li:nth-child(6n+3) .bulb { animation-duration: 6.7s, 4.7s, 2.7s; animation-delay: 0s, 0s, 0.1s; }
        .bulbs li:nth-child(6n+4) .bulb { animation-duration: 5.0s, 4.9s, 2.6s; animation-delay: 0s, 0s, 0.2s; }
        .bulbs li:nth-child(6n+5) .bulb { animation-duration: 4.8s, 5.1s, 3.0s; animation-delay: 0s, 0s, 0.0s; }

        /* Colors & Glowing Shadows */
        
        /* Yellow/Gold */
        .bulbs li:nth-child(6n+0) .bulb { 
            background: #FFD7A3; 
            box-shadow: 0px 4px 24px 3px rgba(255, 215, 163, 0.8); 
        }
        
        /* Blue */
        .bulbs li:nth-child(6n+1) .bulb { 
            background: #00BFFF; 
            box-shadow: 0px 4px 24px 3px rgba(0, 191, 255, 0.8); 
        }
        
        /* Red */
        .bulbs li:nth-child(6n+2) .bulb { 
            background: #FF3D00; 
            box-shadow: 0px 4px 24px 3px rgba(255, 61, 0, 0.8); 
        }
        
        /* Orange */
        .bulbs li:nth-child(6n+3) .bulb { 
            background: #FF9100; 
            box-shadow: 0px 4px 24px 3px rgba(255, 145, 0, 0.8); 
        }
        
        /* Purple */
        .bulbs li:nth-child(6n+4) .bulb { 
            background: #D500F9; 
            box-shadow: 0px 4px 24px 3px rgba(213, 0, 249, 0.8); 
        }
        
        /* Green */
        .bulbs li:nth-child(6n+5) .bulb { 
            background: #00E676; 
            box-shadow: 0px 4px 24px 3px rgba(0, 230, 118, 0.8); 
        }

        /* Hover Effect (Brighter Glow) */
        .bulbs li .bulb:hover {
          animation: flash-all 0.8s infinite linear;
          filter: brightness(1.5);
        }

        .bulbs li::before {
          content: "";
          position: absolute;
          box-sizing: content-box;
          background: #262;
          width: 4px;
          height: 8px;
          border-radius: 3px;
          top: -5px;
          left: -1px;
          border-left: 2px solid rgba(0, 0, 0, .05);
          border-right: 2px solid rgba(255, 255, 255, .5);
        }

        @keyframes flickPendulum {
            0% { transform: rotate(  0deg); }
           10% { transform: rotate( 20deg); }
           20% { transform: rotate(-18deg); }
           30% { transform: rotate( 15deg); }
           40% { transform: rotate(-12deg); }
           50% { transform: rotate(  9deg); }
           60% { transform: rotate( -6deg); }
           70% { transform: rotate(  4deg); }
           80% { transform: rotate( -2deg); }
           90% { transform: rotate(  1deg); }
          100% { transform: rotate(  0deg); }
        }

        @keyframes flash-all {
          0%, 37.5%, 62.5%, 100% { opacity: 1; box-shadow: 0px 4px 35px 8px currentColor; }
          50% { opacity: .5; box-shadow: 0px 2px 10px 0px currentColor; }
        }

        @keyframes sway {
          0%, 100% { transform: rotate(0.5deg); }
          50% { transform: rotate(-0.5deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .bulbs li .bulb { animation: none !important; }
        }
      </style>
      <div class="cord"></div>
      <ul class="bulbs"></ul>
    `;

    const bulbsContainer = this.shadowRoot.querySelector('.bulbs');
    for (let i = 0; i < this.bulbCount; i++) {
      const li = document.createElement('li');
      const bulb = document.createElement('div');
      bulb.className = 'bulb';
      li.appendChild(bulb);
      bulbsContainer.appendChild(li);
    }
  }
}

customElements.define('christmas-lights', ChristmasLights);
