
function GetTransform(positionX, positionY, rotation, scale) {
    var rad = rotation * (Math.PI / 180); 
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);
    
    return [
        cos * scale, sin * scale, 0,
        -sin * scale, cos * scale, 0,
        positionX, positionY, 1
    ];
}


function ApplyTransform(trans1, trans2) {
    var result = new Array(9);
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            result[row * 3 + col] = 0;
            for (var i = 0; i < 3; i++) {
                result[row * 3 + col] += trans1[row * 3 + i] * trans2[i * 3 + col];
            }
        }
    }
    return result;
}

function resetTransform() {
    drone.positionX = 0;
    drone.positionY = 0;
    drone.rotation = 0;
    drone.scale = 1.5;
    drone.altitude = 0;
    UpdateTrans();
}


function boostSpeed() {
    var originalSpeed = drone.altitude * 0.25;
    drone.altitude += 20; 
    setTimeout(function () {
        drone.altitude = originalSpeed; 
    }, 5000);
}


function hoverMode() {
    drone.altitude = 50; 
    drone.scale = 1.5;   
    ground.positionX = 0; 
    ground.positionY = 0;
    UpdateTrans();
}

function mouseMovement() {
    if (drone.altitude !== 50) { 
        drone.positionX = event.clientX;
        drone.positionY = event.clientY;
        UpdateTrans();
    }
}


document.addEventListener("mousemove", mouseMovement, false);

function UpdateTrans() {
    var s = document.getElementById('shadow');
    var a = drone.altitude * drone.scale;
    s.style.transform = "translate(" + a + "px," + a + "px) translate(" + drone.positionX + "px," + drone.positionY + "px) rotate(" + drone.rotation + "deg) scale(" + drone.scale + ")";
    s.style.filter = "blur(" + (drone.altitude * 0.5) + "px)";

    var m = GetTransform(drone.positionX, drone.positionY, drone.rotation, drone.scale);
    var b = document.getElementById('drone');
    b.style.transform = "matrix(" + m[0] + "," + m[1] + "," + m[3] + "," + m[4] + "," + m[6] + "," + m[7] + ")";

    var offset = [
        { x: -51, y: -51 },
        { x: 51, y: -51 },
        { x: -51, y: 51 },
        { x: 51, y: 51 },
    ];

    for (var i = 0; i < 4; ++i) {
        var p = document.getElementById('propeller' + i);
        var r = Math.random() * 360;
        var t = GetTransform(offset[i].x, offset[i].y, r, 1);
        t = ApplyTransform(t, m);
        p.style.transform = "matrix(" + t[0] + "," + t[1] + "," + t[3] + "," + t[4] + "," + t[6] + "," + t[7] + ")";
    }

    var px = drone.positionX + ground.positionX * drone.scale;
    var py = drone.positionY + ground.positionY * drone.scale;
    document.body.style.backgroundPosition = px + "px " + py + "px";
    document.body.style.backgroundSize = (drone.scale * 1600) + "px";
}

setInterval(function () {
    var speed = drone.altitude * 0.25;
    var angle = drone.rotation * Math.PI / 180;
    var velX = -Math.sin(angle) * speed;
    var velY = Math.cos(angle) * speed;
    ground.positionX += velX;
    ground.positionY += velY;
    
    var sx = 1600;
    var sy = sx;
    
    if (ground.positionX < 0) ground.positionX += sx;
    if (ground.positionY < 0) ground.positionY += sy;
    if (ground.positionX > sx) ground.positionX -= sx;
    if (ground.positionY > sy) ground.positionY -= sy;

    UpdateTrans();
}, 15);
