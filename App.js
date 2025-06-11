let rectP;
let t = 0
const dt = 0.125;

function setup() {
    createCanvas(innerWidth, innerHeight);
    p5.disableFriendlyErrors = true;
    angleMode(RADIANS);

    rectP = new Rocket(innerWidth / 2, innerHeight - 40, 40, 60);
}

function draw() {
    background(135, 206, 235)

    rectP.draw();
    for (let i = 0; i <= 7; i++) {
        rectP.engine.update();
        rectP.update();

        /*if(t >= 500){
            frameRate(0)
        }*/

        t += dt;
    }
}

class Rocket {
    constructor(x, y, w, h) {
        this.w = w;
        this.h = h;
        this.mass = w*h; //
        this.inertia = (this.mass * (Math.pow(this.h, 2) + Math.pow(this.w, 2))) / 12

        this.angle = radians(0);
        this.pos = createVector(x, y);

        this.acc = createVector(0, 0)
        this.vel = createVector(0, 0); // velocity
        this.a_acc = 0;
        this.vel_a = 0; // angular velocity
        this.torque = 0;

        this.engine = new Engine(this, createVector(0, 30), radians(-90));
    }

    applyForce(_point, _force) {
        push()
        translate(this.pos.x, this.pos.y)

        const point = rotateVec(_point, this.angle)

        let force = _force
        //important line
        if (point.mag() > 0) { force = rotateVec(_force, this.angle) }

        let nvv = force.copy().normalize().mult(55)

        const center = createVector(0, 0)
        /*fill(0)
        ellipse(point.x, point.y, 5)
        line(point.x, point.y, point.x+nvv.x, point.y+nvv.y)*/

        const r = p5.Vector.sub(point, center);
        const angleBetween = r.angleBetween(force)

        this.acc = force.copy().div(this.mass);

        this.torque = r.mag() * force.copy().mag() * sin(angleBetween);
        this.a_acc = (this.torque / (this.inertia));
        pop()
    }

    gravity() {
        //this.vel.y += 9.8 / 45
    }

    update() {
        //Euler-Richardson algorithm
    
        let velmid = this.vel.copy().add(this.acc.copy().mult(0.5 * dt))
        let velamid = this.vel_a + this.a_acc * 0.5 * dt

        this.pos.add(velmid.mult(dt));
        this.angle += velamid * dt;

        this.vel.add(this.acc.copy().mult(dt))
        //this.vel.x=0
        this.vel_a += this.a_acc * dt;
        //this.engine.rotate(0.01)

        this.acc = createVector(0, 0)
        this.a_acc = 0
    }

    draw() {
        push()
        this.drawInfo();
        //body
        translate(this.pos.x, this.pos.y)
        push()
        rotate(this.angle)
        rect(-(this.w / 2), -(this.h / 2), this.w, this.h);
        //engine
        triangle(0, this.h / 2, -10, (this.h / 2) + 10, +10, (this.h / 2) + 10)
        pop()
        //local plane
        line(0, 55, 0, -55)
        line(55, 0, -55, 0)
        pop()
    }

    drawInfo() {
        text('Velocidad: ' + Math.sqrt((this.vel.x * this.vel.x) + (this.vel.y * this.vel.y)).toFixed(2), 1100, 10)
        text('Velocidad angular: ' + this.vel_a.toFixed(2), 1100, 25)
        text('Inertia: ' + (this.inertia).toFixed(2), 1100, 40)
        text('Torque: ' + this.torque.toFixed(2), 1100, 55)
        text('Velocidad x: ' + this.vel.x.toFixed(2), 1100, 70)
        text('Velocidad y: ' + this.vel.y.toFixed(2), 1100, 85)
        text('Angulo: ' + this.angle.toFixed(2), 1100, 100)
        text('altura: ' + (innerHeight - this.pos.y).toFixed(2), 1100, 115)
        text('Delta x: ' + (this.pos.x-innerWidth/2).toFixed(2), 1100, 130)
    }
}

class Engine{
    constructor(parent, iPos, iAngle){
        this.parent = parent;
        this.angle = iAngle;
        this.pos = iPos;
        this.force = 30;
        this.gimbalRange = 15;  // degrees to each side
        this.power = 1;
    }

    update(){
        this.parent.applyForce(this.pos, p5.Vector.fromAngle(this.angle, this.force));
    }

    rotate(aVel){
        this.angle += aVel*dt;
    }
}

function rotateVec(vector, a) {
    // |cos(a) -sin(a)|
    // |sin(a)  cos(a)|
    let matrixRow1 = createVector(cos(a), -sin(a))
    let matrixRow2 = createVector(sin(a), cos(a))

    let rVecX = p5.Vector.dot(vector.copy(), matrixRow1)
    let rVecY = p5.Vector.dot(vector.copy(), matrixRow2)

    return createVector(rVecX, rVecY);
}

function drawGrid() {
    push()
    stroke('rgba(0,0,0,0.2)')
    for (let i = 0; i < innerWidth; i += 10) {
        for (let j = 0; j < innerHeight; j += 10) {
            line(0, j, innerWidth, j)
        }
        line(i, 0, i, innerHeight)
    }
    pop()
}
