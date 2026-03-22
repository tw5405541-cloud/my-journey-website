// ===================================
// MAPBOX CONFIGURATION
// ===================================

// NOTE: Replace 'YOUR_MAPBOX_TOKEN' with your actual Mapbox access token
// Get free token at: https://account.mapbox.com/
const MAPBOX_TOKEN = 'pk.eyJ1IjoiMDIyNyIsImEiOiJjbWw2MmxuN2EwMDNjM2ZxdXByMHlycG41In0.f57TFX_BgguD0bzCBpFaxw';

// ===================================
// ROUTE DATA — 从 routes.json 动态加载
// ===================================
let journeyRoutes = [];

async function loadRoutes() {
    try {
        const res = await fetch('routes.json?t=' + Date.now());
        journeyRoutes = await res.json();
    } catch (e) {
        console.warn('routes.json 加载失败', e);
        journeyRoutes = [];
    }
}

// 旧的默认数据（备份，不再使用）
const _defaultRoutes = [
    {
        id: 1,
        name: 'Chengdu to Lhasa',
        subtitle: 'The Roof of the World',
        date: 'May 2023',
        distance: '2,150 km',
        elevation: '5,200m max',
        weather: '-5°C to 25°C',
        description: 'Crossing the Tibetan Plateau, where the air is thin and the spirit is boundless. Every pedal stroke at 4,000+ meters is a meditation on endurance. The journey took me through ancient monasteries, over passes that touch the sky, and into the heart of Tibetan culture.',
        coordinates: [
            [104.0668, 30.5728], // Chengdu
            [102.7103, 25.0406], // Kunming (approximate route)
            [91.1320, 29.6544]   // Lhasa
        ],
        startPoint: [104.0668, 30.5728],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
    },
    {
        id: 2,
        name: 'Duku Highway',
        subtitle: 'Through the Heart of Tianshan',
        date: 'August 2023',
        distance: '561 km',
        elevation: '3,700m max',
        weather: '5°C to 35°C',
        description: 'One of China\'s most spectacular mountain roads, connecting different climates and cultures in a single ride. The Duku Highway cuts through the Tianshan Mountains, offering breathtaking views of glaciers, meadows, and canyons.',
        coordinates: [
            [84.8739, 44.0150], // Dushanzi
            [82.9450, 41.7650]  // Kuqa
        ],
        startPoint: [84.8739, 44.0150],
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400'
    },
    {
        id: 3,
        name: 'Around Qinghai Lake',
        subtitle: 'China\'s Largest Inland Sea',
        date: 'July 2022',
        distance: '360 km',
        elevation: '3,200m',
        weather: '10°C to 25°C',
        description: 'A loop around the sacred lake, where nomadic traditions meet modern infrastructure. The turquoise waters, rolling grasslands, and snow-capped peaks create an unforgettable cycling experience.',
        coordinates: [
            [100.9015, 36.9668], // Xining (start)
            [99.9840, 36.9239],  // Lake point 1
            [100.1369, 37.2089], // Lake point 2
            [100.9015, 36.9668]  // Return to Xining
        ],
        startPoint: [100.9015, 36.9668],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
    },
    {
        id: 4,
        name: 'Mohe to Manzhouli',
        subtitle: 'China\'s Northern Frontier',
        date: 'September 2022',
        distance: '1,850 km',
        elevation: '200m avg',
        weather: '-15°C to 25°C',
        description: 'From the northernmost point of China through vast grasslands to the border with Russia. This journey crosses multiple climate zones and cultural regions, from dense forests to endless steppes.',
        coordinates: [
            [122.5352, 52.9720], // Mohe
            [120.7822, 50.2506], // Midpoint
            [117.4297, 49.5974]  // Manzhouli
        ],
        startPoint: [122.5352, 52.9720],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
    },
    {
        id: 5,
        name: 'Wuzhong to Helan Mountains',
        subtitle: 'Tracing Xixia Legacy',
        date: 'April 2023',
        distance: '320 km',
        elevation: '2,000m max',
        weather: '5°C to 30°C',
        description: 'Cycling through the homeland of the Western Xia Dynasty, where my academic research meets physical journey. Every pedal stroke connects me deeper to the empire I study in archives.',
        coordinates: [
            [106.2732, 37.9974], // Wuzhong
            [105.9961, 38.4681], // Yinchuan
            [106.0500, 38.8500]  // Helan Mountains
        ],
        startPoint: [106.2732, 37.9974],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
    },
    {
        id: 6,
        name: 'Zhengzhou to Luoyang',
        subtitle: 'Ancient Capitals Route',
        date: 'March 2023',
        distance: '180 km',
        elevation: '500m max',
        weather: '10°C to 25°C',
        description: 'A short but historically rich ride connecting two ancient capitals of China. This route passes through the cradle of Chinese civilization.',
        coordinates: [
            [113.6254, 34.7466], // Zhengzhou
            [112.4540, 34.6197]  // Luoyang
        ],
        startPoint: [113.6254, 34.7466],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
    }
];  // end _defaultRoutes

