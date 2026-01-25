/**
 * ============================================================================
 * GOOD WORD / BAD WORD - WEATHER & EFFECTS MODULE
 * ============================================================================
 * 
 * This module handles weather detection and visual effects:
 * - WeatherManager: Real-time weather API integration with Open-Meteo
 * - RealisticRain: Canvas-based rain with physics simulation
 * - Effects: Theme-specific visual effects (snow, fire, space, etc.)
 * - ThemeManager: Theme switching and secret word detection
 * 
 * Dependencies: 01-core.js (CONFIG, State, DOM)
 * Loaded: Immediately after core
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// REALISTIC RAIN SYSTEM - Canvas-based with real weather data
// ============================================================================
/**
 * Advanced rain effect system that adjusts based on actual weather conditions.
 * Features:
 * - Variable drop sizes creating depth illusion
 * - Wind from real weather data
 * - Splash particles on impact
 * - Lightning during thunderstorms
 * - Intensity tied to precipitation rate
 * - Smooth transitions between weather states
 */
const RealisticRain = {
    canvas: null,
    ctx: null,
    drops: [],
    splashes: [],
    active: false,
    animationId: null,
    transitionTimer: null,
    
    // Current weather conditions (updated by WeatherManager)
    weather: {
        type: 'rain',           // 'drizzle', 'rain', 'heavy', 'thunderstorm'
        intensity: 1.0,         // 0.3 (light) to 2.5 (heavy)
        windSpeed: 0,           // m/s from weather API
        windDirection: 0,       // degrees
        isThunderstorm: false,
        precipitationRate: 0    // mm/hr
    },
    
    // Base configuration (modified by weather conditions)
    config: {
        baseDropCount: 150,
        minSpeed: 12,
        maxSpeed: 28,
        minLength: 8,
        maxLength: 35,
        wind: 0,
        windTarget: 0,
        gustChance: 0.003,
        gustStrength: 1.0,
        splashEnabled: true,
        lightningEnabled: false,
        lightningChance: 0,
        fogOpacity: 0.02,
        intensity: 1.0,
        mist: 0                 // Additional mist particles for heavy rain
    },
    
    // Weather code mappings from Open-Meteo
    WEATHER_PROFILES: {
        // Drizzle (codes 51, 53, 55, 56, 57)
        drizzle: {
            intensity: 0.4,
            fogOpacity: 0.01,
            gustChance: 0.001,
            lightningEnabled: false,
            mist: 0
        },
        // Light rain (codes 61, 80)
        lightRain: {
            intensity: 0.7,
            fogOpacity: 0.02,
            gustChance: 0.002,
            lightningEnabled: false,
            mist: 0
        },
        // Moderate rain (codes 63, 81)
        rain: {
            intensity: 1.0,
            fogOpacity: 0.03,
            gustChance: 0.003,
            lightningEnabled: false,
            mist: 10
        },
        // Heavy rain (codes 65, 82)
        heavyRain: {
            intensity: 1.8,
            fogOpacity: 0.05,
            gustChance: 0.005,
            lightningEnabled: false,
            mist: 25
        },
        // Freezing rain (codes 66, 67)
        freezingRain: {
            intensity: 0.6,
            fogOpacity: 0.04,
            gustChance: 0.002,
            lightningEnabled: false,
            mist: 15
        },
        // Thunderstorm (codes 95, 96, 99)
        thunderstorm: {
            intensity: 2.0,
            fogOpacity: 0.06,
            gustChance: 0.008,
            gustStrength: 2.5,
            lightningEnabled: true,
            lightningChance: 0.002,
            mist: 30
        },
        // Thunderstorm with hail (codes 96, 99)
        severeThunderstorm: {
            intensity: 2.5,
            fogOpacity: 0.08,
            gustChance: 0.012,
            gustStrength: 3.0,
            lightningEnabled: true,
            lightningChance: 0.004,
            mist: 40
        }
    },
    
    /**
     * Map Open-Meteo weather codes to rain profiles
     */
    getProfileFromCode(code) {
        const codeMap = {
            51: 'drizzle', 53: 'drizzle', 55: 'drizzle',
            56: 'freezingRain', 57: 'freezingRain',
            61: 'lightRain', 80: 'lightRain',
            63: 'rain', 81: 'rain',
            65: 'heavyRain', 66: 'freezingRain', 67: 'freezingRain', 82: 'heavyRain',
            95: 'thunderstorm',
            96: 'severeThunderstorm', 99: 'severeThunderstorm'
        };
        return this.WEATHER_PROFILES[codeMap[code]] || this.WEATHER_PROFILES.rain;
    },
    
    /**
     * Update rain parameters based on weather data
     * Called by WeatherManager when weather is fetched
     */
    setWeatherConditions(weatherData) {
        const { weatherCode, windSpeed, windDirection, precipitation } = weatherData;
        
        // Get profile for this weather code
        const profile = this.getProfileFromCode(weatherCode);
        
        // Store weather state
        this.weather.windSpeed = windSpeed || 0;
        this.weather.windDirection = windDirection || 0;
        this.weather.isThunderstorm = [95, 96, 99].includes(weatherCode);
        this.weather.precipitationRate = precipitation || 0;
        
        // Calculate wind effect (-5 to +5 range)
        // Convert wind direction to horizontal component
        const windRad = (windDirection || 0) * Math.PI / 180;
        const horizontalWind = Math.sin(windRad) * (windSpeed || 0) / 5;
        this.config.windTarget = Math.max(-5, Math.min(5, horizontalWind));
        
        // Apply profile settings with smooth transition
        this.transitionToProfile(profile);
        
        // Log weather update
        console.log(`[Rain] Weather updated: code=${weatherCode}, wind=${windSpeed}m/s, precip=${precipitation}mm/hr`);
    },
    
    /**
     * Smoothly transition to a new weather profile
     */
    transitionToProfile(profile) {
        const duration = 3000; // 3 second transition
        const startConfig = { ...this.config };
        const startTime = Date.now();
        
        if (this.transitionTimer) cancelAnimationFrame(this.transitionTimer);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            // Interpolate values
            this.config.intensity = startConfig.intensity + (profile.intensity - startConfig.intensity) * eased;
            this.config.fogOpacity = startConfig.fogOpacity + (profile.fogOpacity - startConfig.fogOpacity) * eased;
            this.config.gustChance = startConfig.gustChance + (profile.gustChance - startConfig.gustChance) * eased;
            this.config.mist = startConfig.mist + ((profile.mist || 0) - startConfig.mist) * eased;
            
            // Boolean values switch at halfway point
            if (progress >= 0.5) {
                this.config.lightningEnabled = profile.lightningEnabled;
                this.config.lightningChance = profile.lightningChance || 0;
                this.config.gustStrength = profile.gustStrength || 1.0;
            }
            
            // Adjust drop count based on intensity
            this.adjustDropCount();
            
            if (progress < 1) {
                this.transitionTimer = requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    /**
     * Adjust number of drops based on current intensity
     */
    adjustDropCount() {
        const targetCount = Math.floor(this.config.baseDropCount * this.config.intensity);
        
        while (this.drops.length < targetCount) {
            this.drops.push(this.createDrop(true));
        }
        while (this.drops.length > targetCount) {
            this.drops.pop();
        }
    },
    
    init() {
        let container = document.getElementById('rain-effect');
        if (!container) {
            container = document.createElement('div');
            container.id = 'rain-effect';
            container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:50;';
            document.body.appendChild(container);
        }
        
        container.innerHTML = '';
        container.classList.remove('hidden');
        container.style.display = 'block';
        
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'width:100%;height:100%;';
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initDrops();
    },
    
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    initDrops() {
        this.drops = [];
        const count = Math.floor(this.config.baseDropCount * this.config.intensity);
        
        for (let i = 0; i < count; i++) {
            this.drops.push(this.createDrop(true));
        }
    },
    
    createDrop(randomY = false) {
        const depth = Math.random();
        const intensityMod = 0.8 + (this.config.intensity * 0.2);
        const length = (this.config.minLength + (this.config.maxLength - this.config.minLength) * depth) * intensityMod;
        const speed = (this.config.minSpeed + (this.config.maxSpeed - this.config.minSpeed) * depth) * intensityMod;
        const width = 1 + depth * 1.5;
        const opacity = 0.1 + depth * 0.4;
        
        return {
            x: Math.random() * (this.canvas?.width || window.innerWidth),
            y: randomY ? Math.random() * (this.canvas?.height || window.innerHeight) : -length,
            length: length,
            speed: speed,
            width: width,
            opacity: opacity,
            depth: depth
        };
    },
    
    createSplash(x, y) {
        if (!this.config.splashEnabled) return;
        
        // More splashes in heavy rain
        const particleCount = Math.floor(2 + Math.random() * 3 * this.config.intensity);
        for (let i = 0; i < particleCount; i++) {
            this.splashes.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4 * this.config.intensity,
                vy: -Math.random() * 3 - 1,
                size: (1 + Math.random() * 2) * Math.min(this.config.intensity, 1.5),
                life: 1.0,
                decay: 0.04 + Math.random() * 0.04
            });
        }
    },
    
    triggerLightning() {
        if (!this.canvas) return;
        
        // Determine flash intensity based on thunderstorm severity
        const flashIntensity = this.config.intensity > 2 ? 0.4 : 0.25;
        
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(255, 255, 255, ${flashIntensity});
            pointer-events: none;
            z-index: 51;
            animation: lightning-flash 0.2s ease-out;
        `;
        document.body.appendChild(flash);
        
        if (!document.getElementById('lightning-style')) {
            const style = document.createElement('style');
            style.id = 'lightning-style';
            style.textContent = `
                @keyframes lightning-flash {
                    0% { opacity: 1; }
                    15% { opacity: 0.4; }
                    30% { opacity: 0.9; }
                    45% { opacity: 0.3; }
                    60% { opacity: 0.7; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => flash.remove(), 200);
        
        // Play thunder sound if SoundManager available
        if (window.SoundManager && !window.State?.data?.settings?.muteSounds) {
            // Delayed thunder (1-4 seconds after flash)
            setTimeout(() => {
                SoundManager.play?.('thunder');
            }, 1000 + Math.random() * 3000);
        }
        
        // Show message occasionally
        if (Math.random() < 0.3 && window.UIManager) {
            UIManager.showPostVoteMessage("⚡ Thunder!");
        }
    },
    
    update() {
        if (!this.canvas || !this.ctx) return;
        
        const { width, height } = this.canvas;
        const cfg = this.config;
        
        // Natural wind gusts (amplified by gustStrength during storms)
        if (Math.random() < cfg.gustChance) {
            const gustMagnitude = (Math.random() - 0.5) * 8 * (cfg.gustStrength || 1);
            cfg.windTarget = Math.max(-6, Math.min(6, cfg.windTarget + gustMagnitude));
        }
        
        // Smooth wind transition
        cfg.wind += (cfg.windTarget - cfg.wind) * 0.02;
        
        // Decay wind back toward weather-based value
        const weatherWind = this.weather.windSpeed ? 
            Math.sin(this.weather.windDirection * Math.PI / 180) * this.weather.windSpeed / 5 : 0;
        cfg.windTarget += (weatherWind - cfg.windTarget) * 0.001;
        
        // Lightning check
        if (cfg.lightningEnabled && Math.random() < cfg.lightningChance) {
            this.triggerLightning();
        }
        
        // Update drops
        for (let drop of this.drops) {
            drop.y += drop.speed;
            drop.x += cfg.wind * drop.depth;
            
            if (drop.y > height) {
                if (drop.y < height + 50) {
                    this.createSplash(drop.x, height - 5);
                }
                Object.assign(drop, this.createDrop(false));
                drop.x = Math.random() * width;
            }
            
            if (drop.x < -50) drop.x = width + 50;
            if (drop.x > width + 50) drop.x = -50;
        }
        
        // Update splashes
        for (let i = this.splashes.length - 1; i >= 0; i--) {
            const splash = this.splashes[i];
            splash.x += splash.vx;
            splash.y += splash.vy;
            splash.vy += 0.2;
            splash.life -= splash.decay;
            
            if (splash.life <= 0) {
                this.splashes.splice(i, 1);
            }
        }
    },
    
    render() {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const { width, height } = this.canvas;
        const cfg = this.config;
        
        ctx.clearRect(0, 0, width, height);
        
        // Fog/mist layer (heavier in intense rain)
        if (cfg.fogOpacity > 0) {
            ctx.fillStyle = `rgba(160, 180, 200, ${cfg.fogOpacity})`;
            ctx.fillRect(0, 0, width, height);
        }
        
        // Draw mist particles for heavy rain
        if (cfg.mist > 0) {
            ctx.fillStyle = 'rgba(200, 210, 220, 0.3)';
            for (let i = 0; i < cfg.mist; i++) {
                const x = (Date.now() * 0.01 * (i % 5 + 1) + i * 137) % width;
                const y = (Date.now() * 0.005 * (i % 3 + 1) + i * 89) % height;
                const size = 2 + Math.sin(Date.now() * 0.001 + i) * 1;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw rain drops
        ctx.lineCap = 'round';
        for (let drop of this.drops) {
            const windAngle = Math.atan2(cfg.wind * drop.depth, drop.speed);
            const endX = drop.x + Math.sin(windAngle) * drop.length;
            const endY = drop.y + Math.cos(windAngle) * drop.length;
            
            const gradient = ctx.createLinearGradient(drop.x, drop.y, endX, endY);
            gradient.addColorStop(0, `rgba(174, 194, 224, 0)`);
            gradient.addColorStop(0.5, `rgba(174, 194, 224, ${drop.opacity})`);
            gradient.addColorStop(1, `rgba(200, 220, 255, ${drop.opacity * 0.7})`);
            
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = drop.width;
            ctx.stroke();
        }
        
        // Draw splashes
        ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
        for (let splash of this.splashes) {
            ctx.globalAlpha = splash.life;
            ctx.beginPath();
            ctx.arc(splash.x, splash.y, splash.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },
    
    loop() {
        if (!this.active) return;
        
        this.update();
        this.render();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    
    start() {
        if (this.active) return;
        
        this.init();
        this.active = true;
        this.loop();
    },
    
    stop() {
        this.active = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.transitionTimer) {
            cancelAnimationFrame(this.transitionTimer);
            this.transitionTimer = null;
        }
        
        const container = document.getElementById('rain-effect');
        if (container) {
            container.innerHTML = '';
            container.classList.add('hidden');
            container.style.display = 'none';
        }
        
        this.drops = [];
        this.splashes = [];
    },
    
    /**
     * Manual intensity override (0.3 to 3.0)
     */
    setIntensity(level) {
        this.config.intensity = Math.max(0.1, Math.min(3, level));
        this.adjustDropCount();
    }
};


// ============================================================================
// WEATHER MANAGER - Real-time Weather Integration
// ============================================================================
/**
 * Fetches real weather data from Open-Meteo API and configures rain effects.
 * Now fetches extended weather data including wind speed and precipitation.
 */
const WeatherManager = {
    // Themes that support weather effects
    ALLOWED_THEMES: ['default', 'ballpit', 'banana', 'dark', 'fire', 'halloween', 'plymouth', 'rainbow', 'summer', 'woodland'],
    
    // Open-Meteo weather codes for precipitation
    RAIN_CODES: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99],
    SNOW_CODES: [71, 73, 75, 77, 85, 86],
    THUNDER_CODES: [95, 96, 99],
    
    // Current weather state
    isRaining: false,
    isSnowing: false,
    isThunderstorm: false,
    hasChecked: false,
    
    // Cached weather data
    weatherData: {
        code: 0,
        windSpeed: 0,
        windDirection: 0,
        precipitation: 0,
        temperature: 0
    },
    
    // Refresh interval (15 minutes)
    refreshInterval: null,
    REFRESH_MS: 15 * 60 * 1000,
    
    init() {
        if (State.data.settings.enableWeather) {
            this.checkWeather();
            // Set up periodic refresh
            this.refreshInterval = setInterval(() => this.checkWeather(), this.REFRESH_MS);
        }
    },
    
    toggle(active) {
        State.data.settings.enableWeather = active;
        State.save('settings', State.data.settings);
        
        if (active) {
            this.checkWeather();
            if (!this.refreshInterval) {
                this.refreshInterval = setInterval(() => this.checkWeather(), this.REFRESH_MS);
            }
        } else {
            this.isRaining = false;
            this.isSnowing = false;
            this.isThunderstorm = false;
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
            this.updateVisuals();
        }
    },
    
    /**
     * Fetch weather with extended parameters for realistic simulation
     */
    async checkWeather() {
        if (!navigator.geolocation) {
            console.warn('[Weather] Geolocation not available');
            return;
        }
        
        if (window.UIManager) {
            UIManager.showPostVoteMessage("Checking local weather... ☁️");
        }
        
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const lat = pos.coords.latitude.toFixed(4);
                    const lon = pos.coords.longitude.toFixed(4);
                    
                    // Extended API call with wind and precipitation data
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,wind_speed_10m,wind_direction_10m,precipitation&timezone=auto`;
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    // Extract current weather
                    const current = data.current;
                    const code = current.weather_code;
                    
                    // Store complete weather data
                    this.weatherData = {
                        code: code,
                        windSpeed: current.wind_speed_10m || 0,
                        windDirection: current.wind_direction_10m || 0,
                        precipitation: current.precipitation || 0,
                        temperature: current.temperature_2m || 0
                    };
                    
                    // Set flags
                    this.isRaining = this.RAIN_CODES.includes(code);
                    this.isSnowing = this.SNOW_CODES.includes(code);
                    this.isThunderstorm = this.THUNDER_CODES.includes(code);
                    this.hasChecked = true;
                    
                    // Show appropriate message
                    if (this.isThunderstorm) {
                        UIManager?.showPostVoteMessage("⛈️ Thunderstorm detected!");
                    } else if (this.isSnowing) {
                        UIManager?.showPostVoteMessage("It's snowing! ❄️");
                    } else if (this.isRaining) {
                        const intensity = this.getIntensityDescription(code);
                        UIManager?.showPostVoteMessage(`${intensity} 🌧️`);
                    } else {
                        UIManager?.showPostVoteMessage("Weather is clear. ☀️");
                    }
                    
                    // Update rain system with weather data
                    if (this.isRaining && RealisticRain) {
                        RealisticRain.setWeatherConditions({
                            weatherCode: code,
                            windSpeed: this.weatherData.windSpeed,
                            windDirection: this.weatherData.windDirection,
                            precipitation: this.weatherData.precipitation
                        });
                    }
                    
                    this.updateVisuals();
                    
                } catch (e) {
                    console.error("[Weather] Fetch failed:", e);
                    UIManager?.showPostVoteMessage("Weather check failed 🌐");
                }
            },
            (err) => {
                console.warn("[Weather] Location denied:", err);
                UIManager?.showPostVoteMessage("Location denied 🚫");
                
                const toggle = document.getElementById('toggleWeather');
                if (toggle) toggle.checked = false;
                
                State.data.settings.enableWeather = false;
                State.save('settings', State.data.settings);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000 // Cache location for 5 minutes
            }
        );
    },
    
    /**
     * Get human-readable intensity description
     */
    getIntensityDescription(code) {
        const descriptions = {
            51: "Light drizzle",
            53: "Moderate drizzle", 
            55: "Dense drizzle",
            56: "Freezing drizzle",
            57: "Heavy freezing drizzle",
            61: "Light rain",
            63: "Moderate rain",
            65: "Heavy rain",
            66: "Light freezing rain",
            67: "Heavy freezing rain",
            80: "Light showers",
            81: "Moderate showers",
            82: "Heavy showers",
            95: "Thunderstorm",
            96: "Thunderstorm with hail",
            99: "Severe thunderstorm"
        };
        return descriptions[code] || "Rain";
    },
    
    /**
     * Update visual effects based on weather state
     */
    updateVisuals() {
        const t = State.runtime.currentTheme;
        
        // Stop rain first
        RealisticRain.stop();
        
        // Handle winter theme separately (always shows snow)
        if (t === 'winter') {
            const s = document.getElementById('snow-effect');
            if (s) s.style.display = '';
            return;
        }
        
        // Stop weather snow
        if (window.Effects) {
            Effects.weatherSnow?.(false);
        }
        
        const isAllowedTheme = this.ALLOWED_THEMES.includes(t);
        const enabled = State.data.settings.enableWeather;
        
        if (enabled && isAllowedTheme) {
            if (this.isSnowing) {
                Effects?.weatherSnow?.(true);
            } else if (this.isRaining) {
                // Start realistic rain with current weather data
                RealisticRain.start();
                RealisticRain.setWeatherConditions({
                    weatherCode: this.weatherData.code,
                    windSpeed: this.weatherData.windSpeed,
                    windDirection: this.weatherData.windDirection,
                    precipitation: this.weatherData.precipitation
                });
            }
        }
    },
    
    /**
     * Get current weather summary for display
     */
    getSummary() {
        if (!this.hasChecked) return "Weather not checked";
        
        const { code, windSpeed, temperature, precipitation } = this.weatherData;
        const desc = this.getIntensityDescription(code);
        
        return `${desc}, ${temperature}°C, Wind: ${windSpeed}km/h`;
    }
};


// ============================================================================
// EXPORTS
// ============================================================================
window.RealisticRain = RealisticRain;
window.WeatherManager = WeatherManager;

console.log('%c[Weather] Loaded', 'color: #3b82f6');

})();
