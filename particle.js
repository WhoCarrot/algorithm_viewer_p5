class Dynamic {
    constructor(acceleration_speed, max_velocity, value) {
        this.acceleration_speed = acceleration_speed;
        this.max_velocity = max_velocity;
        this.velocity = createVector(0, 0);
        this.value = value;
        this.desired = value.copy();
    }
}

class Particle { 
    constructor(radius, x, y) {
        this.position = createVector(x != null ? x : 0, y != null ? y : 0);
        this.radius = createVector(radius);

        this.dynamics = {
            moving: new Dynamic(.02, 1, this.position),
            sizing: new Dynamic(.02, 1, this.radius)
        }
    }

    get pos() {
        return { 
            x: this.dynamics.moving.value.x,
            y: this.dynamics.moving.value.y
        }
    }

    get x() {
        return this.dynamics.moving.value.x;
    }

    set x(value) {
        this.dynamics.moving.desired.x = value;
    }

    get y() {
        return this.dynamics.moving.value.y;
    }

    set y(value) {
        this.dynamics.moving.desired.y = value;
    }

    get r() {
        return this.dynamics.sizing.value.x;
    }

    set r(value) {
        this.dynamics.sizing.desired.x = value;
    }

    apply_dynamic() {
        for (let dynamic_key of Object.keys(this.dynamics)) {
            const dynamic = this.dynamics[dynamic_key];

            // Skip this dynamic if we are already there (-0.05 to prevent floating number precision errors)
            const distance_from_desired = Math.abs(dynamic.value.dist(dynamic.desired));
            if (distance_from_desired - 0.05 <= 0) continue;

            // Calculate direction and create an accelleration vector steering towards the desired value
            let acceleration = createVector(0, 0);
            const dx = Math.round(dynamic.desired.x - dynamic.value.x);
            dynamic.value.x += dx * dynamic.acceleration_speed;
            // if (dx > 0) acceleration.x = dynamic.acceleration_speed;
            // else if (dx < 0) acceleration.x = -dynamic.acceleration_speed;

            const dy = Math.round(dynamic.desired.y - dynamic.value.y);
            dynamic.value.y += dy * dynamic.acceleration_speed;
            // if (dy > 0) acceleration.y = dynamic.acceleration_speed;
            // else if (dy < 0) acceleration.y = dynamic.acceleration_speed;

            // Apply the forces
            dynamic.velocity.add(acceleration);
            dynamic.velocity.limit(dynamic.max_velocity);
            dynamic.value.add(dynamic.velocity);
        }
    }

    calculate() {
        for (let dynamic of Object.values(this.dynamics)) this.apply_dynamic(dynamic);
    }

    draw() {
        noStroke();
        fill(255);
        circle(this.x, this.y, this.r);
    }
}