// ===================================
// MAP INITIALIZATION
// ===================================

let map;
let markers = [];

function initMap() {
    // Check if Mapbox token is set
    if (MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN') {
        console.warn('Please set your Mapbox access token in script.js');
        // Create a fallback map view
        document.getElementById('map').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #2d2d2d; color: #a0a0a0; text-align: center; padding: 2rem;">
                <div>
                    <h3 style="color: #c9a961; margin-bottom: 1rem;">Map Preview</h3>
                    <p>To enable the interactive map, add your Mapbox access token in script.js</p>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">Get a free token at <a href="https://account.mapbox.com/" target="_blank" style="color: #4a90a4;">mapbox.com</a></p>
                    <div style="margin-top: 2rem; display: grid; gap: 1rem;">
                        ${journeyRoutes.map(route => `
                            <button onclick="showRouteDetails(${route.id})" style="padding: 0.8rem; background: #1a1a1a; color: #e0e0e0; border: 1px solid #c9a961; cursor: pointer; transition: all 0.3s;">
                                ${route.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11', // Dark style for premium feel
        center: [105, 35], // Center on China
        zoom: 4,
        pitch: 45,
        bearing: 0
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Wait for map to load
    map.on('load', () => {
        // Add routes and markers
        addRoutesToMap();
    });
}

// ===================================
// ADD ROUTES TO MAP
// ===================================

function addRoutesToMap() {
    journeyRoutes.forEach((route, index) => {
        // Add route line
        map.addSource(`route-${route.id}`, {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route.coordinates
                }
            }
        });

        map.addLayer({
            id: `route-${route.id}`,
            type: 'line',
            source: `route-${route.id}`,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': ['interpolate', ['linear'], ['line-progress'], 
                    0, '#c9a961',  // Gold at start
                    1, '#4a90a4'   // Blue at end
                ],
                'line-width': 3,
                'line-gradient': true
            }
        });

        // Add marker at start point
        const marker = new mapboxgl.Marker({ color: '#c9a961' })
            .setLngLat(route.startPoint)
            .addTo(map);

        // Add click event to marker
        marker.getElement().addEventListener('click', () => {
            showRouteDetails(route.id);
            // Fly to route
            map.flyTo({
                center: route.startPoint,
                zoom: 8,
                duration: 2000
            });
        });

        markers.push(marker);

        // Add popup on hover
        marker.getElement().addEventListener('mouseenter', () => {
            const popup = new mapboxgl.Popup({ offset: 25 })
                .setLngLat(route.startPoint)
                .setHTML(`
                    <div style="padding: 0.5rem; color: #1a1a1a;">
                        <strong>${route.name}</strong>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem;">${route.distance}</p>
                    </div>
                `)
                .addTo(map);
            
            marker.getElement().addEventListener('mouseleave', () => {
                popup.remove();
            });
        });
    });
}

// ===================================
// SHOW ROUTE DETAILS IN SIDEBAR
// ===================================

function showRouteDetails(routeId) {
    const route = journeyRoutes.find(r => r.id === routeId);
    if (!route) return;

    const sidebar = document.getElementById('routeSidebar');
    const sidebarContent = document.getElementById('sidebarContent');

    sidebarContent.innerHTML = `
        <img src="${route.image}" alt="${route.name}" style="width: 100%; border-radius: 4px; margin-bottom: 1.5rem;">
        <h2 style="color: #fff; font-size: 1.8rem; margin-bottom: 0.5rem;">${route.name}</h2>
        <p style="color: #c9a961; font-size: 1.1rem; margin-bottom: 2rem;">${route.subtitle}</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: #2d2d2d; padding: 1rem; border-radius: 4px;">
                <p style="color: #a0a0a0; font-size: 0.85rem; margin-bottom: 0.3rem;">DATE</p>
                <p style="color: #fff; font-weight: 600;">${route.date}</p>
            </div>
            <div style="background: #2d2d2d; padding: 1rem; border-radius: 4px;">
                <p style="color: #a0a0a0; font-size: 0.85rem; margin-bottom: 0.3rem;">DISTANCE</p>
                <p style="color: #fff; font-weight: 600;">${route.distance}</p>
            </div>
            <div style="background: #2d2d2d; padding: 1rem; border-radius: 4px;">
                <p style="color: #a0a0a0; font-size: 0.85rem; margin-bottom: 0.3rem;">ELEVATION</p>
                <p style="color: #fff; font-weight: 600;">${route.elevation}</p>
            </div>
            <div style="background: #2d2d2d; padding: 1rem; border-radius: 4px;">
                <p style="color: #a0a0a0; font-size: 0.85rem; margin-bottom: 0.3rem;">WEATHER</p>
                <p style="color: #fff; font-weight: 600;">${route.weather}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1rem;">The Story</h3>
            <p style="color: #e0e0e0; line-height: 1.7; font-size: 0.95rem;">${route.description}</p>
        </div>
        
        <a href="#" style="display: inline-block; padding: 0.8rem 2rem; background: #c9a961; color: #000; text-decoration: none; font-weight: 600; border-radius: 2px; transition: all 0.3s;" onmouseover="this.style.background='#fff'" onmouseout="this.style.background='#c9a961'">
            Read Full Story →
        </a>
    `;

    sidebar.classList.add('active');
}

// ===================================
// SIDEBAR CLOSE FUNCTIONALITY
// ===================================

document.getElementById('closeSidebar').addEventListener('click', () => {
    document.getElementById('routeSidebar').classList.remove('active');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('routeSidebar');
    const closebtn = document.getElementById('closeSidebar');
    
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !e.target.classList.contains('mapboxgl-marker')) {
        sidebar.classList.remove('active');
    }
});

// ===================================
// SMOOTH SCROLLING FOR NAVIGATION
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================

let lastScroll = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.style.padding = '1rem 0';
        nav.style.backgroundColor = 'rgba(26, 26, 26, 0.98)';
    } else {
        nav.style.padding = '1.5rem 0';
        nav.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
    }
    
    lastScroll = currentScroll;
});

// ===================================
// EMAIL SUBSCRIPTION FORM
// ===================================

document.getElementById('subscribeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Here you would integrate with your email service (Mailchimp, ConvertKit, etc.)
    // For now, just show a success message
    alert(`Thank you for subscribing! We'll send updates to ${email}`);
    e.target.reset();
});

// ===================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.archive-card, .about-card, .gear-item').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ===================================
// INITIALIZE ON PAGE LOAD
// ===================================

window.addEventListener('DOMContentLoaded', async () => {
    // 先加载 routes.json，再初始化地图
    await loadRoutes();
    initMap();

    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===================================
// MOBILE MENU TOGGLE (for future enhancement)
// ===================================

// You can add a hamburger menu for mobile here if needed
// This is a placeholder for mobile navigation functionality