const particle_radius = 10;
const algorithms = [
    Math.sin,
    Math.cos,
    Math.log,
    bla,
    customNoise
];
let settings;
let particles;

let phase = 0;
let graph_width = 20;

function bla(x) {
    return x * x;
}

function customNoise(x) {
    return noise(x);
}

function setup() {
    createCanvas(900, 600);

    settings = {};
    particles = [];

    add_input("algorithm", "Algorithm", "cos(x)");
    add_slider("particle_amount", "Particle Amount", 0, 500, 50, 1, balance_particles);
    add_slider("particle_radius", "Particle Radius", 1, 25, particle_radius, 1, update_radius);
    add_slider("graph_height", "Graph Height", -height/2, height/2, 20, 5);
    add_slider("graph_width", "Graph Width", 1, 100, 20, .01, update_width);
    add_slider("phase", "Phase", 0, .1, 0, .001, update_phase);

    balance_particles(50);
}

function get_container() {
    return createDiv().class("container");
}

function add_input(name, label, value, callback) {
    const container = get_container();

    settings[name] = {
        label: createDiv(label).parent(container).class("label"),
        element: createInput().parent(container).class("element"),
        last_value: value,
        callback: callback
    }
}

function add_slider(name, label, min, max, value, step, callback) {
    const container = get_container();

    settings[name] = {
        label: createDiv(label).parent(container).class("label"),
        counter: createDiv(value).parent(container).class("counter"),
        element: createSlider(min, max, value, step).parent(container).class("element"),
        last_value: value,
        callback: callback
    };
}

function update_phase(amount) {
    phase = amount;
}

function update_width(amount) {
    graph_width = amount;
}

function balance_particles(amount) {
    let particle_difference = particles.length - amount;
    while (particle_difference > 0) {
        const index = random(particles.length - 1);
        particles.splice(index, 1);
        particle_difference = particles.length - amount;
    }

    while (particle_difference < 0) {
        const index = Math.round(random(particles.length - 1));

        let x, y;
        if (particles.length - 1 > index) {
            const neighbor = particles[index];
            x = neighbor.pos.x;
            y = neighbor.pos.y;
        } else {
            x = get_x_position(index);
        }
        particles.splice(index, 0, new Particle(settings.particle_radius.last_value, x, y));
        particle_difference = particles.length - amount;
    }

    redistribute_particles();
}

function update_radius(amount) {
    for (let particle of particles) {
        particle.r = amount;
    }
}

function get_x_position(index) {
    return (width / particles.length) * index;
}

function redistribute_particles() {
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.x = get_x_position(i);
    }
}

function settings_changed() {
    for (let setting_key of Object.keys(settings)) {
        const setting = settings[setting_key];
        const new_value = setting.element.value();
        if (setting.last_value == new_value) continue;

        if (setting.counter) setting.counter.html(new_value);
        setting.last_value = new_value;
        if (setting.callback) setting.callback(new_value);
    }
}

function draw() {
    settings_changed();
    background(0);
    translate(0, height / 2);

    let index = 0;
    for (let particle of particles) {
        particle.calculate();
        particle.draw();

        let { x, y } = particle;
        let relative_x = map(x, 0, width, 0, graph_width);
        relative_x += phase * frameCount;
        if (particles.indexOf(particle) === 1) {
            console.log(graph_width, relative_x); 
        }
        
        const algorithm_string = settings.algorithm.last_value;
        let algorithm_result;
        try {
            algorithm_result = eval(algorithm_string.replace(/X/g, relative_x).replace(/I/g, index));
        } catch {}
        if (algorithm_result == null || isNaN(algorithm_result)) algorithm_result = 0;
        y = algorithm_result * settings.graph_height.last_value;
        particle.y = y;
        index++;
    }
}