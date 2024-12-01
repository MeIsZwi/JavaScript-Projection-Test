const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const cw = canvas.width
const ch = canvas.height

var mousePos = {
    x: 0,
    y: 0
}

canvas.addEventListener("mousemove", (event) => {
    mousePos = {
        x:  event.x,
        y:  event.y
    };
});

//3D Vector class:
function Vector(x,y,z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

Vector.prototype.add = function(addend) {
    this.x += addend.x;
    this.y += addend.y;
    this.z += addend.z;
};

Vector.prototype.sub = function(sub) {
    this.x -= sub.x;
    this.y -= sub.y;
    this.z -= sub.z;
};

var triBuffer = [];

//Mesh class for 3D objects:
function Mesh(verts,faces) {
    this.verts = verts || [
        new Vector(-0.5,-0.5,-0.5), // front top left
        new Vector(0.5,-0.5,-0.5), // front top right
        new Vector(-0.5,0.5,-0.5), // front bottom left
        new Vector(0.5,0.5,-0.5), // front bottom right
        new Vector(-0.5,-0.5,0.5), // back top left
        new Vector(0.5,-0.5,0.5), // back top right
        new Vector(-0.5,0.5,0.5), // back bottom left
        new Vector(0.5,0.5,0.5)// back bottom right
    ];
    this.faces = faces || [
        [0,1,2,"#ff0000"], //front
        [2,1,3,"#ff0000"],
        [0,1,4,"#ee0000"], //top
        [4,5,1,"#ee0000"],
        [2,3,6,"#ff0000"], //bottom
        [6,3,7,"#ee0000"],
        [4,5,6,"#cc0000"], //back
        [6,5,7,"#cc0000"],
        [0,2,4,"#ff0000"], //left
        [4,2,6,"#ee0000"],
        [1,3,5,"#ff0000"], //right
        [5,3,7,"#ee0000"]
    ];
}

Mesh.prototype.translate = function(vector) {
    for(var vertI = 0; vertI < this.verts.length; vertI++) {
        this.verts[vertI].add(vector)
    };
};

Mesh.prototype.rotateY = function(angle) {
    for(var vertI = 0; vertI < this.verts.length; vertI++) {
        var vert = this.verts[vertI]
        this.verts[vertI] = new Vector(
            vert.x * Math.cos(angle) - vert.z * Math.sin(angle),
            vert.y,
            vert.x * Math.sin(angle) + vert.z * Math.cos(angle)
        )
    };
};

Mesh.prototype.rotateX = function(angle) {
    for(var vertI = 0; vertI < this.verts.length; vertI++) {
        var vert = this.verts[vertI]
        this.verts[vertI] = new Vector(
            vert.x,
            vert.z * Math.sin(angle) + vert.y * Math.cos(angle),
            vert.z * Math.cos(angle) - vert.y * Math.sin(angle)
        )
    };
};

Mesh.prototype.project = function(focalLength) {
    for(var vertI = 0; vertI < this.verts.length; vertI++) {
        var vert = this.verts[vertI]
        this.verts[vertI] = new Vector(
            vert.x / vert.z * focalLength + cw/2,
            vert.y / vert.z * focalLength + ch/2,
            vert.z
        )
    };
};

Mesh.prototype.draw = function() {
    this.faces.forEach(face => {
        var p1 = this.verts[face[0]]
        var p2 = this.verts[face[1]]
        var p3 = this.verts[face[2]]
        var clr = face[3]

        if(p1.z > 0 && p2.z > 0 && p3.z > 0) {
            var avgZ = (p1.z + p2.z + p3.z) / 3 //Average Z position of all verts

            triBuffer.push([
                p1,
                p2,
                p3,
                avgZ, //Add it here so that the renderer knows the order to draw in
                clr
            ])
        }
    });
};

const sounds = {
    "walk": new Audio("sounds/walk.mp3")
};

const images = [
    document.getElementById("wall"),
    document.getElementById("wall2"),
    document.getElementById("wall3"),
    document.getElementById("door"),
    document.getElementById("stephen")
];

function drawTris() {
    for(var i = 0; i < triBuffer.length; i++) {
        for(var trI = 1; trI < triBuffer.length; trI++) {
            var preTri = triBuffer[trI - 1];
            var tri = triBuffer[trI];
            
            if(tri[3] > preTri[3]) {
                var temp = tri;
                triBuffer[trI - 1] = temp;
                triBuffer[trI] = preTri;
            }
        }
    }

    for(var trI = 0; trI < triBuffer.length; trI++) {
        ctx.beginPath();
        
        var tri = triBuffer[trI];

        region = new Path2D();

        region.moveTo(tri[0].x,tri[0].y);
        region.lineTo(tri[1].x,tri[1].y);
        region.lineTo(tri[2].x,tri[2].y);
        region.lineTo(tri[0].x,tri[0].y);

        region.closePath();

        ctx.fillStyle = tri[4];
        ctx.fill(region);
    }
}

var angleY = 0;
var angleX = 0;
var zoom = -3

canvas.addEventListener('mousemove', function(event) {
    if(event.buttons == 1) {
        angleY += event.movementX / cw * Math.PI;
        angleX -= event.movementY / ch * Math.PI;
    }
    if(event.buttons == 2) {
        zoom += event.movementY / ch * 5;
    }
});

function draw() {
    ctx.clearRect(0,0,cw,ch);

    var cube = new Mesh(); //Create a new

    cube.rotateY(angleY*2);
    cube.rotateX(angleX*2);
    cube.translate(new Vector(0, 0, -zoom));

    cube.project(150 * (cw/400)); //Project it into 2D
    cube.draw(); //Add it to the buffer to be drawn

    drawTris(); //draw all the tris in the buffer
    triBuffer = [];

    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);