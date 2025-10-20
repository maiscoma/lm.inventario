// frontend/src/components/particles-config.js

const particlesOptions = {
    background: {
        color: {
            value: "#0a0a0a", // Coincide con tu --dark-bg
        },
    },
    fullScreen: {
        enable: true,
        zIndex: -1,
    },
    particles: {
        number: {
            value: 60, // Aumentamos un poco la cantidad
            density: {
                enable: true,
                value_area: 800,
            },
        },
        color: {
            value: ["#00d4ff", "#8b5cf6"],
        },
        shape: {
            type: "circle",
        },
        opacity: {
            value: 0.8, // <-- Aumentamos la opacidad de las partículas
            random: true,
        },
        size: {
            value: 3,
            random: true,
        },
        links: {
            enable: true,
            distance: 150,
            color: "#666666", // <-- Un color más claro para las líneas
            opacity: 0.6,   // <-- Aumentamos la opacidad de las líneas
            width: 1,
        },
        move: {
            enable: true,
            speed: 1.5, // Un poco más rápidas para más dinamismo
            direction: "none",
            out_mode: "out",
            bounce: false,
        },
    },
    interactivity: {
        events: {
            onhover: {
                enable: true,
                mode: "repulse",
            },
        },
        modes: {
            repulse: {
                distance: 100,
            },
        },
    },
};

export default particlesOptions;